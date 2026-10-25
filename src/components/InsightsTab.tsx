'use client';

import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  ChevronRight, 
  ArrowRight, 
  TrendingUp, 
  ShieldCheck, 
  Coins, 
  Info, 
  Sparkles,
  Zap,
  CheckCircle2,
  Wallet
} from 'lucide-react';
import RecommenderCard from '@/components/RecommenderCard';
import { DisplayTransaction } from './RecentTransactions';

interface InsightsTabProps {
  transactions?: DisplayTransaction[];
}

export default function InsightsTab({ transactions = [] }: InsightsTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<'unnecessary' | 'alternatives'>('unnecessary');
  const [activeInvestment, setActiveInvestment] = useState<string>('index');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  // Derive recurring / subscription transactions dynamically from user's transactions
  const subscriptions = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];

    return transactions
      .filter((t) => 
        t.amount < 0 && (
          t.isRecurringAutoPay ||
          t.category === 'Subscriptions & Digital' ||
          /netflix|spotify|prime|hotstar|youtube|icloud|google one|gym|broadband|wifi|tataplay/i.test(t.title)
        )
      )
      .map((t) => {
        const absAmount = Math.abs(t.amount);
        return {
          id: t.id,
          name: t.title,
          amount: `₹${absAmount.toLocaleString('en-IN')} / month`,
          rawAmount: absAmount,
          category: t.category || 'Subscriptions & Digital',
          icon: (
            <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm shadow-xs">
              {t.themeIcon || '🎵'}
            </div>
          ),
          tip: 'Identified recurring payment from transaction ledger',
        };
      });
  }, [transactions]);

  const totalMonthlyLeak = useMemo(() => {
    return subscriptions.reduce((sum, s) => sum + s.rawAmount, 0);
  }, [subscriptions]);

  const annualLeak = totalMonthlyLeak * 12;

  // Compounded 5-year estimate at 12% CAGR
  const projected5YearSIP = useMemo(() => {
    if (totalMonthlyLeak <= 0) return 0;
    const r = 0.12 / 12;
    const n = 60;
    return Math.round(totalMonthlyLeak * ((Math.pow(1 + r, n) - 1) / r) * (1 + r));
  }, [totalMonthlyLeak]);

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
          {subscriptions.length === 0 ? (
            /* Clean Empty State when no recurring subscriptions exist */
            <div className="bg-white rounded-[28px] p-8 text-center shadow-[0_4px_24px_rgba(15,23,42,0.05)] border border-slate-100 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 mx-auto flex items-center justify-center">
                <Calendar className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                No Recurring Subscriptions Found
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                Your recurring subscriptions list is currently empty. When you make subscription or auto-pay transactions (e.g. streaming, cloud storage, memberships), Happy Pocket will automatically detect recurring leaks here.
              </p>
            </div>
          ) : (
            <>
              {/* Main Card: Recurring / Auto-Pay */}
              <div className="bg-white rounded-[28px] p-5 shadow-[0_4px_24px_rgba(15,23,42,0.05)] border border-slate-100">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#F97316] shrink-0">
                    <Calendar className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                      Recurring / Auto-Pay ({subscriptions.length})
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Regular debits detected in your ledger
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
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {sub.icon}
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                            {sub.name}
                          </h4>
                          <p className="text-xs text-slate-500 font-medium">
                            {sub.amount}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] font-bold text-slate-600 bg-slate-100/90 hover:bg-orange-50 hover:text-orange-600 px-3 py-1 rounded-full border border-slate-200/80 transition">
                          Auto-pay
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-orange-500 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total Monthly Spend Summary footer */}
                <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                      Total Monthly Leaks
                    </span>
                    <span className="text-base sm:text-lg font-black text-slate-900">
                      ₹{totalMonthlyLeak.toLocaleString('en-IN')} <span className="text-xs font-semibold text-slate-500">/ month</span>
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
                    Canceling or pooling these auto-debits saves you <strong>₹{annualLeak.toLocaleString('en-IN')} every year</strong>. Click <strong>Better Alternatives</strong> above to see how this money can grow!
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW 2: BETTER ALTERNATIVES (What If You Invested This?) */}
      {/* ========================================================= */}
      {activeSubTab === 'alternatives' && (
        <div className="space-y-3.5 animate-fadeIn">
          {/* Live AMFI & IRDAI Recommender Simulator */}
          <RecommenderCard 
            initialLeakage={totalMonthlyLeak > 0 ? totalMonthlyLeak : 1000} 
            onExploreSIP={(name) => showToast(`Selected SIP plan: ${name}`)} 
          />

          {totalMonthlyLeak > 0 && (
            <div className="bg-white rounded-[28px] p-5 shadow-[0_4px_24px_rgba(15,23,42,0.05)] border border-slate-100 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#F97316]">
                  <TrendingUp className="w-4 h-4 stroke-[2.4]" />
                </div>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                  What If You Invested Your Recurring Outflow?
                </h3>
              </div>

              {/* Projection Banner */}
              <div className="bg-gradient-to-r from-orange-50 via-amber-50/60 to-emerald-50 rounded-[22px] p-4 border border-orange-100/90 flex items-center justify-between gap-2 shadow-xs">
                <div>
                  <div className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                    ₹{totalMonthlyLeak.toLocaleString('en-IN')} <span className="text-xs font-bold text-slate-500">/ month</span>
                  </div>
                  <div className="text-[11px] font-medium text-slate-500">
                    (from detected recurring spend)
                  </div>
                </div>

                <div className="w-8 h-8 rounded-full bg-white shadow-xs border border-orange-200 flex items-center justify-center text-[#F97316] shrink-0">
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </div>

                <div className="bg-white rounded-2xl px-3.5 py-2 border border-orange-200/90 shadow-xs text-right">
                  <div className="text-base sm:text-lg font-black text-[#F97316] tracking-tight leading-none">
                    ₹{projected5YearSIP.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] font-bold text-slate-600 mt-0.5">
                    in 5 years*
                  </div>
                </div>
              </div>

              {/* 3 Investment Options */}
              <div className="grid grid-cols-3 gap-2.5 pt-1">
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
                    Health Cover
                  </span>
                  <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200/60">
                    Low Risk
                  </span>
                </button>

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
                    Index SIP
                  </span>
                  <span className="text-[9px] font-extrabold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full border border-amber-200/60">
                    Moderate Risk
                  </span>
                </button>

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
                    Guaranteed RD
                  </span>
                  <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200/60">
                    Lower Risk
                  </span>
                </button>
              </div>

              <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-slate-500 text-center">
                <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Estimated growth at ~12% annual return.</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
