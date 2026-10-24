'use client';

import React from 'react';
import { 
  Repeat, 
  AlertTriangle, 
  CheckCircle2, 
  Trash2, 
  TrendingDown, 
  ExternalLink,
  ShieldAlert 
} from 'lucide-react';
import { SubscriptionItem } from '@/types/finance';

interface SubscriptionsTabProps {
  subscriptions: SubscriptionItem[];
  onCancelSubscription?: (merchant: string) => void;
}

export default function SubscriptionsTab({
  subscriptions,
  onCancelSubscription,
}: SubscriptionsTabProps) {
  const activeSubs = subscriptions || [];
  const totalMonthlyDrain = activeSubs.reduce((acc, curr) => acc + curr.monthlyCost, 0);
  const totalAnnualDrain = totalMonthlyDrain * 12;

  const handleCancel = (merchant: string) => {
    onCancelSubscription?.(merchant);
  };

  return (
    <div className="space-y-4 animate-fadeIn pb-4">
      {/* Monthly Recurring Drain KPI Card */}
      <div className="p-5 rounded-[26px] bg-gradient-to-br from-slate-900 to-[#0A172E] text-white shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Active AutoPay Mandates
          </span>
          <span className="text-[10px] bg-rose-500/20 text-rose-300 font-mono px-2 py-0.5 rounded-full border border-rose-500/30">
            {activeSubs.length} Subscriptions Detected in DB
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Monthly Drain</span>
            <span className="text-xl font-bold font-mono text-white mt-0.5 block">
              ₹{totalMonthlyDrain.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-slate-400">Fixed monthly commitment</span>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Annual Impact</span>
            <span className="text-xl font-bold font-mono text-rose-400 mt-0.5 block">
              ₹{totalAnnualDrain.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-rose-400">Cumulative wealth leakage</span>
          </div>
        </div>
      </div>

      {/* Subscription Mandate Items */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-800">
            Discovered Mandates & Digital Subs
          </span>
          <span className="text-[10px] text-slate-400 font-medium">
            1-Click Cancellation Guidance
          </span>
        </div>

        {activeSubs.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-100 text-xs text-slate-500">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            Zero active recurring drains found in database! All zombie subscriptions eliminated.
          </div>
        ) : (
          activeSubs.map((sub, idx) => {
            const isZombie = sub.merchant.includes('Google') || sub.monthlyCost > 500;
            return (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white border border-slate-100 shadow-2xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">{sub.merchant}</h4>
                      {isZombie ? (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
                          Zombie Drain Alert
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          AutoPay Mandate
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Next auto-debit on {sub.nextExpected ? new Date(sub.nextExpected).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'Next month'}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-bold font-mono text-slate-900 block">
                      ₹{sub.monthlyCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}/mo
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      ₹{sub.annualImpact.toLocaleString('en-IN', { minimumFractionDigits: 2 })}/yr
                    </span>
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-between border-t border-slate-100">
                  <span className="text-[10px] text-slate-400">
                    Cadence: Monthly Recurring
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCancel(sub.merchant)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    <span>Cancel Mandate</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
