/**
 * @file admin/src/app/api/webhook/meta/route.ts
 * @description Inbound Meta WhatsApp Cloud API Webhook Route Handler (Dual-Gateway Architecture).
 * 
 * Provides native webhook handling for the official Meta WhatsApp Cloud API:
 * - GET: Webhook verification challenge handshake (`hub.challenge`)
 * - POST: Signed WhatsApp Business JSON payload processing, authorization lookup, and notice ingestion
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
  maskPhoneNumber,
  User,
  NoticeStatus,
} from '@campuscast/shared';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'campuscast_verify_token_123';
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || '';
const META_APP_SECRET = process.env.META_APP_SECRET || process.env.WHATSAPP_APP_SECRET || '';

/**
 * Validates Meta WhatsApp Cloud API HMAC-SHA256 signature against the app secret.
 *
 * @param appSecret - Meta App Secret from environment variables
 * @param headerSignature - Inbound `X-Hub-Signature-256` HTTP header value
 * @param rawPayload - Raw text body of the incoming webhook request
 * @returns Boolean flag indicating whether signature matches
 */
function verifyMetaSignature(
  appSecret: string,
  headerSignature: string | null,
  rawPayload: string
): boolean {
  if (!headerSignature || !appSecret) return false;
  const parts = headerSignature.split('=');
  if (parts.length !== 2 || parts[0] !== 'sha256') return false;
  const expectedHash = parts[1];

  const hmac = crypto.createHmac('sha256', appSecret).update(rawPayload, 'utf-8').digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(expectedHash, 'hex'), Buffer.from(hmac, 'hex'));
  } catch {
    return false;
  }
}

/**
 * Dispatches an outbound confirmation message to the faculty member via Meta Graph API.
 *
 * @param phoneNumberId - Meta WhatsApp business phone number ID
 * @param toPhone - Recipient phone number in international E.164 format
 * @param textMessage - Confirmation or error notification message content
 */
async function sendMetaGraphReply(phoneNumberId: string, toPhone: string, textMessage: string) {
  if (!WHATSAPP_ACCESS_TOKEN || !phoneNumberId) {
    console.log(`[Meta Reply Simulation] To: ${maskPhoneNumber(toPhone)} -> ${textMessage}`);
    return;
  }

  try {
    const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;
    await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: toPhone.replace('+', ''),
        type: 'text',
        text: { body: textMessage },
      }),
    });
  } catch (err) {
    console.warn('Failed to send Meta WhatsApp reply:', err);
  }
}

/**
 * Handles the Meta Developer Portal Webhook Verification Handshake.
 *
 * @param req - Incoming Next.js HTTP request with `hub.mode`, `hub.verify_token`, and `hub.challenge`
 * @returns Plaintext response echoing `hub.challenge` on success, or HTTP 403 Forbidden
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === WHATSAPP_VERIFY_TOKEN) {
    console.log('[Meta Webhook Handshake] Verified successfully.');
    return new Response(challenge || '', { status: 200, headers: { 'Content-Type': 'text/plain' } });
  }

  return new Response('Forbidden: Invalid verification token', { status: 403 });
}

/**
 * Ingests inbound Meta WhatsApp Cloud API message payloads.
 *
 * @param req - Incoming Next.js HTTP request containing Meta WhatsApp JSON payload
 * @returns HTTP 200 acknowledgment response to prevent retry cycles
 */
export async function POST(req: NextRequest) {
  try {
    const rawText = await req.text();

    // Security Gate: Verify X-Hub-Signature-256 HMAC if META_APP_SECRET is configured
    if (META_APP_SECRET) {
      const signatureHeader = req.headers.get('x-hub-signature-256');
      const isValid = verifyMetaSignature(META_APP_SECRET, signatureHeader, rawText);
      if (!isValid) {
        console.warn('[CampusCast Meta Webhook] Blocked request with invalid X-Hub-Signature-256.');
        return new Response('Forbidden: Invalid signature', { status: 403 });
      }
    } else if (process.env.NODE_ENV === 'production') {
      console.warn('[CampusCast Meta Webhook] Warning: META_APP_SECRET is not configured in production environment.');
    }

    let body: any = null;
    try {
      body = JSON.parse(rawText);
    } catch {
      return new Response('Invalid JSON', { status: 400 });
    }

    if (!body || body.object !== 'whatsapp_business_account') {
      return new Response('EVENT_RECEIVED', { status: 200 });
    }

    const entries = body.entry || [];
    for (const entry of entries) {
      const changes = entry.changes || [];
      for (const change of changes) {
        const value = change.value || {};
        const messages = value.messages || [];
        const metadata = value.metadata || {};
        const phoneNumberId = metadata.phone_number_id;

        for (const message of messages) {
          if (message.type !== 'text') continue;

          const rawSender = message.from || '';
          const senderPhone = rawSender.startsWith('+') ? rawSender : `+${rawSender}`;
          const rawTextBody = message.text?.body || '';

          if (!senderPhone || !rawTextBody.trim()) continue;

          // Stage 1: Phone Authorization Lookup
          const usersRef = collection(db, 'users');
          const userQ = query(usersRef, where('phone', '==', senderPhone));
          const userSnap = await getDocs(userQ);

          let userDoc = userSnap.docs.find((d) => (d.data() as User).status === 'active');

          if (!userDoc && senderPhone.startsWith('+')) {
            const altPhone = senderPhone.substring(1);
            const altQ = query(usersRef, where('phone', '==', altPhone));
            const altSnap = await getDocs(altQ);
            userDoc = altSnap.docs.find((d) => (d.data() as User).status === 'active');
          }

          if (!userDoc) {
            console.warn(`[Meta Webhook] Unauthorized publish attempt: ${maskPhoneNumber(senderPhone)}`);
            await addDoc(collection(db, 'audit_log'), {
              type: 'unauthorized_attempt',
              actorPhone: maskPhoneNumber(senderPhone),
              detail: { rawText: rawTextBody, reason: 'Sender not found in active roster' },
              timestamp: Date.now(),
            });
            continue; // Silent drop
          }

          const userData = userDoc.data() as User;

          // Stage 2: Tag & Scope Parsing
          const parsed = parseNoticeMessage(rawTextBody);
          let targetDeptCode = parsed.departmentCode;

          if (!targetDeptCode) {
            if (userData.departments && userData.departments.length === 1) {
              targetDeptCode = userData.departments[0];
            } else if (userData.departments && userData.departments.length > 1) {
              await sendMetaGraphReply(
                phoneNumberId,
                senderPhone,
                `❌ Department ambiguous. Please prefix with your target department (e.g. ECE:). Your assigned: ${userData.departments.join(', ')}`
              );
              continue;
            } else {
              targetDeptCode = 'ECE';
            }
          }

          const deptId = targetDeptCode.toUpperCase();
          const now = Date.now();
          const isScheduled = !!(parsed.scheduledAt && parsed.scheduledAt > now);
          const status: NoticeStatus = isScheduled ? 'scheduled' : 'active';
          const expiresAt = (parsed.scheduledAt || now) + (7 * 24 * 60 * 60 * 1000);
          const cleanContent = parsed.content || 'Campus Announcement';
          const noticeTitle = cleanContent.length > 55 ? `${cleanContent.slice(0, 52)}...` : cleanContent;

          // Stage 3: Write Notice Document
          const docRef = await addDoc(collection(db, 'notices'), {
            departmentId: deptId,
            title: noticeTitle,
            content: cleanContent,
            mediaUrl: null,
            mediaType: null,
            priority: parsed.priority,
            category: parsed.category || 'general',
            status,
            createdBy: senderPhone,
            authorName: userData.name || 'Faculty Member',
            createdAt: now,
            scheduledAt: parsed.scheduledAt,
            expiresAt,
          });

          // Stage 4: Write Audit Log Ledger Entry
          await addDoc(collection(db, 'audit_log'), {
            type: 'publish',
            actorPhone: senderPhone,
            actorName: userData.name,
            detail: {
              noticeId: docRef.id,
              departmentId: deptId,
              priority: parsed.priority,
              status,
              content: parsed.content,
            },
            timestamp: now,
          });

          // Stage 5: Dispatch Confirmation Reply
          const feedback = isScheduled
            ? `⏳ Notice scheduled for ${new Date(parsed.scheduledAt!).toLocaleString()} (${deptId})!`
            : `✅ Notice posted to ${deptId}! Displaying live on corridor Smart TVs.`;
          await sendMetaGraphReply(phoneNumberId, senderPhone, feedback);
        }
      }
    }

    return new Response('EVENT_RECEIVED', { status: 200 });
  } catch (error: any) {
    console.error('[Meta Webhook Error]:', error);
    return new Response('Internal error', { status: 500 });
  }
}
