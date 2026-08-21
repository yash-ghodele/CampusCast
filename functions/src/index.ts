/**
 * @file functions/src/index.ts
 * @description Central export index for CampusCast Firebase Cloud Functions.
 * 
 * Exports:
 * - `whatsappWebhook`: Inbound Meta WhatsApp webhook handler (HTTPS trigger)
 * - `scheduledNoticeManager`: Cron notice promoter/expirer (PubSub Scheduled trigger)
 * - `screenHeartbeat`: Display telemetry heartbeat API (HTTPS trigger)
 */

export { whatsappWebhook } from './webhook';
export { scheduledNoticeManager } from './scheduler';
export { screenHeartbeat } from './heartbeat';
