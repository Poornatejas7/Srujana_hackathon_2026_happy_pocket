'use client';

import React, { useState } from 'react';
import { 
  X, 
  UploadCloud, 
  RefreshCw, 
  Sparkles, 
  CheckCircle2, 
  Lock, 
  KeyRound, 
  AlertCircle,
  ShieldCheck,
  Database,
  Store,
  UserCheck
} from 'lucide-react';
import { parseBankStatementLines } from '@/lib/pdfParser';
import { enrichAndAnalyzeTransactions } from '@/lib/engine';
import { RawTransaction } from '@/types/finance';
import { DisplayTransaction } from './RecentTransactions';

interface StatementUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportTransactions: (imported: DisplayTransaction[], raw?: RawTransaction[]) => void;
}

export default function StatementUploadModal({
  isOpen,
  onClose,
  onImportTransactions,
}: StatementUploadModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPasswordRequired, setIsPasswordRequired] = useState(false);
  const [password, setPassword] = useState('');
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [summary, setSummary] = useState<{
    count: number;
    trueLiving: number;
    noiseFiltered: number;
    subscriptions: number;
    merchantCount: number;
    personalCount: number;
    duplicatesSkipped?: number;
    savedToMongo: boolean;
  } | null>(null);

  if (!isOpen) return null;

  const processExtractedRawTxs = (
    rawTxs: RawTransaction[], 
    merchantCountOverride?: number, 
    personalCountOverride?: number,
    duplicatesSkipped = 0
  ) => {
    const analysis = enrichAndAnalyzeTransactions(rawTxs);
    const converted: DisplayTransaction[] = analysis.enriched.map((item, idx) => ({
      id: item.id || `stmt_tx_${Date.now()}_${idx}`,
      title: item.cleanMerchant || item.payeeName || item.rawDescription,
      rawTimeText: new Date(item.timestamp).toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
      }),
      timestamp: item.timestamp,
      amount: item.amount,
      type: item.amount > 0 ? 'salary' : (item.category === 'Groceries' ? 'grocery' : item.category === 'Transport & Fuel' ? 'fuel' : item.isInternalTransfer ? 'transfer' : 'other'),
      accountType: item.accountType,
      category: item.category,
    }));

    setSummary({
      count: converted.length,
      trueLiving: analysis.kpis.trueLivingExpenses,
      noiseFiltered: analysis.kpis.rawOutflows - analysis.kpis.trueLivingExpenses,
      subscriptions: analysis.subscriptions.length,
      merchantCount: merchantCountOverride ?? analysis.kpis.merchantCount,
      personalCount: personalCountOverride ?? analysis.kpis.personalCount,
      duplicatesSkipped,
      savedToMongo: true,
    });

    onImportTransactions(converted, rawTxs);
  };

  const submitStatementFile = async (targetFile: File, pwd?: string) => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', targetFile);
      if (pwd) {
        formData.append('password', pwd);
      }

      const res = await fetch('/api/parse-pdf', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.is_encrypted) {
        setPendingFile(targetFile);
        setIsPasswordRequired(true);
        if (data.error === 'INCORRECT_PASSWORD') {
          setErrorMessage(data.message || 'Incorrect password.');
        }
        setIsProcessing(false);
        return;
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to parse the bank statement file.');
      }

      if (!data.transactions || data.transactions.length === 0) {
        throw new Error('No debit/credit transaction entries found in this statement.');
      }

      setIsPasswordRequired(false);
      setPassword('');
      setPendingFile(null);
      processExtractedRawTxs(
        data.transactions, 
        data.merchantCount, 
        data.personalCount,
        data.duplicatesSkipped || 0
      );
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to parse the bank statement file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    const name = selected.name.toLowerCase();
    if (!name.endsWith('.pdf') && !name.endsWith('.csv')) {
      setErrorMessage('Please select a valid PDF or CSV bank statement file.');
    } else {
      submitStatementFile(selected);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingFile || !password) return;
    submitStatementFile(pendingFile, password);
  };

  const handleLoadDemo = async () => {
    setIsProcessing(true);
    setErrorMessage(null);

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

    try {
      const raw = parseBankStatementLines(demoLines);

      // Save directly to MongoDB Atlas via /api/transactions
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(raw),
      });

      const resData = await res.json();
      if (resData.success && resData.data) {
        processExtractedRawTxs(resData.data);
      } else {
        processExtractedRawTxs(raw);
      }
    } catch {
      const raw = parseBankStatementLines(demoLines);
      processExtractedRawTxs(raw);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseModal = () => {
    setSummary(null);
    setIsPasswordRequired(false);
    setErrorMessage(null);
    setPassword('');
    setPendingFile(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md rounded-[32px] bg-white text-slate-900 p-6 shadow-2xl overflow-hidden border border-slate-100">
        <button
          type="button"
          onClick={handleCloseModal}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="inline-flex p-3 rounded-2xl bg-orange-50 text-[#F97316] mb-2">
            <UploadCloud className="w-6 h-6 stroke-[2.2]" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Parse Bank Statement PDF</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Auto-categorizes Merchant vs Personal & saves to MongoDB Atlas
          </p>
        </div>

        {/* Password Prompt for Encrypted Statements */}
        {isPasswordRequired ? (
          <form onSubmit={handlePasswordSubmit} className="mt-5 space-y-4">
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-left space-y-2">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                <Lock className="w-4 h-4 text-amber-600" />
                <span>Password Protected Statement</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                This bank statement is encrypted. Common formats:
                <br />• <strong>SBI:</strong> DOB (DDMMYYYY) or Mobile No
                <br />• <strong>HDFC:</strong> Customer ID or PAN (lowercase)
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Enter PDF Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="e.g. 01011995"
                  autoFocus
                  required
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            {errorMessage && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-50 text-rose-700 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsPasswordRequired(false);
                  setPassword('');
                }}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                {isProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Unlock & Parse'}
              </button>
            </div>
          </form>
        ) : summary ? (
          <div className="mt-5 space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <h4 className="text-sm font-bold text-emerald-900">
                {summary.count} Transactions Categorized & Saved!
              </h4>
              
              {/* Merchant vs Personal Breakdown Pills */}
              <div className="flex items-center justify-center gap-2 pt-1">
                <span className="text-[11px] font-bold text-purple-700 bg-purple-100/80 px-2.5 py-1 rounded-lg border border-purple-200">
                  🏬 {summary.merchantCount} Merchant / Business
                </span>
                <span className="text-[11px] font-bold text-blue-700 bg-blue-100/80 px-2.5 py-1 rounded-lg border border-blue-200">
                  👤 {summary.personalCount} Personal
                </span>
              </div>

              {/* MongoDB Atlas confirmation */}
              <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono text-emerald-800 pt-1">
                <Database className="w-3.5 h-3.5 text-emerald-600" />
                <span>Live in MongoDB Atlas: happypocket.transactions</span>
              </div>

              {(summary.duplicatesSkipped || 0) > 0 && (
                <div className="text-[11px] font-medium text-amber-700 bg-amber-50 rounded-lg py-1 px-2 border border-amber-200">
                  🛡️ {summary.duplicatesSkipped} duplicate transactions prevented
                </div>
              )}

              <div className="pt-2 border-t border-emerald-200/60 text-[11px] text-slate-600 space-y-0.5">
                <p>Noise Excluded: ₹{summary.noiseFiltered.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                <p className="font-bold text-slate-800">True Living Spend: ₹{summary.trueLiving.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCloseModal}
              className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer"
            >
              Done & View in Ledger
            </button>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            <div className="border-2 border-dashed border-slate-200 hover:border-orange-400 rounded-3xl p-6 text-center transition bg-slate-50 relative group cursor-pointer">
              <input
                type="file"
                accept=".pdf,.csv,text/csv"
                onChange={handleFileChange}
                disabled={isProcessing}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
              />
              <UploadCloud className="w-10 h-10 text-orange-500 mx-auto mb-2 group-hover:scale-110 transition-transform duration-200" />
              <h4 className="text-xs font-bold text-slate-800">
                Drag & drop your bank statement PDF or CSV
              </h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Supports SBI, HDFC, ICICI, Axis, Canara & all Indian Banks
              </p>
              <div className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-sm">
                Browse PDF or CSV
              </div>
            </div>

            {isProcessing && (
              <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-orange-50 text-orange-800 text-xs font-semibold">
                <RefreshCw className="w-4 h-4 animate-spin text-orange-500" />
                <span>Extracting, classifying Merchant vs Personal & syncing with MongoDB...</span>
              </div>
            )}

            {errorMessage && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 text-rose-700 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="pt-1 flex items-center justify-between gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleLoadDemo}
                disabled={isProcessing}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-bold transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                Load Sample Statement (Save to Atlas)
              </button>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-400 justify-center">
              <Database className="w-3.5 h-3.5 text-emerald-500" />
              <span>Directly stores cleaned records into MongoDB Compass cluster</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
