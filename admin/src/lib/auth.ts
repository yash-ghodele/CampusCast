/**
 * @file admin/src/lib/auth.ts
 * @description CampusCast Faculty & Notice Sender Authentication Service.
 * 
 * Enforces institutional Gmail authentication restricted strictly to the `@mit.asia` domain.
 * Supports self-registration of faculty profiles where department scopes and administrative
 * privileges are subsequently reviewed, approved, and allotted by the Super Admin.
 */

import { User } from '@campuscast/shared';
import { verifyMasterSecurityPin } from './security';
import { saveUserToFirestore, saveAuditToFirestore } from './firebase';

/** Institutional domain required for all notice senders */
export const REQUIRED_FACULTY_DOMAIN = '@mit.asia';

/**
 * Standard Seed Faculty Roster with institutional @mit.asia accounts.
 */
export const SEED_FACULTY_ROSTER: User[] = [
  {
    id: 'usr-ece-sharma',
    name: 'Dr. Ramesh Sharma',
    email: 'ramesh.sharma@mit.asia',
    phone: '+919876543210',
    role: 'faculty',
    departments: ['ECE'],
    status: 'active',
    registeredAt: 1724284800000,
  },
  {
    id: 'usr-cse-roy',
    name: 'Prof. Ananya Roy',
    email: 'ananya.roy@mit.asia',
    phone: '+919876543211',
    role: 'hod',
    departments: ['CSE'],
    status: 'active',
    registeredAt: 1724284800000,
  },
  {
    id: 'usr-aiml-malhotra',
    name: 'Dr. Vikram Malhotra',
    email: 'vikram.malhotra@mit.asia',
    phone: '+919876543212',
    role: 'faculty',
    departments: ['AIML'],
    status: 'active',
    registeredAt: 1724284800000,
  },
  {
    id: 'usr-multi-verma',
    name: 'Prof. Sunita Verma',
    email: 'sunita.verma@mit.asia',
    phone: '+919876543213',
    role: 'faculty',
    departments: ['ECE', 'CSE'],
    status: 'active',
    registeredAt: 1724284800000,
  },
  {
    id: 'usr-admin-master',
    name: 'Principal / Chief Admin',
    email: 'principal@mit.asia',
    phone: '+919876543200',
    role: 'super_admin',
    departments: ['ECE', 'CSE', 'AIML', 'MECH', 'CIVIL', 'EEE'],
    status: 'active',
    registeredAt: 1724284800000,
  },
];

const AUTH_STORAGE_KEY = 'campuscast_auth_user';

/**
 * Checks if an email belongs to the required institutional `@mit.asia` domain.
 *
 * @param email - Target email string to validate
 * @returns Boolean flag indicating domain compliance
 */
export function isValidMitAsiaEmail(email: string): boolean {
  if (!email) return false;
  const trimmed = email.trim().toLowerCase();
  return trimmed.endsWith(REQUIRED_FACULTY_DOMAIN) && trimmed.length > REQUIRED_FACULTY_DOMAIN.length;
}

/**
 * Normalizes phone numbers to standard E.164 format (+91XXXXXXXXXX).
 *
 * @param input - Raw user entered phone number
 * @returns Clean normalized E.164 phone string
 */
export function normalizePhoneNumber(input: string): string {
  const digits = input.replace(/\D/g, '');
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+${digits}`;
  }
  if (input.startsWith('+')) {
    return `+${digits}`;
  }
  return digits ? `+${digits}` : '';
}

/**
 * Retrieves the currently authenticated notice sender session from localStorage.
 *
 * @returns User object or null if not logged in
 */
export function getStoredAuthUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (raw) {
      const user = JSON.parse(raw);
      if (user && user.id && user.name) {
        return user as User;
      }
    }
  } catch (err) {
    console.warn('Error reading stored auth user:', err);
  }
  return null;
}

/**
 * Persists an authenticated notice sender session to localStorage and broadcasts the state.
 *
 * @param user - Authenticated faculty user profile
 */
export function setStoredAuthUser(user: User): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    if (typeof BroadcastChannel !== 'undefined') {
      const ch = new BroadcastChannel('campuscast-auth-channel');
      ch.postMessage({ type: 'AUTH_LOGIN', user });
      ch.close();
    }
  } catch (err) {
    console.warn('Error saving auth user:', err);
  }
}

/**
 * Clears the active notice sender session and broadcasts logout.
 */
export function clearStoredAuthUser(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    if (typeof BroadcastChannel !== 'undefined') {
      const ch = new BroadcastChannel('campuscast-auth-channel');
      ch.postMessage({ type: 'AUTH_LOGOUT' });
      ch.close();
    }
  } catch (err) {
    console.warn('Error clearing auth user:', err);
  }
}

export interface VerificationResult {
  success: boolean;
  user?: User;
  error?: string;
  isPending?: boolean;
  notRegistered?: boolean;
}

/**
 * Verifies a faculty member's institutional Gmail address (`@mit.asia`) and security PIN.
 *
 * @param email - Institutional Gmail address (e.g. ramesh.sharma@mit.asia)
 * @param pin - Security PIN (default 123456 or configured PIN)
 * @param liveUsers - Optional live roster from Cloud Firestore snapshot
 * @returns VerificationResult containing success flag, user record, or descriptive error
 */
export async function verifySenderCredentialsByEmail(
  email: string,
  pin: string,
  liveUsers: User[] = []
): Promise<VerificationResult> {
  const normalizedEmail = email.trim().toLowerCase();

  // Strict domain enforcement: must end in @mit.asia
  if (!isValidMitAsiaEmail(normalizedEmail)) {
    return {
      success: false,
      error: `Access Denied: Notice sender login requires an official institutional Gmail account ending with @mit.asia (e.g. xxx.yyy@mit.asia). Commercial domains like @gmail.com or @yahoo.com are strictly prohibited.`,
    };
  }

  // Pool users from live Firestore and fallback roster
  const candidatePool = [...liveUsers, ...SEED_FACULTY_ROSTER];

  // Match by institutional email
  const user = candidatePool.find((u) => {
    return u.email && u.email.trim().toLowerCase() === normalizedEmail;
  });

  if (!user) {
    return {
      success: false,
      notRegistered: true,
      error: `Account Not Registered: The email (${normalizedEmail}) was not found in the authorized faculty database. Please use the "Create Faculty Profile" tab below to register. Your department access will be decided and allotted by the Super Admin.`,
    };
  }

  if (user.status === 'suspended') {
    return {
      success: false,
      error: `Access Revoked: Notice publishing privileges for ${user.name} (${normalizedEmail}) have been suspended by college administration.`,
    };
  }

  if (user.status === 'pending') {
    return {
      success: false,
      isPending: true,
      user,
      error: `Access Pending Super Admin Allotment: Faculty profile for ${user.name} (${normalizedEmail}) has been created successfully, but your departmental publishing scope has not been allotted yet. Please contact the Super Admin to approve your account.`,
    };
  }

  // Verify PIN (accepts configured master PIN or default 123456)
  const trimmedPin = pin.trim();
  const isPinValid = verifyMasterSecurityPin(trimmedPin) || trimmedPin === '123456';

  if (!isPinValid) {
    return {
      success: false,
      error: 'Invalid Security PIN! Please enter your 6-digit campus security PIN (default: 123456).',
    };
  }

  return {
    success: true,
    user,
  };
}

/**
 * Registers a new faculty member profile with an `@mit.asia` institutional email.
 * New profiles are placed into `status: 'pending'` with no allotted departments until Super Admin reviews and allots access.
 *
 * @param name - Faculty member full name
 * @param email - Institutional Gmail address ending in @mit.asia
 * @param phone - Mobile number for WhatsApp sync
 * @param requestedDept - Primary department requested by faculty
 * @param liveUsers - Existing users to check for duplicate accounts
 * @returns VerificationResult with the newly created pending user profile
 */
export async function registerFacultyProfile(
  name: string,
  email: string,
  phone: string,
  requestedDept: string,
  liveUsers: User[] = []
): Promise<VerificationResult> {
  const normalizedEmail = email.trim().toLowerCase();

  if (!isValidMitAsiaEmail(normalizedEmail)) {
    return {
      success: false,
      error: `Invalid Email Domain: Registration requires an institutional Gmail account ending with @mit.asia (e.g. xxx.yyy@mit.asia).`,
    };
  }

  const formattedPhone = normalizePhoneNumber(phone);
  if (!formattedPhone || formattedPhone.length < 10) {
    return {
      success: false,
      error: 'Please enter a valid 10-digit mobile number for WhatsApp notification sync.',
    };
  }

  // Check duplicate email or phone
  const duplicate = liveUsers.find(
    (u) =>
      (u.email && u.email.toLowerCase() === normalizedEmail) ||
      (u.phone && normalizePhoneNumber(u.phone) === formattedPhone)
  );

  if (duplicate) {
    return {
      success: false,
      error: `An account already exists for ${duplicate.email || duplicate.phone}. Please log in instead or contact Super Admin.`,
    };
  }

  const newUser: User = {
    id: `usr-${Date.now()}`,
    name: name.trim(),
    email: normalizedEmail,
    phone: formattedPhone,
    role: 'faculty',
    departments: [], // Explicitly empty until Super Admin decides access!
    status: 'pending', // Pending Super Admin access control review
    requestedDepartment: requestedDept.toUpperCase(),
    registeredAt: Date.now(),
  };

  // Persist to Cloud Firestore
  await saveUserToFirestore(newUser);

  // Record audit trail of profile registration
  const auditLog = {
    id: `aud-reg-${Date.now()}`,
    type: 'profile_registration' as any,
    actorPhone: formattedPhone,
    detail: {
      action: 'Faculty Profile Self-Registration',
      name: newUser.name,
      email: newUser.email,
      requestedDepartment: requestedDept,
      status: 'pending_super_admin_allotment',
    },
    timestamp: Date.now(),
  };
  await saveAuditToFirestore(auditLog);

  return {
    success: true,
    user: newUser,
  };
}
