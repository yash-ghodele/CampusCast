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
      <body className="bg-[#0F172A] text-[#F8FAFC] min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
