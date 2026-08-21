'use client';

import React, { useState, useEffect } from 'react';

interface HeaderProps {
  deptCode: string;
  deptFullName?: string;
}

const DEPT_NAMES: Record<string, string> = {
  ECE: 'Electronics & Communication Engineering',
  CSE: 'Computer Science & Engineering',
  MECH: 'Mechanical Engineering',
  CIVIL: 'Civil Engineering',
  EEE: 'Electrical & Electronics Engineering',
};

export const Header: React.FC<HeaderProps> = ({ deptCode, deptFullName }) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' IST');
      setDateStr(now.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const fullName = deptFullName || DEPT_NAMES[deptCode.toUpperCase()] || 'Department Signage Network';

  return (
    <header className="h-[90px] w-full px-8 flex items-center justify-between bg-[#0B1220]/90 backdrop-blur border-b border-[#222F47] select-none">
      <div className="flex flex-col">
        <div className="flex items-center gap-3">
          <span className="bg-[#3B82F6]/15 text-[#3B82F6] text-xl font-bold px-3 py-1 rounded border border-[#3B82F6]/30 uppercase tracking-wide">
            {deptCode}
          </span>
          <h1 className="text-3xl font-extrabold text-[#F5F7FA] tracking-tight">
            DEPARTMENT NOTICE BOARD
          </h1>
        </div>
        <p className="text-base text-[#8B96A8] mt-0.5 font-medium">
          {fullName}
        </p>
      </div>

      <div className="flex flex-col items-end">
        <div className="text-3xl font-mono font-bold text-[#F5F7FA] tracking-wider">
          {timeStr || '12:00:00 IST'}
        </div>
        <div className="text-base text-[#8B96A8] font-medium mt-0.5">
          {dateStr || 'Fri, 21 Aug 2026'}
        </div>
      </div>
    </header>
  );
};
