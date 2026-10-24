/**
 * @file display/src/app/display/page.tsx
 * @description General Campus-Wide Digital Signage Display Route (`/display`).
 * 
 * Mounts the fullscreen DepartmentDisplayView with `deptCode="ALL"`, aggregating
 * cross-department broadcasts across campus.
 */

'use client';

export const dynamic = 'force-dynamic';

import React from 'react';
import { DepartmentDisplayView } from '@/components/DepartmentDisplayView';

export default function GeneralDisplayPage() {
  return <DepartmentDisplayView deptCode="ALL" />;
}
