/**
 * @file display/src/lib/firebase.ts
 * @description Cloud Firestore Realtime Notice Subscriber & Telemetry Client for Display Kiosks.
 */

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, query, where, onSnapshot } from 'firebase/firestore';
import { Notice } from '@campuscast/shared';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || ''
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);

export type ListenerStatus = 'connected' | 'reconnecting' | 'error';

export function subscribeToDepartmentNotices(
  departmentCode: string,
  onUpdate: (notices: Notice[]) => void,
  onStatusChange?: (status: ListenerStatus) => void
) {
  try {
    const deptUpper = departmentCode.toUpperCase();
    const q = deptUpper === 'ALL'
      ? query(
          collection(db, 'notices'),
          where('status', '==', 'active')
        )
      : query(
          collection(db, 'notices'),
          where('status', '==', 'active'),
          where('departmentId', 'in', [deptUpper, 'ALL'])
        );

    if (onStatusChange) onStatusChange('connected');

    return onSnapshot(
      q,
      (snapshot) => {
        const notices: Notice[] = [];
        snapshot.forEach((doc) => {
          notices.push({ id: doc.id, ...doc.data() } as Notice);
        });
        onUpdate(notices);
      },
      (error) => {
        console.warn('Firestore notice snapshot listener error:', error);
        if (onStatusChange) onStatusChange('reconnecting');
      }
    );
  } catch (err) {
    console.warn('Failed to initialize Firestore listener:', err);
    if (onStatusChange) onStatusChange('reconnecting');
    return () => {};
  }
}

/**
 * Reports screen telemetry heartbeat to Firestore for cross-origin and physical TV monitoring.
 */
export async function sendScreenHeartbeatToFirestore(screenId: string, departmentId: string) {
  try {
    const { doc, setDoc } = await import('firebase/firestore');
    const screenRef = doc(db, 'screens', screenId);
    await setDoc(screenRef, { id: screenId, departmentId, lastSeenAt: Date.now() }, { merge: true });
  } catch (err) {
    console.warn('Firestore heartbeat telemetry write error:', err);
  }
}

