'use client';

import React, { useState } from 'react';
import { X, QrCode, Flashlight, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ScanPayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (amount: number, merchant: string) => void;
}

export default function ScanPayModal({
  isOpen,
  onClose,
  onPaymentSuccess,
}: ScanPayModalProps) {
  const [torchOn, setTorchOn] = useState(false);
  const [scannedMerchant, setScannedMerchant] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>('250.00');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSimulateScan = (merchant: string, defaultAmt: string) => {
    setScannedMerchant(merchant);
    setAmount(defaultAmt);
  };

  const handlePay = () => {
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) return;

    setIsSuccess(true);
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {}

    setTimeout(() => {
      onPaymentSuccess(num, scannedMerchant || 'Merchant Store');
      setIsSuccess(false);
      setScannedMerchant(null);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-sm rounded-[32px] bg-slate-900 border border-slate-800 text-white p-6 shadow-2xl overflow-hidden">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="inline-flex p-3 rounded-2xl bg-orange-500/10 text-orange-500 mb-2">
            <QrCode className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold">Scan & Pay (UPI)</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Point camera at any Bharat / UPI QR Code
          </p>
        </div>

        {!scannedMerchant ? (
          <div className="mt-5 space-y-4">
            {/* Viewfinder box */}
            <div className="relative aspect-square w-full max-w-[240px] mx-auto rounded-3xl border-2 border-orange-500/60 overflow-hidden bg-slate-950/80 flex items-center justify-center">
              {/* Corner brackets */}
              <div className="absolute top-3 left-3 w-6 h-6 border-t-4 border-l-4 border-orange-500 rounded-tl-lg" />
              <div className="absolute top-3 right-3 w-6 h-6 border-t-4 border-r-4 border-orange-500 rounded-tr-lg" />
              <div className="absolute bottom-3 left-3 w-6 h-6 border-b-4 border-l-4 border-orange-500 rounded-bl-lg" />
              <div className="absolute bottom-3 right-3 w-6 h-6 border-b-4 border-r-4 border-orange-500 rounded-br-lg" />

              {/* Animated laser scan line */}
              <div className="absolute inset-x-4 h-0.5 bg-gradient-to-r from-transparent via-orange-400 to-transparent shadow-[0_0_12px_#F97316] animate-scan" />

              <p className="text-[11px] text-slate-400 font-mono tracking-wide">
                Scanning QR...
              </p>
            </div>

            {/* Quick Demo QR Presets */}
            <div className="pt-2">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block text-center mb-2">
                Or tap a sample merchant:
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleSimulateScan('Chai Point Cafe', '120.00')}
                  className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-left border border-slate-700/60 transition"
                >
                  <span className="font-bold text-white block">☕ Chai Point</span>
                  <span className="text-[10px] text-orange-400">₹120.00</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulateScan('Fresh Mart Supermarket', '840.00')}
                  className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-left border border-slate-700/60 transition"
                >
                  <span className="font-bold text-white block">🛒 Fresh Mart</span>
                  <span className="text-[10px] text-orange-400">₹840.00</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            {isSuccess ? (
              <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center animate-bounce">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h4 className="text-xl font-bold text-white">Payment Successful!</h4>
                <p className="text-xs text-slate-300">Paid ₹{amount} to {scannedMerchant}</p>
              </div>
            ) : (
              <>
                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-center">
                  <span className="text-[11px] text-slate-400 font-medium">Paying to</span>
                  <h4 className="text-base font-bold text-white mt-0.5">{scannedMerchant}</h4>
                  <p className="text-[10px] text-emerald-400 font-mono mt-0.5">UPI Verified Merchant ✓</p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Amount (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">
                      ₹
                    </span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full pl-9 pr-4 py-3 rounded-2xl bg-slate-950 border border-slate-700 text-xl font-bold text-white focus:outline-none focus:border-orange-500 font-sans"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setScannedMerchant(null)}
                    className="flex-1 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
                  >
                    Rescan
                  </button>
                  <button
                    type="button"
                    onClick={handlePay}
                    className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-xs font-bold text-white shadow-lg shadow-orange-500/30 transition cursor-pointer"
                  >
                    Confirm & Pay ₹{amount}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
