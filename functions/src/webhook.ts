/**
 * @file functions/src/webhook.ts
 * @description Inbound WhatsApp Business Cloud API Webhook Cloud Function.
 * 
 * NEED FOR THIS FILE:
 * Serves as the central serverless entry point for receiving WhatsApp message events from Meta.
 * It enforces payload integrity, verifies faculty publishing authorization, parses message content,
 * writes notices to Firestore via the Firebase Admin SDK, and dispatches automated feedback replies.
 */

import { onRequest } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import * as crypto from 'crypto';
import { parseNoticeMessage, User, Notice, AuditLog } from '@campuscast/shared';

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// Environment configuration & Meta credentials
const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'campuscast_verify_token_123';
const WHATSAPP_APP_SECRET = process.env.WHATSAPP_APP_SECRET || '';
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || '';

/**
 * Validates HMAC SHA-256 signature from Meta WhatsApp Cloud API (`X-Hub-Signature-256`).
 * 
 * NEED & SECURITY RATIONALE:
 * Prevents unauthorized third parties from forging webhook HTTP requests to post notices.
 * 
 * WORKING MECHANISM:
 * Computes an HMAC SHA-256 hash over the raw HTTP request body using the Meta App Secret,
 * then performs a constant-time comparison (`crypto.timingSafeEqual`) against the header hash.
 * 
 * @param rawBody Raw HTTP request body Buffer or string
 * @param signatureHeader Inbound `X-Hub-Signature-256` HTTP header string
 * @returns boolean True if signature matches or secret is unconfigured in local dev
 */
function isValidMetaSignature(rawBody: string | Buffer, signatureHeader: string | undefined): boolean {
  if (!WHATSAPP_APP_SECRET) {
    // In local emulator/dev mode without app secret, bypass signature check with warning
    return true;
  }
  if (!signatureHeader || !signatureHeader.startsWith('sha256=')) {
    return false;
  }
  const expectedHash = signatureHeader.substring(7);
  const hmac = crypto.createHmac('sha256', WHATSAPP_APP_SECRET);
  const calculatedHash = hmac.update(rawBody).digest('hex');

  try {
    return crypto.timingSafeEqual(Buffer.from(expectedHash, 'hex'), Buffer.from(calculatedHash, 'hex'));
  } catch {
    return false;
  }
}

/**
 * Dispatches an automated confirmation or error reply back to the faculty member's WhatsApp.
 * 
 * NEED:
 * Provides immediate feedback to the faculty member so they know their notice is live on screen.
 * 
 * WORKING MECHANISM:
 * Calls Meta's Graph API `/messages` endpoint using an institutional access token.
 * 
 * @param phoneNumberId Meta business phone number ID
 * @param toPhone Recipient faculty phone number (E.164 format)
 * @param textMessage Feedback text content
 */
async function sendWhatsAppReply(phoneNumberId: string, toPhone: string, textMessage: string): Promise<void> {
  if (!WHATSAPP_ACCESS_TOKEN) {
    console.log(`[DEV/SIMULATION] WhatsApp Reply to ${toPhone}: ${textMessage}`);
    return;
  }

  try {
    const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;
    await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: toPhone.replace('+', ''),
        type: 'text',
        text: { body: textMessage }
      })
    });
  } catch (error) {
    console.error('Failed to send WhatsApp message reply:', error);
  }
}

/**
 * HTTPS Cloud Function: `whatsappWebhook`
 * 
 * WORKING MECHANISM:
 * 1. GET requests: Handshakes with Meta's webhook setup process via token challenge verification.
 * 2. POST requests: Processes inbound WhatsApp messages:
 *    a. Enforces HMAC signature verification (`X-Hub-Signature-256`).
 *    b. Extracts sender E.164 phone number.
 *    c. Performs authorization check against `users` collection.
 *    d. SILENTLY DROPS unauthorized numbers (logs to `audit_log` with zero reply to prevent phone enumeration).
 *    e. Parses tags (`#urgent`, `#schedule`, `DEPT:`).
 *    f. Resolves department routing and checks for multi-department ambiguity.
 *    g. Writes notice document to Firestore (`notices`) via Admin SDK (bypassing security rules).
 *    h. Logs publication event to `audit_log`.
 *    i. Sends confirmation WhatsApp reply.
 */
export const whatsappWebhook = onRequest({ cors: true }, async (req, res) => {
  // 1. GET HANDSHAKE: Webhook verification challenge during initial Meta developer portal setup
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === WHATSAPP_VERIFY_TOKEN) {
      console.log('Meta Webhook verified successfully.');
      res.status(200).send(challenge);
      return;
    } else {
      res.status(403).send('Forbidden: Invalid verify token');
      return;
    }
  }

  // 2. POST INGESTION: Process inbound WhatsApp message payload
  if (req.method === 'POST') {
    // STEP A: Signature Verification Check
    const signature = req.headers['x-hub-signature-256'] as string | undefined;
    const rawBody = req.rawBody || JSON.stringify(req.body);

    if (!isValidMetaSignature(rawBody, signature)) {
      console.warn('Rejected webhook request: Invalid X-Hub-Signature-256');
      res.status(403).send('Invalid signature');
      return;
    }

    const body = req.body;

    // Confirm payload format matches Meta's WhatsApp business account structure
    if (!body || body.object !== 'whatsapp_business_account') {
      res.status(200).send('EVENT_RECEIVED');
      return;
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
          const rawSenderPhone = message.from; // Sender number string e.g. "919876543210"
          const senderPhone = rawSenderPhone.startsWith('+') ? rawSenderPhone : `+${rawSenderPhone}`;
          
          // Only process text messages in core MVP pipeline
          if (message.type !== 'text') {
            continue;
          }

          const rawText = message.text?.body || '';

          // STEP B: Sender Authorization Check
          // Need: Verifies sender's phone number is registered in institutional roster with 'active' status.
          const userQuery = await db.collection('users')
            .where('phone', '==', senderPhone)
            .where('status', '==', 'active')
            .limit(1)
            .get();

          if (userQuery.empty) {
            // SECURITY REQUIREMENT: Log attempt and drop SILENTLY (No WhatsApp reply)
            // Prevents unauthorized senders from probing registered numbers.
            console.warn(`Unauthorized publish attempt blocked from phone: ${senderPhone}`);
            
            await db.collection('audit_log').add({
              type: 'unauthorized_attempt',
              actorPhone: senderPhone,
              detail: { rawText, reason: 'Number not in active roster' },
              timestamp: Date.now()
            } as Omit<AuditLog, 'id'>);

            continue;
          }

          const userDoc = userQuery.docs[0];
          const user = userDoc.data() as User;

          // STEP B.2: Inbound Webhook Sliding-Window Rate Limiting
          // Need: Prevents spamming or compromised faculty devices from flooding hallway screens.
          // Working: Checks audit_log for recent publish entries from senderPhone in the past 60 seconds. Max 5/min.
          const oneMinuteAgo = Date.now() - 60000;
          const rateLimitQuery = await db.collection('audit_log')
            .where('actorPhone', '==', senderPhone)
            .where('timestamp', '>=', oneMinuteAgo)
            .get();

          if (rateLimitQuery.size >= 5) {
            console.warn(`Rate limit exceeded for sender: ${senderPhone}`);
            await db.collection('audit_log').add({
              type: 'unauthorized_attempt',
              actorPhone: senderPhone,
              detail: { rawText, reason: 'Rate limit exceeded (max 5 notices per minute)' },
              timestamp: Date.now()
            } as Omit<AuditLog, 'id'>);
            continue;
          }

          // STEP C: Message Parsing
          // Uses shared parser engine to extract priority, scheduled dates, and department prefixes
          const parsed = parseNoticeMessage(rawText);

          // STEP D: Department Scope & Ambiguity Resolution
          let targetDeptCode = parsed.departmentCode;

          if (!targetDeptCode) {
            if (user.departments && user.departments.length === 1) {
              // Single assigned department scope fallback
              targetDeptCode = user.departments[0];
            } else if (user.departments && user.departments.length > 1) {
              // Ambiguous department scope — ask faculty member for explicit prefix clarification
              const deptsList = user.departments.join(', ');
              await sendWhatsAppReply(
                phoneNumberId,
                senderPhone,
                `❌ Department ambiguous. Please prefix your message with your target department code (e.g. ECE:). Your assigned departments: ${deptsList}`
              );
              continue;
            } else {
              await sendWhatsAppReply(
                phoneNumberId,
                senderPhone,
                `❌ You do not have permission for any department.`
              );
              continue;
            }
          }

          // Verify department code exists in collection
          const deptQuery = await db.collection('departments')
            .where('code', '==', targetDeptCode.toUpperCase())
            .limit(1)
            .get();

          let deptId = targetDeptCode.toUpperCase();
          if (!deptQuery.empty) {
            deptId = deptQuery.docs[0].id;
          }

          // STEP E: Notice Document Creation in Firestore
          const now = Date.now();
          const isScheduled = parsed.scheduledAt && parsed.scheduledAt > now;
          const status = isScheduled ? 'scheduled' : 'active';
          
          // Default notice expiry set to 7 days from publish/scheduled time
          const expiresAt = (parsed.scheduledAt || now) + (7 * 24 * 60 * 60 * 1000);

          const noticeRef = await db.collection('notices').add({
            departmentId: deptId,
            content: parsed.content,
            mediaUrl: null,
            mediaType: null,
            priority: parsed.priority,
            status,
            createdBy: senderPhone,
            createdAt: now,
            scheduledAt: parsed.scheduledAt,
            expiresAt
          } as Omit<Notice, 'id'>);

          // STEP F: Write Immutable Audit Log Entry
          await db.collection('audit_log').add({
            type: 'publish',
            actorPhone: senderPhone,
            detail: {
              noticeId: noticeRef.id,
              departmentId: deptId,
              priority: parsed.priority,
              status
            },
            timestamp: now
          } as Omit<AuditLog, 'id'>);

          // STEP G: Dispatch Confirmation Reply to Faculty Member
          if (isScheduled) {
            const dateStr = new Date(parsed.scheduledAt!).toLocaleString();
            await sendWhatsAppReply(
              phoneNumberId,
              senderPhone,
              `🕒 Scheduled for ${targetDeptCode.toUpperCase()} on ${dateStr}.`
            );
          } else {
            await sendWhatsAppReply(
              phoneNumberId,
              senderPhone,
              `✅ Posted to ${targetDeptCode.toUpperCase()} — visible now.`
            );
          }
        }
      }
    }

    res.status(200).send('EVENT_RECEIVED');
  }
});
