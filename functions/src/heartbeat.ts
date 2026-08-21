import { onRequest } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Screen Heartbeat API Endpoint
 * Accepts POST { screenId: string } and updates screens/{screenId}.lastSeenAt
 */
export const screenHeartbeat = onRequest({ cors: true }, async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const { screenId } = req.body || {};

  if (!screenId || typeof screenId !== 'string') {
    res.status(400).json({ error: 'screenId is required' });
    return;
  }

  try {
    const screenRef = db.collection('screens').doc(screenId);
    const screenDoc = await screenRef.get();

    const now = Date.now();

    if (!screenDoc.exists) {
      // Auto-register screen if not present
      await screenRef.set({
        departmentId: 'ECE', // default fallback
        label: `Display Screen ${screenId}`,
        lastSeenAt: now
      });
    } else {
      await screenRef.update({ lastSeenAt: now });
    }

    res.status(200).json({ success: true, timestamp: now });
  } catch (error: any) {
    console.error('Heartbeat error:', error);
    res.status(500).json({ error: error.message });
  }
});
