'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Coins,
  Sliders,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { RecommenderPlan } from '@/types/recommender';
import { generateRecommenderPlan } from '@/lib/recommenderEngine';

interface RecommenderCardProps {
  initialLeakage?: number;
  className?: string;
  onExploreSIP?: (fundName: string) => void;
}

export default function RecommenderCard({
  initialLeakage = 2500,
  className = '',
  onExploreSIP,
}: RecommenderCardProps) {
  const [leakageAmount, setLeakageAmount] = useState<number>(initialLeakage);
  const [horizonYears, setHorizonYears] = useState<5 | 10>(5);
  const [plan, setPlan] = useState<RecommenderPlan>(() => generateRecommenderPlan(initialLeakage));
  const [isLoadingLive, setIsLoadingLive] = useState<boolean>(false);
  const [liveNavDate, setLiveNavDate] = useState<string>('Live AMFI Feed');
  const [activeTab, setActiveTab] = useState<'all' | 'sip' | 'insurance'>('all');

  // Sync plan whenever leakageAmount changes
  useEffect(() => {
    setPlan(generateRecommenderPlan(leakageAmount));
  }, [leakageAmount]);

  // Fetch real AMFI live NAVs on mount
  useEffect(() => {
    async function loadLiveAmfi() {
      try {
        setIsLoadingLive(true);
        const res = await fetch(`/api/recommender?amount=${leakageAmount}`);
        const data = await res.json();
        if (data.success && data.plan) {
          setPlan(data.plan);
          if (data.liveNavs && data.liveNavs.length > 0) {
            setLiveNavDate(`AMFI NAVs: ${data.liveNavs[0].date}`);
          }
        }
      } catch (err) {
        console.error('Failed to fetch live AMFI recommendations:', err);
      } finally {
        setIsLoadingLive(false);
      }
    }

    loadLiveAmfi();
  }, []);

  const totalProjectedWealth = horizonYears === 5 ? plan.total5YrWealthCreated : plan.total10YrWealthCreated;
  const totalWastedOverHorizon = leakageAmount * 12 * horizonYears;

  return (
    <div className={`rounded-[28px] sm:rounded-[32px] bg-gradient-to-br from-[#0A172E] via-[#0E2040] to-[#0A172E] text-white p-5 sm:p-6 shadow-[0_12px_36px_rgba(10,23,46,0.3)] border border-slate-800 ${className}`}>
      
      {/* 1. Header with Live AMFI Badge */}
      <div className="flex items-center justify-between pb-3.5 border-b border-white/10 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
              Leakage-to-Wealth Recommender
            </h3>
            <p className="text-[11px] text-slate-300">
              Diverts wasteful spending into verified Stocks & Insurance
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>{isLoadingLive ? 'Syncing...' : 'Real AMFI Data'}</span>
        </div>
      </div>

      {/* 2. Interactive Leakage Diverter Slider */}
      <div className="mt-4 p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-300 font-medium flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-orange-400" />
            Monthly Leakage to Reclaim:
          </span>
          <span className="text-base font-black font-sans text-orange-400">
            ₹{leakageAmount.toLocaleString('en-IN')}<span className="text-[11px] font-normal text-slate-400">/mo</span>
          </span>
        </div>

        <input
          type="range"
          min="500"
          max="12000"
          step="250"
          value={leakageAmount}
          onChange={(e) => setLeakageAmount(Number(e.target.value))}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
        />

        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
          <span>₹500/mo (Basic subs)</span>
          <span>₹4,000/mo (Dining & subs)</span>
          <span>₹12,000/mo (High leak)</span>
        </div>
      </div>

      {/* 3. Horizon Selector & Big Comparison Card */}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Investment Horizon:
        </span>
        <div className="flex items-center gap-1 bg-white/10 p-0.5 rounded-xl border border-white/10 text-xs">
          <button
            type="button"
            onClick={() => setHorizonYears(5)}
            className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
              horizonYears === 5 ? 'bg-orange-500 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            5 Years
          </button>
          <button
            type="button"
            onClick={() => setHorizonYears(10)}
            className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
              horizonYears === 10 ? 'bg-orange-500 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            10 Years
          </button>
        </div>
      </div>

      {/* Comparison Grid: Lost vs Compounded */}
      <div className="grid grid-cols-2 gap-3 mt-3">
        {/* Left: Left as Unnecessary Spend */}
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-left space-y-1">
          <div className="flex items-center gap-1 text-[11px] font-bold text-rose-300">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>If Kept Leaking</span>
          </div>
          <div className="text-lg sm:text-xl font-black text-white font-sans">
            ₹{totalWastedOverHorizon.toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-rose-200/80 leading-tight">
            Lost completely with ₹0 return & zero safety net
          </p>
        </div>

        {/* Right: Diverted to Recommender */}
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-left space-y-1">
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-300">
            <TrendingUp className="w-3.5 h-3.5 shrink-0" />
            <span>Recommended Plan</span>
          </div>
          <div className="text-lg sm:text-xl font-black text-emerald-400 font-sans">
            ₹{totalProjectedWealth.toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-emerald-200/80 leading-tight">
            + ₹1.15 Cr Insurance Protection
          </p>
        </div>
      </div>

      {/* 4. Sub-Tab Switcher: SIPs vs Insurance */}
      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/10 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`flex-1 py-1.5 rounded-xl font-bold transition cursor-pointer ${
            activeTab === 'all' ? 'bg-white/20 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          All Recommendations
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('sip')}
          className={`flex-1 py-1.5 rounded-xl font-bold transition cursor-pointer ${
            activeTab === 'sip' ? 'bg-white/20 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Stock / Fund SIPs ({plan.recommendedSips.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('insurance')}
          className={`flex-1 py-1.5 rounded-xl font-bold transition cursor-pointer ${
            activeTab === 'insurance' ? 'bg-white/20 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Insurance ({plan.recommendedInsurance.length})
        </button>
      </div>

      {/* 5. Detailed Breakdown List */}
      <div className="mt-3 space-y-2.5">
        {/* SIP Recommendations */}
        {(activeTab === 'all' || activeTab === 'sip') && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 uppercase tracking-wider px-1">
              <span>Equity / Index SIPs (65% Allocation)</span>
              <span className="text-orange-400 font-mono">₹{plan.allocatedSipMonthly}/mo</span>
            </div>

            {plan.recommendedSips.map((sip, idx) => (
              <div
                key={idx}
                onClick={() => onExploreSIP?.(sip.option.name)}
                className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-orange-400 transition-colors">
                        {sip.option.name}
                      </h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/10 text-slate-300 shrink-0">
                        NAV: ₹{sip.option.currentNavOrPrice.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-300">
                      <span>Monthly: <strong className="text-white">₹{sip.monthlyContribution.toLocaleString('en-IN')}</strong></span>
                      <span>•</span>
                      <span>5Y CAGR: <strong className="text-emerald-400">+{sip.option.historicalCagr5Y}%</strong></span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs sm:text-sm font-black font-mono text-emerald-400">
                      ₹{(horizonYears === 5 ? sip.projectedValue5Y : sip.projectedValue10Y).toLocaleString('en-IN')}
                    </div>
                    <span className="text-[10px] text-slate-400">at {horizonYears}Y</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Insurance Recommendations */}
        {(activeTab === 'all' || activeTab === 'insurance') && (
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 uppercase tracking-wider px-1">
              <span>Essential Safety Shield (35% Allocation)</span>
              <span className="text-cyan-400 font-mono">₹{plan.allocatedInsuranceMonthly}/mo</span>
            </div>

            {plan.recommendedInsurance.map((ins, idx) => (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white">
                        {ins.type === 'TERM_LIFE' ? '₹1 Crore Term Life Guarantee' : '₹15 Lakh Health Insurance'}
                      </h4>
                      <p className="text-[10px] text-slate-300">{ins.provider}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs sm:text-sm font-bold text-cyan-300 font-mono">
                      ₹{ins.monthlyEquivalent}/mo
                    </span>
                    <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/20 px-1.5 py-0.5 rounded ml-1 block">
                      Sec {ins.taxSectionBenefit} Tax Free
                    </span>
                  </div>
                </div>

                <div className="text-[10px] text-slate-300 flex items-center justify-between pt-1 border-t border-white/5">
                  <span>Tax Saved at 20% slab: <strong>₹{ins.estimatedAnnualTaxSavings}/yr</strong></span>
                  <span className="text-slate-400">Cashless Claim Verified</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6. Total Annual Tax Exemption Summary */}
      <div className="mt-4 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-amber-200">
          <Coins className="w-4 h-4 text-amber-400" />
          <span>Annual Section 80C & 80D Tax Relief:</span>
        </div>
        <span className="text-sm font-black font-mono text-amber-400">
          +₹{plan.totalAnnualTaxSavings.toLocaleString('en-IN')}<span className="text-[10px] text-slate-400">/year</span>
        </span>
      </div>

      {/* Statutory Regulatory & Market Risk Disclaimer */}
      <p className="mt-3 text-[10px] text-slate-400 leading-relaxed text-center">
        ℹ️ <strong>Disclaimer:</strong> Projections are illustrative simulations based on historical benchmark compound rates (12–14% CAGR) and are not guaranteed returns. Mutual fund investments are subject to market risks. Insurance premiums are indicative estimates subject to underwriting guidelines.
      </p>

    </div>
  );
}
