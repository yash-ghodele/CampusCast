/**
 * @file admin/src/app/api/scheduler/route.ts
 * @description Automated Notice Lifecycle Scheduler Route Handler.
 * 
 * Provides automated notice state transitions:
 * 1. Promotes notices from `status: 'scheduled'` to `status: 'active'` when `scheduledAt <= Date.now()`.
 * 2. Retires notices from `status: 'active'` to `status: 'expired'` when `expiresAt <= Date.now()`.
 * 
 * Invoked periodically via Vercel Cron or administrative health-check probes.
 */

import { NextRequest } from 'next/server';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  writeBatch,
  doc,
} from 'firebase/firestore';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Executes a deterministic notice lifecycle state synchronization batch against Cloud Firestore.
 *
 * @returns Execution statistics detailing timestamp, promoted notice count, and expired notice count
 */
async function processLifecycle() {
  const now = Date.now();
  let promotedCount = 0;
  let expiredCount = 0;

  // Process Scheduled Notices
  try {
    const scheduledQ = query(
      collection(db, 'notices'),
      where('status', '==', 'scheduled'),
      where('scheduledAt', '<=', now)
    );
    const scheduledSnap = await getDocs(scheduledQ);

    if (!scheduledSnap.empty) {
      const batch = writeBatch(db);
      scheduledSnap.docs.forEach((d) => {
        batch.update(doc(db, 'notices', d.id), { status: 'active' });
        promotedCount++;
      });
      await batch.commit();
      console.log(`[CampusCast Scheduler] Promoted ${promotedCount} scheduled notices to active.`);
    }
  } catch (err) {
    console.warn('[CampusCast Scheduler] Error querying scheduled notices:', err);
  }

  // Process Expired Active Notices
  try {
    const expiredQ = query(
      collection(db, 'notices'),
      where('status', '==', 'active'),
      where('expiresAt', '<=', now)
    );
    const expiredSnap = await getDocs(expiredQ);

    if (!expiredSnap.empty) {
      const batch = writeBatch(db);
      expiredSnap.docs.forEach((d) => {
        batch.update(doc(db, 'notices', d.id), { status: 'expired' });
        expiredCount++;
      });
      await batch.commit();
      console.log(`[CampusCast Scheduler] Expired ${expiredCount} past active notices.`);
    }
  } catch (err) {
    console.warn('[CampusCast Scheduler] Error querying expired notices:', err);
  }

  return {
    success: true,
    timestamp: now,
    iso: new Date(now).toISOString(),
    promotedCount,
    expiredCount,
  };
}

/**
 * Handles HTTP GET requests to trigger notice lifecycle evaluation.
 *
 * @param req - Incoming Next.js HTTP request
 * @returns JSON response with lifecycle execution statistics
 */
export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get('authorization');
  const vercelCronHeader = req.headers.get('x-vercel-cron');

  // Strict authorization in production mode
  if (process.env.NODE_ENV === 'production') {
    const isAuthorized =
      (cronSecret && authHeader === `Bearer ${cronSecret}`) ||
      vercelCronHeader === '1' ||
      (cronSecret && req.headers.get('x-cron-secret') === cronSecret);

    if (!isAuthorized) {
      return Response.json(
        { error: 'Unauthorized: Missing or invalid scheduler authorization' },
        { status: 401 }
      );
    }
  } else if (cronSecret) {
    if (authHeader !== `Bearer ${cronSecret}` && req.headers.get('x-cron-secret') !== cronSecret) {
      return Response.json({ error: 'Unauthorized: Invalid cron secret' }, { status: 401 });
    }
  }

  const result = await processLifecycle();
  return Response.json(result, {
    status: 200,
    headers: { 'Cache-Control': 'no-store, max-age=0' },
  });
}

/**
 * Handles HTTP POST requests as an alias for scheduled webhook invocations.
 *
 * @param req - Incoming Next.js HTTP request
 * @returns JSON response with lifecycle execution statistics
 */
export async function POST(req: NextRequest) {
  return GET(req);
}
