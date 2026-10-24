'use client';

import React, { useState } from 'react';
import { 
  Calendar, 
  ChevronRight, 
  ArrowRight, 
  TrendingUp, 
  ShieldCheck, 
  Coins, 
  Info, 
  Cloud, 
  Sparkles,
  Zap,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function InsightsTab() {
  const [activeSubTab, setActiveSubTab] = useState<'unnecessary' | 'alternatives'>('unnecessary');
  const [activeInvestment, setActiveInvestment] = useState<string>('index');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const subscriptions = [
    {
      id: 'netflix',
      name: 'Netflix',
      amount: '₹649 / month',
      category: 'Entertainment',
      icon: (
        <div className="w-10 h-10 rounded-full bg-[#141414] flex items-center justify-center text-red-600 font-black text-lg select-none shadow-xs">
          N
        </div>
      ),
      tip: 'Last watched 18 days ago • Consider pausing',
    },
    {
      id: 'spotify',
      name: 'Spotify',
      amount: '₹119 / month',
      category: 'Music Streaming',
      icon: (
        <div className="w-10 h-10 rounded-full bg-[#1DB954] flex items-center justify-center text-black shadow-xs">
          <svg className="w-6 h-6 fill-current text-white" viewBox="0 0 24 24">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.48.66.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
          </svg>
        </div>
      ),
      tip: 'Eligible for Duo / Family sharing plan',
    },
    {
      id: 'cloud',
      name: 'Cloud Storage',
      amount: '₹199 / month',
      category: 'Cloud Backup (100GB)',
      icon: (
        <div className="w-10 h-10 rounded-full bg-[#0284C7] flex items-center justify-center text-white shadow-xs">
          <Cloud className="w-5 h-5 stroke-[2.2]" />
        </div>
      ),
      tip: 'Annual plan saves ₹400/year',
    },
  ];

  return (
    <div className="w-full space-y-4 select-none animate-fadeIn pb-2">
      {/* Toast popup */}
      {toastMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900 text-white text-xs font-semibold shadow-xl border border-slate-700 animate-bounce">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 1. Theme Pill Toggle: Unnecessary Spend vs Better Alternatives */}
      <div className="flex items-center justify-center pt-0.5">
        <div className="inline-flex items-center p-1 bg-white rounded-full border border-slate-200/80 shadow-xs max-w-full">
          <button
            type="button"
            onClick={() => setActiveSubTab('unnecessary')}
            className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-[13px] font-bold transition-all duration-200 cursor-pointer ${
              activeSubTab === 'unnecessary'
                ? 'bg-[#F97316] text-white shadow-md shadow-orange-500/25'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Unnecessary Spend
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('alternatives')}
            className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-[13px] font-bold transition-all duration-200 cursor-pointer ${
              activeSubTab === 'alternatives'
                ? 'bg-[#F97316] text-white shadow-md shadow-orange-500/25'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Better Alternatives
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* VIEW 1: UNNECESSARY SPEND (Recurring / Auto-Pay list) */}
      {/* ========================================================= */}
      {activeSubTab === 'unnecessary' && (
        <div className="space-y-3.5">
          {/* Main Card: Recurring / Auto-Pay */}
          <div className="bg-white rounded-[28px] p-5 shadow-[0_4px_24px_rgba(15,23,42,0.05)] border border-slate-100">
            {/* Card Header with calendar icon */}
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#F97316] shrink-0">
                <Calendar className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                  Recurring / Auto-Pay
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Regular payments that may not be necessary
                </p>
              </div>
            </div>

            {/* List of Recurring Subscriptions */}
            <div className="divide-y divide-slate-100">
              {subscriptions.map((sub) => (
                <div
                  key={sub.id}
                  onClick={() => showToast(`Selected ${sub.name} auto-pay settings`)}
                  className="py-3.5 flex items-center justify-between gap-3 group cursor-pointer hover:bg-slate-50/70 -mx-2 px-2 rounded-2xl transition"
                >
                  {/* Left: Icon & Name */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {sub.icon}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                          {sub.name}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">
                        {sub.amount}
                      </p>
                    </div>
                  </div>

                  {/* Right: Auto-pay badge + Chevron */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-bold text-slate-600 bg-slate-100/90 hover:bg-orange-50 hover:text-orange-600 px-3 py-1 rounded-full border border-slate-200/80 transition">
                      Auto-pay
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-orange-500 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              ))}
            </div>

            {/* Total Monthly Spend Summary footer in Happy Pocket Theme */}
            <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Total Monthly Leaks
                </span>
                <span className="text-base sm:text-lg font-black text-slate-900">
                  ₹967 <span className="text-xs font-semibold text-slate-500">/ month</span>
                </span>
              </div>
              
              <button
                type="button"
                onClick={() => setActiveSubTab('alternatives')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#F97316] text-xs font-bold transition active:scale-95 cursor-pointer"
              >
                <span>See Growth Potential</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Smart Tip Card */}
          <div className="bg-gradient-to-r from-orange-50/90 to-amber-50/90 rounded-[22px] p-4 border border-orange-100 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#F97316] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Zap className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <h5 className="text-xs font-bold text-slate-900">
                Happy Pocket Smart Tip
              </h5>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                Canceling or pooling these 3 unused auto-debits saves you <strong>₹11,604 every year</strong>. Click <strong>Better Alternatives</strong> above to see how this money can grow!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW 2: BETTER ALTERNATIVES (What If You Invested This?) */}
      {/* ========================================================= */}
      {activeSubTab === 'alternatives' && (
        <div className="space-y-3.5 animate-fadeIn">
          {/* Main Container Card */}
          <div className="bg-white rounded-[28px] p-5 shadow-[0_4px_24px_rgba(15,23,42,0.05)] border border-slate-100 space-y-4">
            
            {/* Section Title with Happy Pocket Theme Bar Icon */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#F97316]">
                <TrendingUp className="w-4 h-4 stroke-[2.4]" />
              </div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                What If You Invested This?
              </h3>
            </div>

            {/* Projection Banner: ₹967/mo -> ₹1,21,000 in 5 years */}
            <div className="bg-gradient-to-r from-orange-50 via-amber-50/60 to-emerald-50 rounded-[22px] p-4 border border-orange-100/90 flex items-center justify-between gap-2 shadow-xs">
              <div>
                <div className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  ₹967 <span className="text-xs font-bold text-slate-500">/ month</span>
                </div>
                <div className="text-[11px] font-medium text-slate-500">
                  (from above auto-pay)
                </div>
              </div>

              {/* Arrow */}
              <div className="w-8 h-8 rounded-full bg-white shadow-xs border border-orange-200 flex items-center justify-center text-[#F97316] shrink-0">
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </div>

              {/* Target return in Happy Pocket Theme */}
              <div className="bg-white rounded-2xl px-3.5 py-2 border border-orange-200/90 shadow-xs text-right">
                <div className="text-base sm:text-lg font-black text-[#F97316] tracking-tight leading-none">
                  ₹1,21,000
                </div>
                <div className="text-[10px] font-bold text-slate-600 mt-0.5">
                  in 5 years*
                </div>
              </div>
            </div>

            {/* 3 Investment Options in Happy Pocket Theme */}
            <div className="grid grid-cols-3 gap-2.5 pt-1">
              {/* Option 1: Health Insurance */}
              <button
                type="button"
                onClick={() => {
                  setActiveInvestment('health');
                  showToast('Health Insurance: Protects ₹5 Lakh coverage + 80D tax save');
                }}
                className={`flex flex-col items-center justify-between p-3 rounded-2xl border transition-all text-center cursor-pointer ${
                  activeInvestment === 'health'
                    ? 'bg-orange-50/50 border-orange-300 ring-2 ring-orange-400/30 shadow-xs'
                    : 'bg-slate-50/70 border-slate-100 hover:border-slate-200'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 shadow-xs">
                  <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
                </div>
                <span className="text-[11px] sm:text-xs font-bold text-slate-900 leading-tight mb-2">
                  Health Insurance
                </span>
                <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200/60">
                  Low Risk
                </span>
              </button>

              {/* Option 2: Index Trade (Mutual Fund) */}
              <button
                type="button"
                onClick={() => {
                  setActiveInvestment('index');
                  showToast('Index Fund: ~12% - 14% historical CAGR on Nifty 50');
                }}
                className={`flex flex-col items-center justify-between p-3 rounded-2xl border transition-all text-center cursor-pointer ${
                  activeInvestment === 'index'
                    ? 'bg-orange-50/50 border-orange-300 ring-2 ring-orange-400/30 shadow-xs'
                    : 'bg-slate-50/70 border-slate-100 hover:border-slate-200'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#F97316] flex items-center justify-center mb-2 shadow-xs">
                  <TrendingUp className="w-5 h-5 stroke-[2.2]" />
                </div>
                <span className="text-[11px] sm:text-xs font-bold text-slate-900 leading-tight mb-2">
                  Index Trade <span className="block text-[10px] font-normal text-slate-500">(Mutual Fund)</span>
                </span>
                <span className="text-[9px] font-extrabold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full border border-amber-200/60">
                  Moderate Risk
                </span>
              </button>

              {/* Option 3: Recurring Investment */}
              <button
                type="button"
                onClick={() => {
                  setActiveInvestment('rd');
                  showToast('Recurring Deposit: Guaranteed 7.2% auto-sweep return');
                }}
                className={`flex flex-col items-center justify-between p-3 rounded-2xl border transition-all text-center cursor-pointer ${
                  activeInvestment === 'rd'
                    ? 'bg-orange-50/50 border-orange-300 ring-2 ring-orange-400/30 shadow-xs'
                    : 'bg-slate-50/70 border-slate-100 hover:border-slate-200'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2 shadow-xs">
                  <Coins className="w-5 h-5 stroke-[2.2]" />
                </div>
                <span className="text-[11px] sm:text-xs font-bold text-slate-900 leading-tight mb-2">
                  Recurring Investment
                </span>
                <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200/60">
                  Lower Risk
                </span>
              </button>
            </div>

            {/* Footnote */}
            <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-slate-500 text-center">
              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Estimated growth at ~12% annual return.</span>
            </div>
          </div>

          {/* Practical Alternative Actions */}
          <div className="bg-white rounded-[22px] p-4 border border-slate-100 shadow-[0_2px_12px_rgba(15,23,42,0.03)] space-y-2.5">
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
              <span>Smart Swap Recommendations</span>
            </h4>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block">Switch Spotify to Family Plan</span>
                  <span className="text-[11px] text-slate-500">Share with 4 friends • Save ₹70/mo</span>
                </div>
                <button
                  type="button"
                  onClick={() => showToast('Copied Spotify Family Invite link!')}
                  className="px-2.5 py-1 rounded-lg bg-orange-500 text-white font-bold text-[10px] hover:bg-orange-600 transition cursor-pointer"
                >
                  Apply
                </button>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block">Start Auto-SIP with ₹967/mo</span>
                  <span className="text-[11px] text-slate-500">Nifty 50 Index Fund via Happy Pocket UPI</span>
                </div>
                <button
                  type="button"
                  onClick={() => showToast('SIP scheduled on 1st of every month!')}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[10px] hover:bg-emerald-700 transition cursor-pointer"
                >
                  Start SIP
                </button>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
