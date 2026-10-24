/**
 * @file admin/src/lib/firebase.ts
 * @description Cloud Firestore Client & Real-time State Synchronization Service for Admin Command Center.
 * 
 * Provides typed data-access methods and real-time snapshot listeners for notices,
 * faculty user authorization rosters, corridor display telemetry, and audit event logs.
 */

import { initializeApp, getApps } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
} from 'firebase/firestore';
import { Notice, AuditLog, User, Department } from '@campuscast/shared';

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
 * Persists or updates a notice document in Cloud Firestore.
 *
 * @param notice - Complete notice entity to write or merge
 * @returns Promise that resolves once the Firestore write is committed
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
 * Permanently removes a notice document from Cloud Firestore.
 *
 * @param noticeId - Unique Firestore document identifier of the target notice
 * @returns Promise that resolves once the document is deleted
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
 * Establishes a real-time snapshot subscription to all notices in Cloud Firestore.
 *
 * @param onUpdate - Callback invoked with the synchronized array of notices
 * @returns Unsubscribe function to release the real-time listener
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
 * Appends an immutable audit event entry to the Firestore `audit_log` collection.
 *
 * @param log - Audit log record documenting administrator or system action
 * @returns Promise that resolves once the audit record is committed
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
 * Subscribes to the immutable audit event trail from Cloud Firestore `audit_log` collection.
 *
 * @param onUpdate - Callback invoked with the sorted array of audit events (newest first)
 * @returns Unsubscribe function to release the real-time listener
 */
export function subscribeToAuditLogs(onUpdate: (logs: AuditLog[]) => void) {
  try {
    const q = query(collection(db, 'audit_log'));
    return onSnapshot(
      q,
      (snapshot) => {
        const logs: AuditLog[] = [];
        snapshot.forEach((docSnap) => {
          logs.push({ id: docSnap.id, ...(docSnap.data() as any) } as AuditLog);
        });
        logs.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        onUpdate(logs);
      },
      (err) => {
        console.warn('Firestore audit logs subscription error:', err);
      }
    );
  } catch (err) {
    console.warn('Failed to initialize Firestore audit logs listener:', err);
    return () => {};
  }
}

/**
 * Subscribes to real-time telemetry updates for all corridor screens in Cloud Firestore.
 *
 * @param onUpdate - Callback invoked with current screen telemetry status records
 * @returns Unsubscribe function to detach the listener
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

/**
 * Transmits active heartbeat telemetry pings for screens in Cloud Firestore.
 *
 * @param screenIds - Array of registered screen identifiers to update
 * @returns Promise that resolves once heartbeats are recorded
 */
export async function pingScreensInFirestore(screenIds: string[]): Promise<void> {
  try {
    const now = Date.now();
    for (const screenId of screenIds) {
      const dept = screenId.split('-')[0] || 'ECE';
      const screenRef = doc(db, 'screens', screenId);
      await setDoc(screenRef, { id: screenId, departmentId: dept, lastSeenAt: now }, { merge: true });
    }
  } catch (err) {
    console.warn('Firestore screens ping error:', err);
  }
}

/**
 * Creates or updates an authorized faculty member in the Firestore `users` collection.
 *
 * @param user - User profile object including phone number and assigned departments
 * @returns Promise that resolves when write is complete
 */
export async function saveUserToFirestore(user: User): Promise<void> {
  try {
    const userRef = doc(db, 'users', user.id);
    await setDoc(userRef, user, { merge: true });
  } catch (err) {
    console.warn('Firestore user write error:', err);
  }
}

/**
 * Permanently removes a faculty member from the Firestore `users` collection.
 *
 * @param userId - Unique Firestore document identifier of the faculty member
 * @returns Promise that resolves when document is deleted
 */
export async function deleteUserFromFirestore(userId: string): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    await deleteDoc(userRef);
  } catch (err) {
    console.warn('Firestore user delete error:', err);
  }
}

/**
 * Subscribes to real-time changes in the authorized faculty user roster in Cloud Firestore.
 *
 * @param onUpdate - Callback receiving the latest array of authorized faculty users
 * @returns Unsubscribe function to terminate the listener
 */
export function subscribeToUsers(onUpdate: (users: User[]) => void) {
  try {
    const q = query(collection(db, 'users'));
    return onSnapshot(
      q,
      (snapshot) => {
        const usersList: User[] = [];
        snapshot.forEach((docSnap) => {
          usersList.push({ id: docSnap.id, ...(docSnap.data() as any) } as User);
        });
        onUpdate(usersList);
      },
      (err) => {
        console.warn('Firestore users subscription error:', err);
      }
    );
  } catch (err) {
    console.warn('Failed to initialize Firestore users listener:', err);
    return () => {};
  }
}

/**
 * Subscribes to real-time changes in the departments collection in Cloud Firestore.
 *
 * @param onUpdate - Callback receiving the latest array of departments
 * @returns Unsubscribe function to terminate the listener
 */
export function subscribeToDepartments(onUpdate: (departments: Department[]) => void) {
  try {
    const q = query(collection(db, 'departments'));
    return onSnapshot(
      q,
      (snapshot) => {
        const list: Department[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...(docSnap.data() as any) } as Department);
        });
        onUpdate(list);
      },
      (err) => {
        console.warn('Firestore departments subscription error:', err);
      }
    );
  } catch (err) {
    console.warn('Failed to initialize Firestore departments listener:', err);
    return () => {};
  }
}

/**
 * Persists or updates a department configuration in Cloud Firestore.
 *
 * @param department - Department profile object including HOD assignment
 * @returns Promise that resolves when write is complete
 */
export async function saveDepartmentToFirestore(department: Department): Promise<void> {
  try {
    const deptRef = doc(db, 'departments', department.id || department.code);
    await setDoc(deptRef, department, { merge: true });
  } catch (err) {
    console.warn('Firestore department write error:', err);
  }
}
