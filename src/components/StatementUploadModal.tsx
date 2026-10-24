'use client';

import React, { useState } from 'react';
import { X, UploadCloud, RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';
import { parseBankStatementLines } from '@/lib/pdfParser';
import { enrichAndAnalyzeTransactions } from '@/lib/engine';
import { DisplayTransaction } from './RecentTransactions';

interface StatementUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportTransactions: (imported: DisplayTransaction[]) => void;
}

export default function StatementUploadModal({
  isOpen,
  onClose,
  onImportTransactions,
}: StatementUploadModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [summary, setSummary] = useState<{
    count: number;
    trueLiving: number;
    noiseFiltered: number;
    subscriptions: number;
  } | null>(null);

  if (!isOpen) return null;

  const handleLoadDemo = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const demoLines = [
        "HDFC BANK LIMITED - ACCOUNT STATEMENT",
        "02/10/2026 UPI/429182/SWIGGY/swiggy@icici 450.00 DR",
        "03/10/2026 TFR TO SELF MARCUS HYSA 15,000.00 DR",
        "05/10/2026 NETFLIX ENTERTAINMENT MTHLY 649.00 DR",
        "08/10/2026 SPOTIFY INDIA PREMIUM 119.00 DR",
        "12/10/2026 UPI/391028/ZARA STORE 4,200.00 DR",
        "15/10/2026 ZARA STORE RETURN REFUND 4,200.00 CR",
        "16/10/2026 NOBU DINNER SHARABLE BILL 5,400.00 DR",
        "17/10/2026 UPI/8812/P2P DINNER SPLIT REIMBURSEMENT 2,700.00 CR",
        "22/10/2026 CON EDISON ELECTRICITY 1,850.00 DR"
      ];

      const raw = parseBankStatementLines(demoLines);
      const analysis = enrichAndAnalyzeTransactions(raw);

      const converted: DisplayTransaction[] = analysis.enriched.map((item, idx) => ({
        id: `stmt_tx_${Date.now()}_${idx}`,
        title: item.cleanMerchant || item.rawDescription,
        rawTimeText: new Date(item.timestamp).toLocaleDateString('en-IN', {
          month: 'short',
          day: 'numeric',
        }),
        timestamp: item.timestamp,
        amount: item.amount,
        type: item.amount > 0 ? 'salary' : (item.category === 'Groceries' ? 'grocery' : 'other'),
      }));

      setSummary({
        count: converted.length,
        trueLiving: analysis.kpis.trueLivingExpenses,
        noiseFiltered: analysis.kpis.rawOutflows - analysis.kpis.trueLivingExpenses,
        subscriptions: analysis.subscriptions.length,
      });

      onImportTransactions(converted);
      setIsProcessing(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md rounded-[32px] bg-white text-slate-900 p-6 shadow-2xl overflow-hidden border border-slate-100">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="inline-flex p-3 rounded-2xl bg-orange-50 text-[#F97316] mb-2">
            <UploadCloud className="w-6 h-6 stroke-[2.2]" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Parse Bank Statement PDF</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Auto-detect self-transfers, merchant refunds & split offsets
          </p>
        </div>

        {summary ? (
          <div className="mt-5 space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <h4 className="text-sm font-bold text-emerald-900">
                {summary.count} Transactions Imported Successfully!
              </h4>
              <p className="text-xs text-emerald-700">
                Noise Deducted: ₹{summary.noiseFiltered.toLocaleString('en-IN')} (self-transfers & refunds)
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 rounded-2xl bg-slate-900 text-white font-bold text-xs"
            >
              Done & Return to Pocket
            </button>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            <div className="border-2 border-dashed border-slate-200 hover:border-orange-400 rounded-3xl p-6 text-center transition bg-slate-50">
              <UploadCloud className="w-10 h-10 text-orange-500 mx-auto mb-2" />
              <h4 className="text-xs font-bold text-slate-800">
                Drag & drop your bank statement PDF
              </h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Supports HDFC, ICICI, SBI, Axis, Canara, etc.
              </p>
              <button
                type="button"
                onClick={handleLoadDemo}
                disabled={isProcessing}
                className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition shadow-sm cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Analyzing Statement...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Load Sample Indian Statement
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
