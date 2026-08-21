import { onSchedule } from 'firebase-functions/v2/scheduler';
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Scheduled Cloud Function running every minute to manage notice status lifecycles:
 * 1. Promotes "scheduled" notices -> "active" once scheduledAt is reached.
 * 2. Demotes "active" notices -> "expired" once expiresAt is reached.
 */
export const scheduledNoticeManager = onSchedule('every 1 minutes', async () => {
  const now = Date.now();

  // 1. Promote scheduled notices
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

  // 2. Expire past notices
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
