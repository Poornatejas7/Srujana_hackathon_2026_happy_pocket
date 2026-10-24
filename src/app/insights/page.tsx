'use client';

import React from 'react';
import Link from 'next/link';
import { Wifi, ArrowLeft } from 'lucide-react';
import HappyPocketLogo from '@/components/HappyPocketLogo';
import BottomNav from '@/components/BottomNav';
import InsightsTab from '@/components/InsightsTab';

export default function SmartInsightsPage() {
  return (
    <div className="min-h-screen bg-[#EEF2F6] text-slate-900 flex flex-col font-sans selection:bg-orange-500 selection:text-white py-4 sm:py-8 px-2 sm:px-4">
      {/* Return link helper */}
      <div className="max-w-[390px] mx-auto w-full mb-3 flex items-center justify-between px-2">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-orange-500 transition cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
        <span className="text-[11px] font-semibold text-slate-400">
          Happy Pocket Smart Insights
        </span>
      </div>

      {/* Smartphone frame container */}
      <div className="w-full max-w-[380px] sm:max-w-[390px] mx-auto transition-all duration-300">
        <div className="w-full bg-[#EEF2F6] rounded-[48px] shadow-[0_20px_50px_rgba(15,23,42,0.12)] border-[10px] border-white overflow-hidden">
          <div className="w-full bg-[#EEF2F6] flex flex-col justify-between overflow-hidden">
            
            {/* 1. Mobile Status Bar */}
            <div className="w-full pt-3 px-6 flex items-center justify-between text-slate-800 select-none">
              <span className="font-bold text-sm tracking-tight font-sans">9:41</span>
              
              <div className="flex items-center gap-1.5 text-slate-800">
                <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor">
                  <rect x="0" y="7" width="2.8" height="4" rx="0.8" />
                  <rect x="4.5" y="4.5" width="2.8" height="6.5" rx="0.8" />
                  <rect x="9" y="2" width="2.8" height="9" rx="0.8" />
                  <rect x="13.5" y="0" width="2.8" height="11" rx="0.8" />
                </svg>
                <Wifi className="w-3.5 h-3.5 stroke-[2.4]" />
                <div className="w-5 h-2.5 rounded-[4px] border-[1.5px] border-slate-800 p-0.5 flex items-center">
                  <div className="w-full h-full bg-slate-800 rounded-[1.5px]" />
                </div>
              </div>
            </div>

            {/* 2. Header with Mascot, Smart Insights Title & User Avatar in Happy Pocket Theme */}
            <div className="px-5 pt-2 pb-2 flex items-center justify-between">
              <Link href="/" className="flex items-center cursor-pointer active:scale-95 transition-transform">
                <HappyPocketLogo size={50} />
              </Link>

              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                Smart Insights
              </h2>

              <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm bg-amber-100 flex items-center justify-center shrink-0">
                <img
                  src="/avatar.jpg"
                  alt="User Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* 3. Screen Body with InsightsTab */}
            <div className="px-4 py-1">
              <InsightsTab />
            </div>

            {/* 4. Bottom Navigation with Insights active */}
            <div className="mt-2">
              <BottomNav
                activeTab="insights"
                onChangeTab={() => {}}
              />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
