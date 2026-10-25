'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Wifi, ArrowLeft, Maximize2, Smartphone, Monitor } from 'lucide-react';
import HappyPocketLogo from '@/components/HappyPocketLogo';
import BottomNav from '@/components/BottomNav';
import InsightsTab from '@/components/InsightsTab';

export default function SmartInsightsPage() {
  const [viewMode, setViewMode] = useState<'mobile' | 'desktop'>('mobile');

  return (
    <div className="min-h-screen bg-[#EEF2F6] text-slate-900 flex flex-col font-sans selection:bg-orange-500 selection:text-white py-4 sm:py-6 px-2 sm:px-6">
      {/* Top Header & Navigation Bar */}
      <div className="max-w-5xl mx-auto w-full mb-3 flex items-center justify-between px-2">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-orange-500 transition cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle: Mobile Frame vs Wide Desktop View */}
          <div className="flex items-center bg-white rounded-xl border border-slate-200/90 p-0.5 shadow-xs">
            <button
              type="button"
              onClick={() => setViewMode('mobile')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                viewMode === 'mobile'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mobile Frame</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('desktop')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                viewMode === 'desktop'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Wide View</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      {viewMode === 'mobile' ? (
        /* 1. Smartphone Frame Container */
        <div className="w-full max-w-[395px] mx-auto transition-all duration-300">
          <div className="w-full bg-[#EEF2F6] rounded-[48px] shadow-[0_20px_50px_rgba(15,23,42,0.12)] border-[10px] border-white overflow-hidden">
            <div className="w-full bg-[#EEF2F6] flex flex-col justify-between overflow-hidden">
              {/* Status Bar */}
              <div className="w-full pt-3 px-6 flex items-center justify-between text-slate-800 select-none">
                <span className="font-bold text-sm tracking-tight font-sans">09:41</span>
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

              {/* Brand Header */}
              <div className="px-5 pt-2 pb-2 flex items-center justify-between">
                <Link href="/" className="flex items-center cursor-pointer active:scale-95 transition-transform">
                  <HappyPocketLogo size={46} />
                </Link>

                <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                  Smart Insights
                </h2>

                <div className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-white shadow-xs bg-amber-100 flex items-center justify-center shrink-0">
                  <img src="/avatar.jpg" alt="Kotresh" className="w-full h-full object-cover" />
                </div>
              </div>

              {/* Screen Body */}
              <div className="px-4 py-1">
                <InsightsTab />
              </div>

              {/* Bottom Nav */}
              <div className="mt-2">
                <BottomNav activeTab="insights" onChangeTab={() => {}} />
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* 2. Wide Desktop Fintech Dashboard View */
        <div className="w-full max-w-4xl mx-auto bg-white/80 backdrop-blur-md rounded-[32px] p-6 shadow-xl border border-slate-200/90 transition-all duration-300">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-3">
              <HappyPocketLogo size={48} />
              <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  Happy Pocket Smart Insights Engine
                </h1>
                <p className="text-xs text-slate-500">
                  Financial visibility, recurring detection & smart savings simulator
                </p>
              </div>
            </div>
          </div>

          <InsightsTab />
        </div>
      )}
    </div>
  );
}
