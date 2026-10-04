/**
 * @file apps/display/src/app/display/[deptId]/page.tsx
 * @description Department Fullscreen Live Notice Display Client (`/display/[deptId]`).
 */

'use client';

export const dynamic = 'force-dynamic';

import React from 'react';
import { useParams } from 'next/navigation';
import { DepartmentDisplayView } from '@/components/DepartmentDisplayView';

export default function DepartmentDisplayPage() {
  const params = useParams();
  const rawDeptCode = (params?.deptId as string) || 'ALL';
  const deptCode = rawDeptCode.toUpperCase();

  return <DepartmentDisplayView deptCode={deptCode} />;
}
