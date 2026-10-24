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
      className={`relative w-full overflow-hidden rounded-[26px] bg-[#0A182E] text-white p-5 shadow-[0_10px_30px_rgba(10,24,46,0.25)] transition-all duration-300 hover:shadow-[0_14px_36px_rgba(10,24,46,0.3)] ${className}`}
    >
      {/* Background Smooth Orange Wave in Bottom-Right Corner */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[inherit]">
        <svg
          viewBox="0 0 360 190"
          preserveAspectRatio="none"
          className="absolute -bottom-0.5 -right-0.5 w-[72%] h-[68%] pointer-events-none select-none"
        >
          {/* Subtle underlayer glow */}
          <path
            d="M 50 190 C 120 155, 190 125, 360 85 L 360 190 Z"
            fill="#D97706"
            opacity="0.3"
          />
          {/* Primary vibrant orange wave matching reference image */}
          <path
            d="M 75 190 C 140 160, 220 128, 360 92 L 360 190 Z"
            fill="url(#cardWaveGradient)"
          />
          <defs>
            <linearGradient id="cardWaveGradient" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#EA580C" />
              <stop offset="45%" stopColor="#F97316" />
              <stop offset="100%" stopColor="#FB923C" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Card Content */}
      <div className="relative z-10 flex flex-col justify-between min-h-[110px]">
        {/* Top Row: Bank Info & Visibility Eye */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 backdrop-blur-md border border-white/15 text-white">
              <Landmark className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-[13px] sm:text-sm font-bold tracking-tight text-white leading-tight">
                {accountName}
              </h2>
              <p className="text-[11px] text-slate-300 font-medium tracking-wider mt-0.5">
                A/c No. {accountNumberMask}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowBalance(!showBalance)}
            className="p-1 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer focus:outline-none"
            aria-label={showBalance ? "Hide balance" : "Show balance"}
          >
            {showBalance ? (
              <Eye className="w-4 h-4 stroke-[2]" />
            ) : (
              <EyeOff className="w-4 h-4 stroke-[2]" />
            )}
          </button>
        </div>

        {/* Bottom Row: Amount */}
        <div className="mt-4">
          <div className="text-[26px] sm:text-[28px] font-extrabold tracking-tight font-sans text-white select-none drop-shadow-sm flex items-center">
            {showBalance ? (
              <>
                <span className="font-bold mr-0.5">₹</span>
                {balance.toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </>
            ) : (
              <span className="tracking-[0.2em] text-xl text-slate-200">
                ₹••••••••
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
