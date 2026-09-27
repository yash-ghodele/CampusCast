/**
 * @file apps/admin/src/lib/firebase.ts
 * @description Cloud Firestore Client & Realtime Synchronization Client for Admin Command Center.
 */

import { initializeApp, getApps } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { Notice, AuditLog, User } from '@campuscast/shared';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);

/**
 * Saves or updates a notice document directly in Firestore.
 */
export async function saveNoticeToFirestore(notice: Notice): Promise<void> {
  try {
    const noticeRef = doc(db, 'notices', notice.id);
    await setDoc(noticeRef, notice, { merge: true });
  } catch (err) {
    console.warn('Firestore notice write error:', err);
  }
}

/**
 * Deletes a notice document from Firestore.
 */
export async function deleteNoticeFromFirestore(noticeId: string): Promise<void> {
  try {
    const noticeRef = doc(db, 'notices', noticeId);
    await deleteDoc(noticeRef);
  } catch (err) {
    console.warn('Firestore notice delete error:', err);
  }
}

/**
 * Subscribes to real-time updates for all notices in the system.
 */
export function subscribeToAdminNotices(onUpdate: (notices: Notice[]) => void) {
  try {
    const q = query(collection(db, 'notices'));
    return onSnapshot(
      q,
      (snapshot) => {
        const notices: Notice[] = [];
        snapshot.forEach((doc) => {
          notices.push({ id: doc.id, ...doc.data() } as Notice);
        });
        if (notices.length > 0) {
          onUpdate(notices);
        }
      },
      (err) => {
        console.warn('Firestore admin notice listener error:', err);
      }
    );
  } catch (err) {
    console.warn('Failed to initialize admin Firestore listener:', err);
    return () => {};
  }
}

/**
 * Saves an audit event log entry to Firestore.
 */
export async function saveAuditToFirestore(log: AuditLog): Promise<void> {
  try {
    const logRef = doc(db, 'audit_log', log.id);
    await setDoc(logRef, log);
  } catch (err) {
    console.warn('Firestore audit write error:', err);
  }
}

/**
 * Subscribes to real-time telemetry updates for all screens from Firestore.
 */
export function subscribeToScreens(onUpdate: (screens: { id: string; departmentId: string; lastSeenAt: number }[]) => void) {
  try {
    const q = query(collection(db, 'screens'));
    return onSnapshot(
      q,
      (snapshot) => {
        const screensList: { id: string; departmentId: string; lastSeenAt: number }[] = [];
        snapshot.forEach((docSnap) => {
          screensList.push(docSnap.data() as any);
        });
        if (screensList.length > 0) {
          onUpdate(screensList);
        }
      },
      (err) => {
        console.warn('Firestore screens subscription error:', err);
      }
    );
  } catch (err) {
    console.warn('Failed to initialize Firestore screens listener:', err);
    return () => {};
  }
}

