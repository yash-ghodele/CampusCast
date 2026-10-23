/**
 * @file admin/src/app/api/webhook/twilio/route.ts
 * @description Inbound Twilio WhatsApp Webhook Route Handler for CampusCast.
 * 
 * ZERO-COST SERVERLESS ARCHITECTURE:
 * Replaces paid Firebase Cloud Functions with Vercel Serverless Route Handler.
 * Bypasses Firebase Blaze pay-as-you-go requirement and provides unrestricted outbound HTTPS.
 * Handles Twilio WhatsApp Sandbox payloads (x-www-form-urlencoded), performs faculty phone
 * authorization against Firestore `users`, deterministically parses tags via @campuscast/shared,
 * writes notice documents to Firestore `notices`, logs to `audit_log`, and returns instant TwiML XML.
 */

import { NextRequest } from 'next/server';
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
  User,
  NoticeStatus,
} from '@campuscast/shared';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Health check & status inspector for browser/monitoring pings.
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
 * Inbound webhook processor for Twilio WhatsApp Sandbox messages.
 */
export async function POST(req: NextRequest) {
  try {
    let from = '';
    let body = '';
    let numMedia = 0;
    let mediaUrl0: string | null = null;
    let mediaContentType0: string | null = null;

    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const json = await req.json();
      from = json.From || json.from || '';
      body = json.Body || json.body || '';
      numMedia = parseInt(json.NumMedia || json.numMedia || '0', 10);
      mediaUrl0 = json.MediaUrl0 || json.mediaUrl0 || null;
      mediaContentType0 = json.MediaContentType0 || json.mediaContentType0 || null;
    } else {
      const formData = await req.formData();
      from = (formData.get('From') as string) || '';
      body = (formData.get('Body') as string) || '';
      numMedia = parseInt((formData.get('NumMedia') as string) || '0', 10);
      mediaUrl0 = (formData.get('MediaUrl0') as string) || null;
      mediaContentType0 = (formData.get('MediaContentType0') as string) || null;
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

    // STEP 1: Faculty Phone Authorization Check
    const usersRef = collection(db, 'users');
    const userQ = query(usersRef, where('phone', '==', senderPhone));
    const userSnap = await getDocs(userQ);

    let userDoc = userSnap.docs.find((d) => (d.data() as User).status === 'active');

    // Fallback: check without leading '+' in case phone is formatted as local
    if (!userDoc && senderPhone.startsWith('+')) {
      const altPhone = senderPhone.substring(1);
      const altQ = query(usersRef, where('phone', '==', altPhone));
      const altSnap = await getDocs(altQ);
      userDoc = altSnap.docs.find((d) => (d.data() as User).status === 'active');
    }

    if (!userDoc) {
      // SECURITY MANDATE: Silent drop for unauthorized senders to prevent phone enumeration
      console.warn(`[CampusCast Webhook] Unauthorized publish attempt blocked: ${senderPhone}`);
      
      try {
        await addDoc(collection(db, 'audit_log'), {
          type: 'unauthorized_attempt',
          actorPhone: senderPhone,
          detail: { rawText: body, reason: 'Sender phone not in active faculty roster' },
          timestamp: Date.now(),
        });
      } catch (logErr) {
        console.warn('Failed to record unauthorized audit entry:', logErr);
      }

      // Return empty TwiML (no WhatsApp reply sent)
      return new Response(
        '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
        { status: 200, headers: { 'Content-Type': 'text/xml; charset=utf-8' } }
      );
    }

    const userData = userDoc.data() as User;

    // STEP 2: Rate Limiting Check (Max 10 notices / min per sender)
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
      // Non-fatal if index not yet created
    }

    // STEP 3: Deterministic Tag & Message Parsing
    const parsed = parseNoticeMessage(body);

    // STEP 4: Department Scope & Ambiguity Resolution
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

    // STEP 5: Media Attachment Processing
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

    // STEP 6: Notice Document Construction & Write to Firestore
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

    // STEP 7: Audit Log Ledger Recording
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

    // STEP 8: Return Instant TwiML XML Response to Deliver WhatsApp Confirmation
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
