'use client';

import React from 'react';
import Link from 'next/link';
import { Monitor, ArrowRight, Shield, Radio } from 'lucide-react';

const DEPARTMENTS = [
  { code: 'ECE', name: 'Electronics & Communication Engineering', icon: '⚡' },
  { code: 'CSE', name: 'Computer Science & Engineering', icon: '💻' },
  { code: 'MECH', name: 'Mechanical Engineering', icon: '⚙️' },
  { code: 'CIVIL', name: 'Civil Engineering', icon: '🏗️' },
  { code: 'EEE', name: 'Electrical & Electronics Engineering', icon: '🔌' },
];

export default function DisplayIndexPage() {
  return (
    <div className="min-h-screen bg-[#0B1220] flex flex-col items-center justify-center p-8 select-none">
      <div className="max-w-4xl w-full text-center space-y-8">
        <div className="inline-flex items-center gap-3 bg-[#3B82F6]/15 text-[#3B82F6] px-4 py-2 rounded-full border border-[#3B82F6]/30 text-sm font-semibold tracking-wide">
          <Radio className="w-4 h-4 animate-pulse" />
          <span>CAMPUSCAST SIGNAGE DISPLAY NETWORK</span>
        </div>

        <div className="space-y-3">
          <h1 className="text-5xl font-black tracking-tight text-[#F5F7FA]">
            Select Department Display
          </h1>
          <p className="text-xl text-[#8B96A8] max-w-2xl mx-auto">
            Choose a department screen to launch its real-time full-screen digital notice board.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-left pt-4">
          {DEPARTMENTS.map((dept) => (
            <Link
              key={dept.code}
              href={`/display/${dept.code.toLowerCase()}`}
              className="group bg-[#141C2E] border border-[#222F47] hover:border-[#3B82F6] rounded-xl p-6 transition-all duration-200 hover:shadow-xl hover:shadow-[#3B82F6]/10 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl">{dept.icon}</span>
                  <span className="bg-[#3B82F6]/15 text-[#3B82F6] font-bold px-2.5 py-1 rounded text-sm border border-[#3B82F6]/30">
                    {dept.code}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#F5F7FA] group-hover:text-[#3B82F6] transition-colors">
                  {dept.name}
                </h3>
              </div>

              <div className="mt-6 flex items-center justify-between text-sm text-[#8B96A8] font-medium pt-4 border-t border-[#222F47]">
                <span>Launch Screen</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[#3B82F6]" />
              </div>
            </Link>
          ))}
        </div>

        <div className="pt-8 text-sm text-[#8B96A8] flex items-center justify-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>Powered by WhatsApp Business API & Firebase Firestore</span>
        </div>
      </div>
    </div>
  );
}
