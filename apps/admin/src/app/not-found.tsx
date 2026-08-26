'use client';

import React from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowLeft } from 'lucide-react';

/**
 * Custom 404 Not Found Page for Admin App
 */
export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center p-8 select-none text-center">
      <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-10 max-w-lg w-full space-y-6 shadow-2xl">
        <div className="p-4 bg-red-500/10 text-red-400 rounded-full w-fit mx-auto border border-red-500/20">
          <AlertCircle className="w-12 h-12" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-white">Page Not Found</h2>
          <p className="text-base text-slate-400">
            The admin portal route you requested does not exist.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
