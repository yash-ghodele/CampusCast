import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CampusCast — Digital Notice Display',
  description: 'Real-time department digital notice board display client',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#0B1220] text-[#F5F7FA] antialiased">
        {children}
      </body>
    </html>
  );
}
