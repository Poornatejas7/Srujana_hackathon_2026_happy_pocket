'use client';

import React, { useState } from 'react';
import { Landmark, Eye, EyeOff, RefreshCw, ShieldCheck } from 'lucide-react';

interface AccountCardProps {
  bankName?: string;
  accountName?: string;
  accountNumberMask?: string;
  upiId?: string;
  balance?: number;
  className?: string;
  onRefresh?: () => void;
}

export default function AccountCard({
  bankName = 'HDFC Bank',
  accountName = 'Savings Account',
  accountNumberMask = '•••• 7482',
  upiId = 'poornatejas@okhdfcbank',
  balance = 10000.00,
  className = '',
  onRefresh,
}: AccountCardProps) {
  const [showBalance, setShowBalance] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshClick = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setTimeout(() => setIsRefreshing(false), 500);
      }
    }
  };

  return (
    <div
      className={`relative w-full overflow-hidden rounded-[28px] sm:rounded-[32px] bg-[#0A172E] text-white p-6 sm:p-7 shadow-[0_12px_36px_rgba(10,23,46,0.28)] transition-all duration-300 hover:shadow-[0_16px_44px_rgba(10,23,46,0.36)] ${className}`}
    >
      {/* Background Smooth Orange Wave in Bottom-Right Corner */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[inherit]">
        <svg
          viewBox="0 0 400 220"
          preserveAspectRatio="none"
          className="absolute -bottom-1 -right-1 w-[70%] sm:w-[65%] h-[68%] sm:h-[65%] pointer-events-none select-none"
        >
          {/* Subtle underlayer glow */}
          <path
            d="M 60 220 C 130 180, 210 145, 400 95 L 400 220 Z"
            fill="#D97706"
            opacity="0.35"
          />
          {/* Primary vibrant orange wave matching reference image */}
          <path
            d="M 85 220 C 150 190, 240 150, 400 105 L 400 220 Z"
            fill="url(#cardWaveGradient)"
          />
          <defs>
            <linearGradient id="cardWaveGradient" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#EA580C" />
              <stop offset="40%" stopColor="#F97316" />
              <stop offset="100%" stopColor="#FB923C" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Card Content */}
      <div className="relative z-10 flex flex-col justify-between min-h-[130px] sm:min-h-[145px]">
        {/* Top Row: Bank Info & Controls */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-white shadow-inner">
              <Landmark className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm sm:text-base font-bold tracking-tight text-white leading-tight">
                  {bankName}
                </h2>
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.2 rounded-full">
                  UPI Linked
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium tracking-wider mt-0.5">
                {accountName} • A/c {accountNumberMask}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {onRefresh && (
              <button
                type="button"
                onClick={handleRefreshClick}
                className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Refresh Bank Balance"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-orange-400' : ''}`} />
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowBalance(!showBalance)}
              className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-400/50"
              aria-label={showBalance ? "Hide balance" : "Show balance"}
              title={showBalance ? "Hide balance" : "Show balance"}
            >
              {showBalance ? (
                <Eye className="w-5 h-5 stroke-[2]" />
              ) : (
                <EyeOff className="w-5 h-5 stroke-[2]" />
              )}
            </button>
          </div>
        </div>

        {/* Bottom Row: Amount & UPI ID */}
        <div className="mt-4 sm:mt-5 flex items-end justify-between">
          <div>
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-0.5">
              Available Balance
            </div>
            <div className="text-2xl sm:text-3xl md:text-[34px] font-extrabold tracking-tight font-sans text-white select-none drop-shadow-sm flex items-center">
              {showBalance ? (
                <>
                  <span className="font-semibold mr-0.5">₹</span>
                  {balance.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </>
              ) : (
                <span className="tracking-[0.25em] text-xl sm:text-2xl text-slate-200">
                  ₹••••••••
                </span>
              )}
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-mono block">UPI ID</span>
            <span className="text-xs font-semibold text-orange-200 font-mono">{upiId}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
