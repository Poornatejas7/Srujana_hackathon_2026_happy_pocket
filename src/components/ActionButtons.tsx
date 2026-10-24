'use client';

import React from 'react';

interface ActionButtonsProps {
  onScanPayClick?: () => void;
  onSendMoneyClick?: () => void;
  onTransactionsClick?: () => void;
}

export default function ActionButtons({
  onScanPayClick,
  onSendMoneyClick,
  onTransactionsClick,
}: ActionButtonsProps) {
  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full">
      {/* 1. Scan & Pay */}
      <button
        type="button"
        onClick={onScanPayClick}
        className="group relative flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-2xl sm:rounded-[22px] bg-white border border-slate-100 shadow-[0_4px_16px_rgba(15,23,42,0.04)] hover:shadow-[0_8px_24px_rgba(249,115,22,0.12)] hover:border-orange-200 transition-all duration-200 active:scale-95 cursor-pointer"
      >
        <div className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center text-[#F97316] group-hover:scale-110 transition-transform duration-200">
          {/* Custom QR Code Icon matching screenshot */}
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Top Left Square */}
            <rect x="3" y="3" width="8" height="8" rx="2" />
            <rect x="6" y="6" width="2" height="2" fill="currentColor" stroke="none" />
            {/* Top Right Square */}
            <rect x="17" y="3" width="8" height="8" rx="2" />
            <rect x="20" y="6" width="2" height="2" fill="currentColor" stroke="none" />
            {/* Bottom Left Square */}
            <rect x="3" y="17" width="8" height="8" rx="2" />
            <rect x="6" y="20" width="2" height="2" fill="currentColor" stroke="none" />
            {/* Bottom Right Elements */}
            <line x1="17" y1="17" x2="21" y2="17" />
            <line x1="21" y1="17" x2="21" y2="21" />
            <line x1="25" y1="21" x2="25" y2="25" />
            <line x1="17" y1="25" x2="21" y2="25" />
          </svg>
        </div>
        <span className="mt-2 text-xs sm:text-[13px] font-bold text-slate-800 tracking-tight group-hover:text-orange-600 transition-colors">
          Scan & Pay
        </span>
      </button>

      {/* 2. Send Money */}
      <button
        type="button"
        onClick={onSendMoneyClick}
        className="group relative flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-2xl sm:rounded-[22px] bg-white border border-slate-100 shadow-[0_4px_16px_rgba(15,23,42,0.04)] hover:shadow-[0_8px_24px_rgba(249,115,22,0.12)] hover:border-orange-200 transition-all duration-200 active:scale-95 cursor-pointer"
      >
        <div className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center text-[#F97316] group-hover:scale-110 transition-transform duration-200">
          {/* Custom Paper Airplane Icon matching screenshot */}
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="translate-x-0.5 -translate-y-0.5"
          >
            <path d="M 24 4 L 4 12 L 13 15 L 16 24 Z" />
            <line x1="13" y1="15" x2="24" y2="4" />
          </svg>
        </div>
        <span className="mt-2 text-xs sm:text-[13px] font-bold text-slate-800 tracking-tight group-hover:text-orange-600 transition-colors">
          Send Money
        </span>
      </button>

      {/* 3. Transactions */}
      <button
        type="button"
        onClick={onTransactionsClick}
        className="group relative flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-2xl sm:rounded-[22px] bg-white border border-slate-100 shadow-[0_4px_16px_rgba(15,23,42,0.04)] hover:shadow-[0_8px_24px_rgba(249,115,22,0.12)] hover:border-orange-200 transition-all duration-200 active:scale-95 cursor-pointer"
      >
        <div className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center text-[#F97316] group-hover:scale-110 transition-transform duration-200">
          {/* Custom Document with Lines matching screenshot */}
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M 7 4 C 5.5 4 4 5.5 4 7 L 4 21 C 4 22.5 5.5 24 7 24 L 21 24 C 22.5 24 24 22.5 24 21 L 24 10 L 18 4 Z" />
            <polyline points="18 4 18 10 24 10" />
            <line x1="9" y1="14" x2="16" y2="14" />
            <line x1="9" y1="18" x2="19" y2="18" />
          </svg>
        </div>
        <span className="mt-2 text-xs sm:text-[13px] font-bold text-slate-800 tracking-tight group-hover:text-orange-600 transition-colors">
          Transactions
        </span>
      </button>
    </div>
  );
}
