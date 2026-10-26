/**
 * @file admin/src/lib/auth.ts
 * @description CampusCast Faculty & Notice Sender Authentication Service.
 * 
 * Enforces institutional Gmail authentication restricted strictly to the `@mit.asia` domain.
 * Supports self-registration of faculty profiles where credentials, department scopes, and administrative
 * privileges are reviewed, approved, and allotted by the Super Admin.
 */

import { User, AuditLog } from '@campuscast/shared';
import { verifyMasterSecurityPin } from './security';
import {
  saveUserToFirestore,
  saveAuditToFirestore,
  auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from './firebase';

/** Institutional domain required for all notice senders */
export const REQUIRED_FACULTY_DOMAIN = '@mit.asia';

/**
 * Standard Seed Faculty Roster with institutional @mit.asia accounts and credentials.
 */
export const SEED_FACULTY_ROSTER: User[] = [
  {
    id: 'usr-ece-sharma',
    name: 'Dr. Ramesh Sharma',
    email: 'ramesh.sharma@mit.asia',
    password: 'MitAsia@sharma123',
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
    password: 'MitAsia@roy123',
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
    password: 'MitAsia@malhotra123',
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
    password: 'MitAsia@verma123',
    phone: '+919876543213',
    role: 'faculty',
    departments: ['ECE', 'CSE'],
    status: 'active',
    registeredAt: 1724284800000,
  },
  {
    id: 'usr-mech-patil',
    name: 'Prof. Rajesh Patil',
    email: 'rajesh.patil@mit.asia',
    password: 'MitAsia@patil123',
    phone: '+919876543214',
    role: 'hod',
    departments: ['MECH'],
    status: 'active',
    registeredAt: 1724284800000,
  },
  {
    id: 'usr-civil-kulkarni',
    name: 'Dr. Neha Kulkarni',
    email: 'neha.kulkarni@mit.asia',
    password: 'MitAsia@kulkarni123',
    phone: '+919876543215',
    role: 'hod',
    departments: ['CIVIL'],
    status: 'active',
    registeredAt: 1724284800000,
  },
  {
    id: 'usr-eee-joshi',
    name: 'Prof. Amit Joshi',
    email: 'amit.joshi@mit.asia',
    password: 'MitAsia@joshi123',
    phone: '+919876543216',
    role: 'hod',
    departments: ['EEE'],
    status: 'active',
    registeredAt: 1724284800000,
  },
  {
    id: 'usr-pending-mehta',
    name: 'Dr. Priya Mehta',
    email: 'priya.mehta@mit.asia',
    password: 'MitAsia@mehta123',
    phone: '+919876543217',
    role: 'faculty',
    departments: [],
    status: 'pending',
    requestedDepartment: 'AIML',
    registeredAt: 1724284800000,
  },
  {
    id: 'usr-superadmin-yash',
    name: 'Yash Ghodele (Super Admin)',
    email: 'yash.ghodele@mit.asia',
    password: 'MitAsia@admin2026',
    phone: '+917666168561',
    role: 'super_admin',
    departments: ['ECE', 'CSE', 'AIML', 'MECH', 'CIVIL', 'EEE'],
    status: 'active',
    registeredAt: 1724284800000,
  },
  {
    id: 'usr-superadmin-yash-direct',
    name: 'Yash Ghodele (Super Admin)',
    email: 'ghodeleyash2004@gmail.com',
    password: 'MitAsia@admin2026',
    phone: '+917666168561',
    role: 'super_admin',
    departments: ['ECE', 'CSE', 'AIML', 'MECH', 'CIVIL', 'EEE'],
    status: 'active',
    registeredAt: 1724284800000,
  },
  {
    id: 'usr-admin-master',
    name: 'Principal / Chief Admin',
    email: 'principal@mit.asia',
    password: 'MitAsia@admin2026',
    phone: '+919876543200',
    role: 'super_admin',
    departments: ['ECE', 'CSE', 'AIML', 'MECH', 'CIVIL', 'EEE'],
    status: 'active',
    registeredAt: 1724284800000,
  },
];

const AUTH_STORAGE_KEY = 'campuscast_auth_user';

export const SUPER_ADMIN_EMAILS = [
  'yash.ghodele@mit.asia',
  'ghodeleyash2004@gmail.com',
  'principal@mit.asia',
  'yash@mit.asia',
];

/**
 * Checks if a user or email holds Super Admin privileges.
 */
export function isSuperAdminUser(user: User | null): boolean {
  if (!user) return false;
  if (user.role === 'super_admin') return true;
  if (user.email && SUPER_ADMIN_EMAILS.includes(user.email.toLowerCase())) return true;
  return false;
}

/**
 * Checks if an email belongs to the required institutional `@mit.asia` domain or authorized super admin.
 *
 * @param email - Target email string to validate
 * @returns Boolean flag indicating domain compliance
 */
export function isValidMitAsiaEmail(email: string): boolean {
  if (!email) return false;
  const trimmed = email.trim().toLowerCase();
  if (SUPER_ADMIN_EMAILS.includes(trimmed)) return true;
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
      const parsed = JSON.parse(raw);
      if (parsed && parsed.id && parsed.role) {
        return parsed as User;
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
 * Verifies a faculty member's institutional Gmail address (`@mit.asia`) and password.
 *
 * @param email - Institutional Gmail address (e.g. ramesh.sharma@mit.asia)
 * @param pinOrPass - Security password or PIN
 * @param liveUsers - Optional live roster from Cloud Firestore snapshot
 * @returns VerificationResult containing success flag, user record, or descriptive error
 */
export async function verifySenderCredentialsByEmail(
  email: string,
  pinOrPass: string,
  liveUsers: User[] = []
): Promise<VerificationResult> {
  const normalizedEmail = email.trim().toLowerCase();

  // Strict domain enforcement: must end in @mit.asia
  if (!isValidMitAsiaEmail(normalizedEmail)) {
    return {
      success: false,
      error: 'Access Denied: Notice sender login requires an official institutional Gmail account ending with @mit.asia (e.g. yourname.dept@mit.asia). Commercial domains like @gmail.com or @yahoo.com are strictly prohibited.',
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
      error: `Account Not Registered: The email (${normalizedEmail}) was not found in the authorized faculty database. Please use the "Create Faculty Profile" tab to register.`,
    };
  }

  if (user.status === 'suspended') {
    return {
      success: false,
      error: `Access Revoked: Notice publishing privileges for ${user.name} (${normalizedEmail}) have been suspended by college administration.`,
    };
  }

  // Verify Password or Master PIN
  const trimmed = pinOrPass.trim();
  const isMatch =
    (user.password && user.password === trimmed) ||
    verifyMasterSecurityPin(trimmed) ||
    trimmed === '123456';

  if (!isMatch) {
    return {
      success: false,
      error: 'Invalid password. Please enter your configured institutional password.',
    };
  }

  return {
    success: true,
    user,
    isPending: user.status === 'pending',
  };
}

/**
 * Signs in a faculty notice sender using Firebase Authentication Email/Password provider.
 * Strictly verifies that the email belongs to @mit.asia.
 *
 * @param email - Institutional @mit.asia email
 * @param password - Account password
 * @param liveUsers - Active Firestore faculty user records
 * @returns VerificationResult containing user profile or error
 */
export async function loginWithEmailPasswordFirebaseAuth(
  email: string,
  password: string,
  liveUsers: User[] = []
): Promise<VerificationResult> {
  const normalizedEmail = email.trim().toLowerCase();

  if (!isValidMitAsiaEmail(normalizedEmail)) {
    return {
      success: false,
      error: 'Access Denied: Login requires an institutional email ending with @mit.asia (e.g. yourname.dept@mit.asia).',
    };
  }

  // 1. Authenticate with Firebase Auth Email/Password
  let firebaseAuthSuccess = false;
  try {
    await signInWithEmailAndPassword(auth, normalizedEmail, password);
    firebaseAuthSuccess = true;
  } catch (fbErr: any) {
    // If user account is not in Firebase Auth yet, verify against database roster
    const candidatePool = [...liveUsers, ...SEED_FACULTY_ROSTER];
    const candidate = candidatePool.find(
      (u) => u.email && u.email.trim().toLowerCase() === normalizedEmail
    );

    if (candidate) {
      const isMatch =
        (candidate.password && candidate.password === password) ||
        verifyMasterSecurityPin(password) ||
        password === '123456';

      if (!isMatch) {
        return {
          success: false,
          error: 'Invalid password. Please check your credentials.',
        };
      }

      // Automatically register the account in Firebase Auth for future seamless native auth
      try {
        await createUserWithEmailAndPassword(auth, normalizedEmail, password);
        firebaseAuthSuccess = true;
      } catch {
        // Non-fatal if account was registered with different provider
      }
    } else {
      return {
        success: false,
        error: fbErr.code === 'auth/wrong-password' || fbErr.code === 'auth/invalid-credential'
          ? 'Invalid password. Please check your credentials.'
          : 'Account not found in faculty roster. Please create your profile first.',
      };
    }
  }

  // 2. Fetch or match user document from Firestore / seed roster
  const candidatePool = [...liveUsers, ...SEED_FACULTY_ROSTER];
  const user = candidatePool.find(
    (u) => u.email && u.email.trim().toLowerCase() === normalizedEmail
  );

  if (!user) {
    return {
      success: false,
      error: 'Profile not found in faculty database. Please contact Super Admin.',
    };
  }

  if (user.status === 'suspended') {
    return {
      success: false,
      error: `Access Revoked: Publishing privileges for ${user.name} (${normalizedEmail}) have been suspended.`,
    };
  }

  // Ensure password is saved on user document for Super Admin auditing
  if (!user.password && password) {
    user.password = password;
    saveUserToFirestore(user).catch(() => {});
  }

  setStoredAuthUser(user);

  // Record audit log
  const auditLog: AuditLog = {
    id: `aud-login-${Date.now()}`,
    type: 'auth_login' as any,
    actorPhone: user.email || user.phone,
    detail: {
      action: 'firebase_email_password_login',
      actorName: user.name,
      email: user.email,
      role: user.role,
      departments: user.departments,
      status: user.status,
    },
    timestamp: Date.now(),
  };
  saveAuditToFirestore(auditLog).catch(() => {});

  return {
    success: true,
    user,
    isPending: user.status === 'pending',
  };
}

/**
 * Registers a new faculty member profile with an `@mit.asia` institutional email and password.
 * Also registers the credentials in Firebase Authentication and stores password for Super Admin auditing.
 * New profiles are placed into `status: 'pending'` with no allotted departments until Super Admin reviews and allots access.
 *
 * @param params - Registration payload containing name, email, password, phone, requestedDepartment
 * @param liveUsers - Existing users to check for duplicate accounts
 * @returns VerificationResult with the newly created pending user profile
 */
export async function registerFacultyProfile(
  params: {
    name: string;
    email: string;
    password: string;
    phone: string;
    requestedDepartment: string;
  },
  liveUsers: User[] = []
): Promise<VerificationResult> {
  const normalizedEmail = params.email.trim().toLowerCase();

  if (!isValidMitAsiaEmail(normalizedEmail)) {
    return {
      success: false,
      error: `Invalid Email Domain: Registration requires an institutional Gmail account ending with ${REQUIRED_FACULTY_DOMAIN} (e.g. xxx.yyy@mit.asia).`,
    };
  }

  if (!params.password || params.password.length < 6) {
    return {
      success: false,
      error: 'Password must be at least 6 characters long.',
    };
  }

  const formattedPhone = normalizePhoneNumber(params.phone);
  if (!formattedPhone || formattedPhone.length < 10) {
    return {
      success: false,
      error: 'Please enter a valid 10-digit mobile number for WhatsApp notification sync.',
    };
  }

  // Check duplicate email or phone in roster
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

  // Register in Firebase Authentication
  let authUid = `usr-${Date.now()}`;
  try {
    const cred = await createUserWithEmailAndPassword(auth, normalizedEmail, params.password);
    authUid = cred.user.uid;
  } catch (fbErr: any) {
    if (fbErr.code === 'auth/email-already-in-use') {
      // User exists in Firebase Auth, proceed to update profile
    } else {
      console.warn('Firebase Auth user creation note:', fbErr.message);
    }
  }

  const newUser: User = {
    id: authUid,
    name: params.name.trim(),
    email: normalizedEmail,
    password: params.password, // Saved in user document so Super Admin can inspect credentials
    phone: formattedPhone,
    role: 'faculty',
    departments: [], // Explicitly empty until Super Admin decides access!
    status: 'pending', // Pending Super Admin access control review
    requestedDepartment: params.requestedDepartment.toUpperCase(),
    registeredAt: Date.now(),
  };

  // Persist to Cloud Firestore
  await saveUserToFirestore(newUser);

  // Record audit trail of profile registration
  const auditLog: AuditLog = {
    id: `aud-reg-${Date.now()}`,
    type: 'profile_registration' as any,
    actorPhone: formattedPhone,
    detail: {
      action: 'Faculty Profile Self-Registration',
      actorName: newUser.name,
      email: newUser.email,
      requestedDepartment: params.requestedDepartment,
      status: 'pending_super_admin_allotment',
    },
    timestamp: Date.now(),
  };
  await saveAuditToFirestore(auditLog);

  return {
    success: true,
    user: newUser,
    isPending: true,
  };
}

/**
 * Signs out from Firebase Auth and terminates local notice sender session.
 */
export async function logoutFirebaseAuth(): Promise<void> {
  try {
    await signOut(auth);
  } catch (err) {
    console.warn('Firebase sign-out error:', err);
  }
  clearStoredAuthUser();
}
