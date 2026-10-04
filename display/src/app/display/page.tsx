/**
 * @file apps/display/src/app/display/page.tsx
 * @description General All-Campus Digital Signage Display Page (`/display`).
 */

'use client';

export const dynamic = 'force-dynamic';

import React from 'react';
import { DepartmentDisplayView } from '@/components/DepartmentDisplayView';

export default function GeneralDisplayPage() {
  return <DepartmentDisplayView deptCode="ALL" />;
}
