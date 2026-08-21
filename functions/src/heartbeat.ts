/**
 * @file functions/src/heartbeat.ts
 * @description Screen Heartbeat Telemetry API Endpoint Cloud Function.
 * 
 * NEED FOR THIS FILE:
 * Allows hardware/web display clients to report operational heartbeats periodically.
 * Administrators use these telemetry updates in the Admin Portal to monitor screen health
 * and detect offline displays across campus corridors.
 */

import { onRequest } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * HTTPS Cloud Function: `screenHeartbeat`
 * Accepts POST requests containing `{ screenId: string }`.
 * 
 * WORKING MECHANISM:
 * 1. Validates inbound payload and extracts screenId.
 * 2. Checks `screens/{screenId}` document in Firestore.
 * 3. Updates `lastSeenAt` timestamp to Date.now().
 * 4. Auto-registers screen document if first time seen.
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
      // Auto-register screen document on first telemetry contact
      await screenRef.set({
        departmentId: 'ECE', // Default initial fallback assignment
        label: `Display Screen ${screenId}`,
        lastSeenAt: now
      });
    } else {
      // Update existing screen lastSeenAt timestamp
      await screenRef.update({ lastSeenAt: now });
    }

    res.status(200).json({ success: true, timestamp: now });
  } catch (error: any) {
    console.error('Heartbeat telemetry error:', error);
    res.status(500).json({ error: error.message });
  }
});
