/**
 * @file admin/src/components/AdminProviders.tsx
 * @description Client-side context provider wrapper for CampusCast Admin Command Center.
 * 
 * Provides reactive Firebase Auth state, domain validation, and route guards across all admin pages.
 */

'use client';

import React from 'react';
import { AuthProvider, RouteGuard } from '@/components/AuthContext';

export function AdminProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <RouteGuard>{children}</RouteGuard>
    </AuthProvider>
  );
}
