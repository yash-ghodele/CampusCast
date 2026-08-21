/**
 * @file functions/src/scheduler.ts
 * @description Scheduled Cloud Function for automated notice lifecycle management.
 * 
 * NEED FOR THIS FILE:
 * Notice scheduling (`#schedule`) and automatic expiry are core product requirements.
 * Managing transitions centrally backend-side ensures display screens never drift
 * or disagree on notice states, maintaining serverless authority over notice lifecycles.
 */

import { onSchedule } from 'firebase-functions/v2/scheduler';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Scheduled Cloud Function: `scheduledNoticeManager`
 * Triggers every 1 minute via GCP Cloud Scheduler.
 * 
 * WORKING MECHANISM:
 * 1. Promotes notices from `status: 'scheduled'` -> `'active'` when `scheduledAt <= currentTimestamp`.
 * 2. Demotes notices from `status: 'active'` -> `'expired'` when `expiresAt <= currentTimestamp`.
 * Uses Firestore write batches to execute status updates atomically.
 */
export const scheduledNoticeManager = onSchedule('every 1 minutes', async () => {
  const now = Date.now();

  // STEP 1: Promote Scheduled Notices to Active Status
  // Finds notices stored with status='scheduled' whose targeted scheduledAt timestamp has passed
  const scheduledQuery = await db.collection('notices')
    .where('status', '==', 'scheduled')
    .where('scheduledAt', '<=', now)
    .get();

  if (!scheduledQuery.empty) {
    const batch = db.batch();
    for (const doc of scheduledQuery.docs) {
      batch.update(doc.ref, { status: 'active' });
    }
    await batch.commit();
    console.log(`Promoted ${scheduledQuery.size} scheduled notices to active status.`);
  }

  // STEP 2: Demote Expired Notices from Active Status
  // Finds active notices whose expiration timestamp (expiresAt) has passed
  const expiredQuery = await db.collection('notices')
    .where('status', '==', 'active')
    .where('expiresAt', '<=', now)
    .get();

  if (!expiredQuery.empty) {
    const batch = db.batch();
    for (const doc of expiredQuery.docs) {
      batch.update(doc.ref, { status: 'expired' });
    }
    await batch.commit();
    console.log(`Expired ${expiredQuery.size} past active notices.`);
  }
});
