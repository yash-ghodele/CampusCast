/**
 * @file display/src/lib/firebase.ts
 * @description Cloud Firestore Realtime Notice Subscriber & Telemetry Client for Display Kiosks.
 */

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, query, where, onSnapshot } from 'firebase/firestore';
import { Notice } from '@campuscast/shared';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'campuscast.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'campuscast-demo',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'campuscast.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:123456789:web:abcdef'
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
    const q = query(
      collection(db, 'notices'),
      where('departmentId', '==', departmentCode.toUpperCase()),
      where('status', '==', 'active')
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
