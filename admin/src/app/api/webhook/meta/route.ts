/**
 * @file admin/src/app/api/webhook/meta/route.ts
 * @description Inbound Meta WhatsApp Cloud API Webhook Route Handler (Dual-Gateway Architecture).
 * 
 * ZERO-COST SERVERLESS ARCHITECTURE:
 * Works side-by-side with the Twilio Sandbox route (`/api/webhook/twilio`).
 * Bypasses Firebase Blaze requirements by serving Meta webhooks directly on Vercel Serverless.
 * Supports:
 * - GET: Webhook verification challenge handshake (`hub.challenge`)
 * - POST: Signed WhatsApp Business JSON payload processing & notice creation
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
  User,
  NoticeStatus,
} from '@campuscast/shared';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'campuscast_verify_token_123';
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || '';

/**
 * Dispatches an outbound confirmation message to faculty WhatsApp via Meta Graph API if token is configured.
 */
async function sendMetaGraphReply(phoneNumberId: string, toPhone: string, textMessage: string) {
  if (!WHATSAPP_ACCESS_TOKEN || !phoneNumberId) {
    console.log(`[Meta Reply Simulation] To: ${toPhone} -> ${textMessage}`);
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
 * GET: Handles Meta Developer Portal Webhook Verification Handshake.
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
 * POST: Ingests inbound Meta WhatsApp message payloads.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

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
          const rawText = message.text?.body || '';

          if (!senderPhone || !rawText.trim()) continue;

          // STEP 1: Phone Authorization Lookup
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
            console.warn(`[Meta Webhook] Unauthorized publish attempt: ${senderPhone}`);
            await addDoc(collection(db, 'audit_log'), {
              type: 'unauthorized_attempt',
              actorPhone: senderPhone,
              detail: { rawText, reason: 'Sender not found in active roster' },
              timestamp: Date.now(),
            });
            continue; // Silent drop
          }

          const userData = userDoc.data() as User;

          // STEP 2: Tag & Scope Parsing
          const parsed = parseNoticeMessage(rawText);
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

          // STEP 3: Write Notice Document
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

          // STEP 4: Write Audit Log
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

          // STEP 5: Confirmation Reply
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
