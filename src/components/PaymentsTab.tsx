'use client';

import React from 'react';
import { Smartphone, Zap, Tv, Shield, CreditCard, Car, Sparkles } from 'lucide-react';

interface PaymentsTabProps {
  onScanClick: () => void;
  onSendClick: () => void;
}

const BILL_CATEGORIES = [
  { id: 'mobile', label: 'Mobile Recharge', icon: Smartphone, color: 'bg-blue-50 text-blue-600' },
  { id: 'electricity', label: 'Electricity', icon: Zap, color: 'bg-amber-50 text-amber-600' },
  { id: 'dth', label: 'DTH / Cable', icon: Tv, color: 'bg-purple-50 text-purple-600' },
  { id: 'fastag', label: 'FASTag Recharge', icon: Car, color: 'bg-emerald-50 text-emerald-600' },
  { id: 'card', label: 'Credit Card Bill', icon: CreditCard, color: 'bg-rose-50 text-rose-600' },
  { id: 'insurance', label: 'Insurance Premium', icon: Shield, color: 'bg-indigo-50 text-indigo-600' },
];

export default function PaymentsTab({ onScanClick, onSendClick }: PaymentsTabProps) {
  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Quick Pay Banners */}
      <div className="rounded-[28px] bg-gradient-to-r from-orange-500 to-amber-500 p-5 text-white shadow-lg shadow-orange-500/20">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
              Zero Fee UPI
            </span>
            <h3 className="text-lg font-bold mt-2">Instant UPI Payments</h3>
            <p className="text-xs text-orange-100 mt-0.5">Pay merchants, bills, and friends directly</p>
          </div>
          <Sparkles className="w-8 h-8 text-white/90" />
        </div>
        <div className="flex gap-2 mt-4">
          <button
            type="button"
            onClick={onSendClick}
            className="flex-1 py-2 rounded-xl bg-white text-orange-600 font-bold text-xs hover:bg-orange-50 transition shadow-sm"
          >
            Send Money
          </button>
          <button
            type="button"
            onClick={onScanClick}
            className="flex-1 py-2 rounded-xl bg-black/20 text-white font-bold text-xs hover:bg-black/30 transition backdrop-blur-sm"
          >
            Scan Any QR
          </button>
        </div>
      </div>

      {/* Utilities & Recharges */}
      <div className="rounded-[28px] bg-white p-5 shadow-[0_4px_24px_rgba(15,23,42,0.04)] border border-slate-100">
        <h4 className="text-sm font-bold text-slate-900 mb-3.5">Recharges & Bill Payments</h4>
        <div className="grid grid-cols-3 gap-3">
          {BILL_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                type="button"
                className="flex flex-col items-center p-3 rounded-2xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100 group"
              >
                <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 ${cat.color}`}>
                  <Icon className="w-5 h-5 stroke-[2.2]" />
                </div>
                <span className="text-[11px] font-bold text-slate-800 text-center mt-2 leading-tight">
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Linked UPI Accounts */}
      <div className="rounded-[28px] bg-white p-5 shadow-[0_4px_24px_rgba(15,23,42,0.04)] border border-slate-100">
        <h4 className="text-sm font-bold text-slate-900 mb-3">Linked Bank Accounts</h4>
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
              HDFC
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">HDFC Bank •••• 7482</span>
              <span className="text-[10px] text-slate-400 font-mono">Primary UPI Account</span>
            </div>
          </div>
          <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            Active
          </span>
        </div>
      </div>
    </div>
  );
}
