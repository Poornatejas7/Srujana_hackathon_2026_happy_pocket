'use client';

import React, { useState } from 'react';
import { Landmark, Eye, EyeOff } from 'lucide-react';

interface AccountCardProps {
  accountName?: string;
  accountNumberMask?: string;
  balance?: number;
  className?: string;
  onRefresh?: () => void;
}

export default function AccountCard({
  accountName = 'Savings Account',
  accountNumberMask = '•••• 5274',
  balance = 14524.91,
  className = '',
}: AccountCardProps) {
  const [showBalance, setShowBalance] = useState(true);

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
      <div className="relative z-10 flex flex-col justify-between min-h-[120px] sm:min-h-[135px]">
        {/* Top Row: Bank Info & Visibility Eye */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-white shadow-inner">
              <Landmark className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold tracking-tight text-white leading-tight">
                {accountName}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-300 font-medium tracking-wider mt-0.5">
                A/c No. {accountNumberMask}
              </p>
            </div>
          </div>

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

        {/* Bottom Row: Amount */}
        <div className="mt-5 sm:mt-6">
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
      </div>
    </div>
  );
}
