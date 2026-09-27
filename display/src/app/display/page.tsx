/**
 * @file apps/display/src/app/display/page.tsx
 * @description General All-Campus Digital Signage Display Page (`/display`).
 */

'use client';

import DepartmentDisplayPage from './[deptId]/page';

export default function GeneralDisplayPage() {
  return <DepartmentDisplayPage />;
}
