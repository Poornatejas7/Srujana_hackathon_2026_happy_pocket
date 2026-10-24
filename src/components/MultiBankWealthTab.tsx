'use client';

import React from 'react';
import { 
  Building, 
  Layers, 
  Plus, 
  CheckCircle2, 
  TrendingUp, 
  ShieldCheck, 
  ArrowUpRight 
} from 'lucide-react';

interface MultiBankWealthTabProps {
  onConnectAA: () => void;
  onUploadStatement: () => void;
}

export default function MultiBankWealthTab({
  onConnectAA,
  onUploadStatement,
}: MultiBankWealthTabProps) {
  const linkedAccounts = [
    {
      bank: 'State Bank of India',
      type: 'Primary Savings (Salary)',
      accountNo: '•••• 40665',
      balance: 14524.91,
      source: 'Verified via AA Consent',
      lastSynced: 'Just now',
    },
    {
      bank: 'Canara Bank',
      type: 'Secondary Savings (Personal)',
      accountNo: '•••• 91636',
      balance: 42800.00,
      source: 'Verified via AA Consent',
      lastSynced: '10 mins ago',
    },
    {
      bank: 'HDFC Bank',
      type: 'Emergency Fund',
      accountNo: '•••• 89192',
      balance: 125000.00,
      source: 'Imported via Statement PDF',
      lastSynced: 'Today',
    },
  ];

  const totalNetWorth = linkedAccounts.reduce((acc, curr) => acc + curr.balance, 0);

  return (
    <div className="space-y-4 animate-fadeIn pb-4">
      {/* Total Consolidated Net Worth Card */}
      <div className="p-5 rounded-[26px] bg-gradient-to-br from-slate-900 to-[#0A172E] text-white shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Consolidated Liquid Net Worth
          </span>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded-full border border-emerald-500/30">
            Multi-Bank Sync
          </span>
        </div>

        <div>
          <div className="text-2xl sm:text-3xl font-extrabold font-sans text-white tracking-tight">
            ₹{totalNetWorth.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Aggregated across 3 linked institutions with automatic inter-account deduping.
          </p>
        </div>

        <div className="pt-2 flex gap-2">
          <button
            type="button"
            onClick={onConnectAA}
            className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Link Bank (AA)</span>
          </button>
          <button
            type="button"
            onClick={onUploadStatement}
            className="flex-1 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition border border-white/15 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Upload PDF</span>
          </button>
        </div>
      </div>

      {/* Linked Accounts List */}
      <div className="space-y-2.5">
        <span className="text-xs font-bold text-slate-800 px-1">
          Connected Accounts ({linkedAccounts.length})
        </span>

        {linkedAccounts.map((acc, idx) => (
          <div
            key={idx}
            className="p-4 rounded-2xl bg-white border border-slate-100 shadow-2xs flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-700 shrink-0">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">{acc.bank}</h4>
                <p className="text-[10px] text-slate-400 font-medium">
                  {acc.accountNo} · {acc.type}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  <span className="text-[9px] text-emerald-700 font-semibold">{acc.source}</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs sm:text-sm font-bold font-sans text-slate-900 block">
                ₹{acc.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[9px] text-slate-400">
                {acc.lastSynced}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center gap-2 text-[11px] text-slate-500">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>
          Transfers between your SBI and Canara accounts are automatically detected as self-transfers and deducted from your living spend!
        </span>
      </div>
    </div>
  );
}
