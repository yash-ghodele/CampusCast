/**
 * @file admin/src/components/AuthContext.tsx
 * @description Production Firebase Auth & Role-Based Access Control Context for CampusCast Admin.
 * 
 * Provides reactive authentication state, institutional domain validation (@mit.asia),
 * and route protection for administrative consoles.
 */

'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User } from '@campuscast/shared';
import {
  auth,
  onAuthStateChanged,
  FirebaseUser,
} from '@/lib/firebase';
import {
  getStoredAuthUser,
  setStoredAuthUser,
  clearStoredAuthUser,
  loginWithEmailPasswordFirebaseAuth,
  logoutFirebaseAuth,
  VerificationResult,
} from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  loginWithEmail: (email: string, pin: string) => Promise<VerificationResult>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  firebaseUser: null,
  loading: true,
  loginWithEmail: async () => ({ success: false, error: 'Auth context not initialized' }),
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize auth state from storage and Firebase listener
  useEffect(() => {
    // 1. Initial hydration from local storage
    const stored = getStoredAuthUser();
    if (stored) {
      setUser(stored);
    }

    // 2. Firebase Auth listener
    const unsubscribeFirebase = onAuthStateChanged(auth, (fbUser) => {
      setFirebaseUser(fbUser);
      if (!fbUser && !stored) {
        setUser(null);
      }
      setLoading(false);
    });

    // 3. Multi-tab synchronization via BroadcastChannel
    let ch: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== 'undefined') {
      ch = new BroadcastChannel('campuscast-auth-channel');
      ch.onmessage = (e) => {
        if (e.data?.type === 'AUTH_LOGIN' && e.data.user) {
          setUser(e.data.user);
        } else if (e.data?.type === 'AUTH_LOGOUT') {
          setUser(null);
          setFirebaseUser(null);
        }
      };
    }

    return () => {
      unsubscribeFirebase();
      if (ch) ch.close();
    };
  }, []);

  const loginWithEmail = async (email: string, pin: string): Promise<VerificationResult> => {
    setLoading(true);
    const result = await loginWithEmailPasswordFirebaseAuth(email, pin);
    if (result.success && result.user) {
      setUser(result.user);
    }
    setLoading(false);
    return result;
  };

  const logout = async (): Promise<void> => {
    await logoutFirebaseAuth();
    setUser(null);
    setFirebaseUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        loginWithEmail,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * Route Guard wrapper for protected administrative pages.
 * Redirects unauthenticated visitors to `/login?redirect=...`.
 */
export function RouteGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Public routes that do not require authentication
    if (pathname === '/login' || pathname.startsWith('/api/')) {
      return;
    }

    if (!loading && !user) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [user, loading, router, pathname]);

  // Loading & unauthenticated redirect state
  if ((loading || !user) && pathname !== '/login' && !pathname.startsWith('/api/')) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-3 border-[#2563EB]/20 border-t-[#2563EB] rounded-full animate-spin" />
        <p className="text-xs font-bold text-[#64748B]">Verifying Institutional Credentials...</p>
      </div>
    );
  }

  return <>{children}</>;
}
