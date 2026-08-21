import { onRequest } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import * as crypto from 'crypto';
import { parseNoticeMessage, User, Notice, AuditLog } from '@campuscast/shared';

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'campuscast_verify_token_123';
const WHATSAPP_APP_SECRET = process.env.WHATSAPP_APP_SECRET || '';
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || '';

/**
 * Validates HMAC SHA-256 signature from Meta WhatsApp Cloud API
 */
function isValidMetaSignature(rawBody: string | Buffer, signatureHeader: string | undefined): boolean {
  if (!WHATSAPP_APP_SECRET) {
    // If secret is not set in dev/emulator environment, bypass signature check
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
 * Sends a WhatsApp message reply via Meta Cloud API
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
 * Main Webhook Handler for WhatsApp Business Cloud API
 */
export const whatsappWebhook = onRequest({ cors: true }, async (req, res) => {
  // 1. GET: Webhook verification challenge
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === WHATSAPP_VERIFY_TOKEN) {
      console.log('Webhook verified successfully.');
      res.status(200).send(challenge);
      return;
    } else {
      res.status(403).send('Forbidden: Invalid verify token');
      return;
    }
  }

  // 2. POST: Inbound Message Ingestion
  if (req.method === 'POST') {
    // Signature Check (HARD REQUIREMENT per RULES.md)
    const signature = req.headers['x-hub-signature-256'] as string | undefined;
    const rawBody = req.rawBody || JSON.stringify(req.body);

    if (!isValidMetaSignature(rawBody, signature)) {
      console.warn('Rejected webhook request: Invalid X-Hub-Signature-256');
      res.status(403).send('Invalid signature');
      return;
    }

    const body = req.body;

    // Check if this is a WhatsApp message event
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
          const rawSenderPhone = message.from; // e.g. "919876543210"
          const senderPhone = rawSenderPhone.startsWith('+') ? rawSenderPhone : `+${rawSenderPhone}`;
          
          // Only process text messages in MVP
          if (message.type !== 'text') {
            continue;
          }

          const rawText = message.text?.body || '';

          // Step A: Sender Authorization Check
          const userQuery = await db.collection('users')
            .where('phone', '==', senderPhone)
            .where('status', '==', 'active')
            .limit(1)
            .get();

          if (userQuery.empty) {
            // UNAUTHORIZED SENDER — HARD REQUIREMENT: Log & Drop SILENTLY (No WhatsApp reply)
            console.warn(`Unauthorized publish attempt blocked from phone: ${senderPhone}`);
            
            await db.collection('audit_log').add({
              type: 'unauthorized_attempt',
              actorPhone: senderPhone,
              detail: { rawText, reason: 'Number not in active users list' },
              timestamp: Date.now()
            } as Omit<AuditLog, 'id'>);

            continue;
          }

          const userDoc = userQuery.docs[0];
          const user = userDoc.data() as User;

          // Step B: Message Parsing
          const parsed = parseNoticeMessage(rawText);

          // Step C: Department Resolution
          let targetDeptCode = parsed.departmentCode;

          if (!targetDeptCode) {
            if (user.departments && user.departments.length === 1) {
              targetDeptCode = user.departments[0];
            } else if (user.departments && user.departments.length > 1) {
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

          // Verify department exists
          const deptQuery = await db.collection('departments')
            .where('code', '==', targetDeptCode.toUpperCase())
            .limit(1)
            .get();

          let deptId = targetDeptCode.toUpperCase();
          if (!deptQuery.empty) {
            deptId = deptQuery.docs[0].id;
          }

          // Step D: Notice Document Creation
          const now = Date.now();
          const isScheduled = parsed.scheduledAt && parsed.scheduledAt > now;
          const status = isScheduled ? 'scheduled' : 'active';
          
          // Default expiry 7 days from now
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

          // Step E: Write Audit Log
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

          // Step F: Dispatch Confirmation Reply
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
