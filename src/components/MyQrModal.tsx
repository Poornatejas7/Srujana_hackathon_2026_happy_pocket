'use client';

import React from 'react';
import { X, QrCode, Copy, Check } from 'lucide-react';
import HappyPocketLogo from './HappyPocketLogo';

interface MyQrModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MyQrModal({ isOpen, onClose }: MyQrModalProps) {
  const [copied, setCopied] = React.useState(false);
  const upiId = 'tejas@okhdfcbank';

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xs rounded-[32px] bg-white text-slate-900 p-6 shadow-2xl overflow-hidden border border-slate-100 text-center">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex justify-center mb-1">
          <HappyPocketLogo size={48} />
        </div>
        <h3 className="text-base font-bold text-slate-900 mt-1">My UPI QR Code</h3>
        <p className="text-xs text-slate-400">Scan using any UPI app to pay</p>

        {/* QR Code Container */}
        <div className="mt-4 p-5 rounded-3xl bg-[#FFFBF8] border-2 border-orange-200/80 inline-block shadow-inner">
          {/* Simulated Detailed QR vector */}
          <div className="w-44 h-44 bg-white p-2 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center relative">
            <QrCode className="w-full h-full text-slate-900 stroke-[1.5]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="p-1 rounded-lg bg-white shadow-md border border-slate-100">
                <HappyPocketLogo size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* UPI ID Copy Pill */}
        <div className="mt-4 flex items-center justify-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200">
          <span className="font-mono text-xs font-bold text-slate-700">{upiId}</span>
          <button
            type="button"
            onClick={handleCopy}
            className="p-1 text-slate-500 hover:text-orange-600 transition"
            title="Copy UPI ID"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
