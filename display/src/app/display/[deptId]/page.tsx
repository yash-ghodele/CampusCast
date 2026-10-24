/**
 * @file display/src/app/display/[deptId]/page.tsx
 * @description Dynamic Department Smart TV Display Client Route (`/display/[deptId]`).
 * 
 * Extracts dynamic route parameters (e.g. 'ece', 'cse', 'aiml', 'all') and binds the terminal
 * to the corresponding departmental notice stream.
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
