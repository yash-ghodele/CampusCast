/**
 * @file admin/src/app/layout.tsx
 * @description Root HTML & Metadata Layout Shell for CampusCast Admin Command Center.
 */

import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CampusCast — Management Portal',
  description: 'Admin portal for CampusCast faculty roster, screens, and notice auditing',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#F3F4F6] text-[#111111] min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
