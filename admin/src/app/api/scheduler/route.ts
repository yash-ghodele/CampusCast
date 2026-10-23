/**
 * @file admin/src/app/api/scheduler/route.ts
 * @description Automated Notice Lifecycle Scheduler Route Handler.
 * 
 * ZERO-COST SERVERLESS ARCHITECTURE:
 * Replaces GCP Cloud Scheduler & Firebase Cloud Functions with Vercel Cron.
 * Runs on a 1-minute automated schedule (`* * * * *` in admin/vercel.json).
 * 
 * WORKING MECHANISM:
 * 1. Promotes notices from `status: 'scheduled'` to `status: 'active'` when `scheduledAt <= now`.
 * 2. Retires notices from `status: 'active'` to `status: 'expired'` when `expiresAt <= now`.
 * Guarantees zero screen drift and deterministic server-side notice lifecycle states.
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

async function processLifecycle() {
  const now = Date.now();
  let promotedCount = 0;
  let expiredCount = 0;

  // STEP 1: Promote Scheduled Notices
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

  // STEP 2: Expire Outdated Active Notices
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

export async function GET(req: NextRequest) {
  // Optional Vercel Cron Secret validation
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${cronSecret}`) {
      return Response.json({ error: 'Unauthorized: Invalid cron secret' }, { status: 401 });
    }
  }

  const result = await processLifecycle();
  return Response.json(result, {
    status: 200,
    headers: { 'Cache-Control': 'no-store, max-age=0' },
  });
}

export async function POST(req: NextRequest) {
  return GET(req);
}
