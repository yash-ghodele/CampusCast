/**
 * @file display/src/lib/firebase.ts
 * @description Cloud Firestore Real-time Subscriber & Telemetry Heartbeat Client for Corridor Smart TVs.
 * 
 * Manages low-latency snapshot listeners for active department announcements and periodic
 * screen heartbeat reporting back to Cloud Firestore for fleet monitoring.
 */

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, query, where, onSnapshot } from 'firebase/firestore';
import { Notice } from '@campuscast/shared';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDUreGuw2jiFaHAlhjllUJ1h1IMVIonGKo',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'campuscast-mitece.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'campuscast-mitece',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'campuscast-mitece.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '950390430359',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:950390430359:web:d4a738f951367c2f37a7d2',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);

/**
 * Connection telemetry states for the real-time Firestore snapshot listener.
 */
export type ListenerStatus = 'connected' | 'reconnecting' | 'error';

/**
 * Subscribes a physical Smart TV display to real-time active notices filtered by department scope.
 *
 * @param departmentCode - Target department identifier (e.g. 'ECE', 'CSE', or 'ALL' for campus-wide)
 * @param onUpdate - Callback invoked whenever active notices are created, updated, or retired
 * @param onStatusChange - Optional callback signaling network connection lifecycle states
 * @returns Unsubscribe function to release the Firestore snapshot listener
 */
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
 * Reports physical Smart TV screen telemetry heartbeat to Cloud Firestore for uptime monitoring.
 *
 * @param screenId - Hardware terminal identifier (e.g. 'ECE-MAIN-DISPLAY')
 * @param departmentId - Department zone where the display terminal is mounted
 * @returns Promise that resolves once heartbeat write is committed
 */
export async function sendScreenHeartbeatToFirestore(screenId: string, departmentId: string): Promise<void> {
  try {
    const { doc, setDoc } = await import('firebase/firestore');
    const screenRef = doc(db, 'screens', screenId);
    await setDoc(screenRef, { id: screenId, departmentId, lastSeenAt: Date.now() }, { merge: true });
  } catch (err) {
    console.warn('Firestore heartbeat telemetry write error:', err);
  }
}
