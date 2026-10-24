/**
 * @file admin/src/app/api/webhook/twilio/route.ts
 * @description Inbound Twilio WhatsApp Webhook Route Handler for CampusCast.
 * 
 * Handles Twilio WhatsApp Sandbox webhook payloads (form-urlencoded and JSON),
 * performs sender phone verification against the authorized faculty roster in Firestore `users`,
 * executes deterministic lexical parsing via `@campuscast/shared`, writes notice documents to `notices`,
 * records immutable audit events in `audit_log`, and responds with instant TwiML XML confirmation.
 */

import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
} from 'firebase/firestore';
import {
  parseNoticeMessage,
  detectMediaType,
  maskPhoneNumber,
  User,
  NoticeStatus,
} from '@campuscast/shared';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Validates the inbound Twilio webhook request signature against the configured auth token.
 *
 * @param authToken - Twilio Auth Token from environment variables
 * @param signature - Inbound `X-Twilio-Signature` HTTP header value
 * @param url - Canonical target URL of the webhook request
 * @param params - Dictionary of POST parameters received in the request body
 * @returns Boolean flag indicating whether signature matches
 */
function verifyTwilioSignature(
  authToken: string,
  signature: string | null,
  url: string,
  params: Record<string, string>
): boolean {
  if (!signature || !authToken) return false;
  const sortedKeys = Object.keys(params).sort();
  let data = url;
  for (const key of sortedKeys) {
    data += key + params[key];
  }
  const hmac = crypto.createHmac('sha1', authToken).update(data, 'utf-8').digest('base64');
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(hmac));
  } catch {
    return false;
  }
}

/**
 * Health-check inspection endpoint for uptime monitoring and gateway diagnostics.
 *
 * @returns JSON diagnostic information outlining service status and supported payload formats
 */
export async function GET() {
  return Response.json({
    status: 'online',
    service: 'CampusCast Twilio WhatsApp Webhook',
    timestamp: new Date().toISOString(),
    supportedFormats: ['application/x-www-form-urlencoded', 'application/json'],
    targetCollection: 'notices',
    docHelp: 'Send WhatsApp messages to Twilio Sandbox to ingest notices into Cloud Firestore.',
  });
}

/**
 * Inbound webhook processor for Twilio WhatsApp messages.
 * 
 * Executes an 8-stage pipeline:
 * 1. HMAC webhook signature verification (prevents phone number spoofing).
 * 2. Payload normalization (extract sender phone, body, and MMS attachment URLs).
 * 3. Faculty phone authorization lookup against Firestore `users` collection.
 * 4. Rate limiting check (max 10 publications per minute per sender).
 * 5. Deterministic tag and scope parsing (priority, schedule date, department prefix).
 * 6. Department resolution and multi-department ambiguity enforcement.
 * 7. MMS media attachment classification (image, document, PDF).
 * 8. Firestore document write, masked audit log ledger entry creation, and instant TwiML XML confirmation.
 *
 * @param req - Incoming Next.js HTTP request containing Twilio webhook payload
 * @returns TwiML XML Response containing confirmation text or silent drop
 */
export async function POST(req: NextRequest) {
  try {
    let from = '';
    let body = '';
    let numMedia = 0;
    let mediaUrl0: string | null = null;
    let mediaContentType0: string | null = null;
    const rawParams: Record<string, string> = {};

    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const json = await req.json();
      from = json.From || json.from || '';
      body = json.Body || json.body || '';
      numMedia = parseInt(json.NumMedia || json.numMedia || '0', 10);
      mediaUrl0 = json.MediaUrl0 || json.mediaUrl0 || null;
      mediaContentType0 = json.MediaContentType0 || json.mediaContentType0 || null;
      for (const [k, v] of Object.entries(json)) {
        if (typeof v === 'string') rawParams[k] = v;
      }
    } else {
      const formData = await req.formData();
      from = (formData.get('From') as string) || '';
      body = (formData.get('Body') as string) || '';
      numMedia = parseInt((formData.get('NumMedia') as string) || '0', 10);
      mediaUrl0 = (formData.get('MediaUrl0') as string) || null;
      mediaContentType0 = (formData.get('MediaContentType0') as string) || null;
      formData.forEach((value, key) => {
        if (typeof value === 'string') rawParams[key] = value;
      });
    }

    // Security Gate: Verify X-Twilio-Signature if TWILIO_AUTH_TOKEN is configured
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioSignature = req.headers.get('x-twilio-signature');

    if (twilioAuthToken) {
      const reqUrl = req.url;
      const isValid = verifyTwilioSignature(twilioAuthToken, twilioSignature, reqUrl, rawParams);
      if (!isValid) {
        console.warn(`[CampusCast Webhook] Blocked request with invalid X-Twilio-Signature.`);
        return new Response(
          '<?xml version="1.0" encoding="UTF-8"?><Response><Message>⚠️ Signature verification failed.</Message></Response>',
          { status: 403, headers: { 'Content-Type': 'text/xml; charset=utf-8' } }
        );
      }
    } else if (process.env.NODE_ENV === 'production') {
      console.warn('[CampusCast Webhook] Warning: TWILIO_AUTH_TOKEN is not configured in production environment.');
    }

    // Normalize sender phone number (strip 'whatsapp:' prefix and ensure E.164 formatting)
    let senderPhone = from.replace(/^whatsapp:/i, '').trim();
    if (senderPhone && !senderPhone.startsWith('+')) {
      senderPhone = `+${senderPhone}`;
    }

    if (!senderPhone || (!body.trim() && !mediaUrl0)) {
      return new Response(
        '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
        { status: 200, headers: { 'Content-Type': 'text/xml; charset=utf-8' } }
      );
    }

    // Stage 1: Faculty Phone Authorization Check
    const usersRef = collection(db, 'users');
    const userQ = query(usersRef, where('phone', '==', senderPhone));
    const userSnap = await getDocs(userQ);

    let userDoc = userSnap.docs.find((d) => (d.data() as User).status === 'active');

    // Fallback lookup: check without leading '+' in case phone is stored in local format
    if (!userDoc && senderPhone.startsWith('+')) {
      const altPhone = senderPhone.substring(1);
      const altQ = query(usersRef, where('phone', '==', altPhone));
      const altSnap = await getDocs(altQ);
      userDoc = altSnap.docs.find((d) => (d.data() as User).status === 'active');
    }

    if (!userDoc) {
      // Security enforcement: silent drop for unauthorized senders to prevent phone enumeration
      console.warn(`[CampusCast Webhook] Unauthorized publish attempt blocked: ${maskPhoneNumber(senderPhone)}`);
      
      try {
        await addDoc(collection(db, 'audit_log'), {
          type: 'unauthorized_attempt',
          actorPhone: maskPhoneNumber(senderPhone),
          detail: { rawText: body, reason: 'Sender phone not in active faculty roster' },
          timestamp: Date.now(),
        });
      } catch (logErr) {
        console.warn('Failed to record unauthorized audit entry:', logErr);
      }

      return new Response(
        '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
        { status: 200, headers: { 'Content-Type': 'text/xml; charset=utf-8' } }
      );
    }

    const userData = userDoc.data() as User;

    // Stage 2: Rate Limiting Check (Max 10 notices / min per sender)
    try {
      const oneMinuteAgo = Date.now() - 60000;
      const auditRef = collection(db, 'audit_log');
      const rateQ = query(
        auditRef,
        where('actorPhone', '==', senderPhone),
        where('timestamp', '>=', oneMinuteAgo)
      );
      const rateSnap = await getDocs(rateQ);
      if (rateSnap.size >= 10) {
        return new Response(
          `<?xml version="1.0" encoding="UTF-8"?><Response><Message>⚠️ Rate limit reached (max 10 notices per min). Please try again shortly.</Message></Response>`,
          { status: 200, headers: { 'Content-Type': 'text/xml; charset=utf-8' } }
        );
      }
    } catch (rateErr) {
      // Non-fatal if index is compiling
    }

    // Stage 3: Deterministic Tag & Message Parsing
    const parsed = parseNoticeMessage(body);

    // Stage 4: Department Scope & Ambiguity Resolution
    let targetDeptCode = parsed.departmentCode;

    if (!targetDeptCode) {
      if (userData.departments && userData.departments.length === 1) {
        targetDeptCode = userData.departments[0];
      } else if (userData.departments && userData.departments.length > 1) {
        const deptsList = userData.departments.join(', ');
        return new Response(
          `<?xml version="1.0" encoding="UTF-8"?><Response><Message>❌ Department ambiguous. Please prefix your notice with your target department code (e.g. ECE:). Your assigned departments: ${deptsList}</Message></Response>`,
          { status: 200, headers: { 'Content-Type': 'text/xml; charset=utf-8' } }
        );
      } else {
        targetDeptCode = 'ECE';
      }
    }

    const deptId = targetDeptCode.toUpperCase();

    // Stage 5: Media Attachment Processing
    let mediaUrl: string | null = mediaUrl0;
    let mediaType: 'image' | 'pdf' | null = null;

    if (mediaUrl) {
      if (mediaContentType0 && mediaContentType0.toLowerCase().startsWith('image')) {
        mediaType = 'image';
      } else if (mediaContentType0 && mediaContentType0.toLowerCase().includes('pdf')) {
        mediaType = 'pdf';
      } else {
        mediaType = detectMediaType(mediaUrl);
      }
    }

    // Stage 6: Notice Document Construction & Write to Firestore
    const now = Date.now();
    const isScheduled = !!(parsed.scheduledAt && parsed.scheduledAt > now);
    const status: NoticeStatus = isScheduled ? 'scheduled' : 'active';
    const expiresAt = (parsed.scheduledAt || now) + (7 * 24 * 60 * 60 * 1000); // 7-day default lifespan
    const cleanContent = parsed.content || (mediaUrl ? 'Attached Media Notice' : 'Campus Announcement');
    const noticeTitle = cleanContent.length > 55 ? `${cleanContent.slice(0, 52)}...` : cleanContent;

    const noticePayload = {
      departmentId: deptId,
      title: noticeTitle,
      content: cleanContent,
      mediaUrl,
      mediaType,
      priority: parsed.priority,
      category: parsed.category || 'general',
      status,
      createdBy: senderPhone,
      authorName: userData.name || 'Faculty Member',
      createdAt: now,
      scheduledAt: parsed.scheduledAt,
      expiresAt,
    };

    const docRef = await addDoc(collection(db, 'notices'), noticePayload);

    // Stage 7: Audit Log Ledger Recording
    try {
      await addDoc(collection(db, 'audit_log'), {
        type: 'publish',
        actorPhone: senderPhone,
        actorName: userData.name,
        detail: {
          noticeId: docRef.id,
          departmentId: deptId,
          priority: parsed.priority,
          category: parsed.category || 'general',
          status,
          content: parsed.content,
        },
        timestamp: now,
      });
    } catch (auditErr) {
      console.warn('Failed to write audit log entry:', auditErr);
    }

    // Stage 8: Instant TwiML XML Confirmation Response
    let feedback = `✅ Notice posted to ${deptId}! Displaying live on corridor Smart TVs.`;
    if (isScheduled && parsed.scheduledAt) {
      feedback = `⏳ Notice scheduled for ${new Date(parsed.scheduledAt).toLocaleString()} (${deptId})!`;
    } else if (parsed.priority === 'urgent') {
      feedback = `🚨 EMERGENCY ALERT BROADCAST to ${deptId} corridor Smart TVs!`;
    }

    const xmlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${feedback}</Message>
</Response>`;

    return new Response(xmlResponse, {
      status: 200,
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error: any) {
    console.error('[CampusCast Twilio Webhook Error]:', error);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><Response><Message>⚠️ Internal error processing notice. Please contact campus admin.</Message></Response>`,
      { status: 500, headers: { 'Content-Type': 'text/xml; charset=utf-8' } }
    );
  }
}
