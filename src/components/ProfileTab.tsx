'use client';

import React from 'react';
import Image from 'next/image';
import { ShieldCheck, QrCode, Lock, Bell, ChevronRight, HelpCircle, LogOut, Trash2 } from 'lucide-react';

interface ProfileTabProps {
  onShowQR: () => void;
  onLogout?: () => void;
  onClearData?: () => void;
}

export default function ProfileTab({ onShowQR, onLogout, onClearData }: ProfileTabProps) {
  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Profile Card */}
      <div className="rounded-[28px] bg-white p-5 shadow-[0_4px_24px_rgba(15,23,42,0.04)] border border-slate-100 flex items-center gap-4">
        <div className="relative w-14 h-14 rounded-full overflow-hidden shrink-0 border-2 border-orange-200">
          <Image
            src="/avatar.jpg"
            alt="Profile Avatar"
            fill
            className="object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="text-base font-bold text-slate-900 truncate">Poornatejas</h3>
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          </div>
          <p className="text-xs text-slate-500 font-mono">tejas@okhdfcbank</p>
          <span className="inline-block mt-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            KYC Verified
          </span>
        </div>
        <button
          type="button"
          onClick={onShowQR}
          className="p-2.5 rounded-2xl bg-orange-50 text-orange-600 hover:bg-orange-100 transition shrink-0 cursor-pointer"
          title="My UPI QR"
        >
          <QrCode className="w-5 h-5" />
        </button>
      </div>

      {/* Settings List */}
      <div className="rounded-[28px] bg-white p-3 shadow-[0_4px_24px_rgba(15,23,42,0.04)] border border-slate-100 divide-y divide-slate-100">
        {[
          { label: 'Security & UPI PIN', desc: 'Manage 4-digit UPI transaction PIN', icon: Lock },
          { label: 'Payment Notifications', desc: 'SMS, WhatsApp and sound alerts', icon: Bell },
          { label: 'Help & 24/7 Support', desc: 'Dispute a transaction or report issue', icon: HelpCircle },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">{item.label}</h4>
                  <p className="text-[10px] text-slate-400">{item.desc}</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          );
        })}

        {/* Clear Data Option */}
        {onClearData && (
          <div
            onClick={() => {
              if (window.confirm('Are you sure you want to clear all transactions and reset data?')) {
                onClearData();
              }
            }}
            className="flex items-center justify-between p-3 rounded-2xl hover:bg-amber-50/70 transition cursor-pointer text-amber-700 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 group-hover:bg-amber-100 flex items-center justify-center text-amber-600 transition">
                <Trash2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-amber-800">Clear All Transactions</h4>
                <p className="text-[10px] text-amber-600">Reset MongoDB database and clear ledger</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        )}

        {/* Log Out Option */}
        {onLogout && (
          <div
            onClick={onLogout}
            className="flex items-center justify-between p-3 rounded-2xl hover:bg-red-50/70 transition cursor-pointer text-red-600 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-50 group-hover:bg-red-100 flex items-center justify-center text-red-600 transition">
                <LogOut className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-red-600">Log Out</h4>
                <p className="text-[10px] text-red-400">Exit to login & registration screen</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-red-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        )}
      </div>

      {/* App Version Info */}
      <div className="text-center py-2 text-[10px] text-slate-400 font-medium">
        Happy Pocket App v2.4.0 • NPCI Certified 2026
      </div>
    </div>
  );
}
