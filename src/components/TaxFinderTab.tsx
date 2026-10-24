'use client';

import React from 'react';
import { 
  ReceiptIndianRupee, 
  ShieldCheck, 
  Download, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle 
} from 'lucide-react';

interface TaxItem {
  section: string;
  category: string;
  maxLimit: number;
  identifiedSpend: number;
  description: string;
  status: 'OPTIMAL' | 'UNDER_UTILIZED' | 'OPPORTUNITY';
}

const DEFAULT_TAX_SECTIONS: TaxItem[] = [
  {
    section: 'Section 80C',
    category: 'EPF / ELSS / Life Insurance',
    maxLimit: 150000,
    identifiedSpend: 62000,
    description: 'Provident fund, ELSS mutual funds, and term life insurance premiums.',
    status: 'UNDER_UTILIZED',
  },
  {
    section: 'Section 80D',
    category: 'Health Insurance & Checkups',
    maxLimit: 25000,
    identifiedSpend: 18500,
    description: 'Medical health insurance for self and family + preventive checkups.',
    status: 'OPTIMAL',
  },
  {
    section: 'Section 80CCD(1B)',
    category: 'National Pension Scheme (NPS)',
    maxLimit: 50000,
    identifiedSpend: 0,
    description: 'Additional exclusive voluntary retirement deduction.',
    status: 'OPPORTUNITY',
  },
  {
    section: 'Section 24(b)',
    category: 'Home Loan Interest',
    maxLimit: 200000,
    identifiedSpend: 0,
    description: 'Interest portion of residential property loans.',
    status: 'OPPORTUNITY',
  },
];

export default function TaxFinderTab() {
  const totalClaimable = DEFAULT_TAX_SECTIONS.reduce((acc, curr) => acc + curr.identifiedSpend, 0);
  const potentialSavings = Math.round(totalClaimable * 0.312); // ~30% tax bracket + cess

  return (
    <div className="space-y-4 animate-fadeIn pb-4">
      {/* Header Banner */}
      <div className="p-5 rounded-[26px] bg-gradient-to-br from-slate-900 to-[#0A172E] text-white shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
              <ReceiptIndianRupee className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Tax Deduction & Exemption Finder
              </h3>
              <p className="text-[11px] text-slate-400">
                Automated 80C, 80D & NPS discovery from statement entries
              </p>
            </div>
          </div>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded-full border border-emerald-500/30">
            FY 2026-27
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Identified Deductions</span>
            <span className="text-base font-bold font-mono text-white mt-0.5 block">
              ₹{totalClaimable.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-emerald-400">Parsed from transactions</span>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Estimated Tax Shield</span>
            <span className="text-base font-bold font-mono text-emerald-400 mt-0.5 block">
              ~₹{potentialSavings.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-slate-300">Saved in tax liability</span>
          </div>
        </div>
      </div>

      {/* Tax Sections List */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-800">
            Eligible Sections & Utilization
          </span>
          <button
            type="button"
            onClick={() => alert("Tax deduction certificate summary downloaded (PDF).")}
            className="flex items-center gap-1 text-[11px] font-bold text-orange-600 hover:text-orange-700 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Summary</span>
          </button>
        </div>

        {DEFAULT_TAX_SECTIONS.map((sec, idx) => {
          const percent = Math.min(100, Math.round((sec.identifiedSpend / sec.maxLimit) * 100));
          return (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-white border border-slate-100 shadow-2xs space-y-2.5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{sec.section}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700">
                      {sec.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {sec.description}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-slate-900 block">
                    ₹{sec.identifiedSpend.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    of ₹{sec.maxLimit.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    percent >= 80 ? 'bg-emerald-500' : percent > 0 ? 'bg-orange-500' : 'bg-slate-300'
                  }`}
                  style={{ width: `${percent}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-400">
                  {percent}% Utilized
                </span>
                {percent < 100 && (
                  <span className="text-orange-600 font-bold">
                    ₹{(sec.maxLimit - sec.identifiedSpend).toLocaleString('en-IN')} gap remaining
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
