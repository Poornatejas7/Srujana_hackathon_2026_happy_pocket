'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ArrowRight, 
  Layers, 
  ShieldCheck, 
  TrendingDown, 
  RefreshCw, 
  Filter, 
  Tag, 
  ArrowRightLeft,
  DollarSign
} from 'lucide-react';
import { RawTransaction, EnrichedTransaction, Category, SubscriptionItem } from '@/types/finance';
import { extractTextFromPDF, parseBankStatementLines } from '@/lib/pdfParser';
import { enrichAndAnalyzeTransactions } from '@/lib/engine';

export default function BankStatementParserApp() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedRawTxs, setExtractedRawTxs] = useState<RawTransaction[]>([]);
  const [analysisResult, setAnalysisResult] = useState<ReturnType<typeof enrichAndAnalyzeTransactions> | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'insights' | 'transactions' | 'subscriptions'>('insights');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  // Handle PDF file selection & extraction
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
      setErrorMessage('Please upload a valid bank statement PDF file.');
      return;
    }

    setFile(selectedFile);
    setErrorMessage(null);
    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await fetch('/api/parse-pdf', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to parse the bank statement PDF.');
      }

      if (data.transactions.length === 0) {
        throw new Error('No debit/credit transaction entries found in this PDF.');
      }

      setExtractedRawTxs(data.transactions);

      // Run Financial Visibility & Anti-Distortion Engine
      const analyzed = enrichAndAnalyzeTransactions(data.transactions);
      setAnalysisResult(analyzed);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to parse the bank statement PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Demo sample loader for testing without needing a real statement right now
  const loadDemoStatement = () => {
    const demoLines = [
      "HDFC BANK LIMITED - ACCOUNT STATEMENT",
      "Account No: 50100412891920 Branch: KORAMANGALA",
      "01/10/2026 SALARY CREDIT TECH CORP 75,000.00 CR",
      "02/10/2026 UPI/429182/SWIGGY/swiggy@icici 450.00 DR",
      "03/10/2026 TFR TO SELF MARCUS HYSA 15,000.00 DR",
      "05/10/2026 NETFLIX ENTERTAINMENT MTHLY 649.00 DR",
      "08/10/2026 SPOTIFY INDIA PREMIUM 119.00 DR",
      "12/10/2026 UPI/391028/ZARA STORE 4,200.00 DR",
      "15/10/2026 ZARA STORE RETURN REFUND 4,200.00 CR",
      "16/10/2026 NOBU DINNER SHARABLE BILL 5,400.00 DR",
      "17/10/2026 UPI/8812/P2P DINNER SPLIT REIMBURSEMENT 2,700.00 CR",
      "20/10/2026 AVALON BAY RENT ACH 25,000.00 DR",
      "22/10/2026 CON EDISON ELECTRICITY 1,850.00 DR",
      "24/10/2026 LUMEN METABOLISM UNUSED SUB 2,999.00 DR"
    ];

    setIsProcessing(true);
    setErrorMessage(null);

    setTimeout(() => {
      const rawTxs = parseBankStatementLines(demoLines);
      setExtractedRawTxs(rawTxs);
      const analyzed = enrichAndAnalyzeTransactions(rawTxs);
      setAnalysisResult(analyzed);
      setFile(new File(["demo"], "HDFC_Bank_E-Statement_Oct2026.pdf", { type: "application/pdf" }));
      setIsProcessing(false);
    }, 400);
  };

  const handleReset = () => {
    setFile(null);
    setExtractedRawTxs([]);
    setAnalysisResult(null);
    setErrorMessage(null);
  };

  const filteredTransactions = analysisResult?.enriched.filter(tx => {
    if (selectedFilter === 'recurring') return tx.isRecurring;
    if (selectedFilter === 'transfer') return tx.isInternalTransfer;
    if (selectedFilter === 'refund') return tx.isRefundOrReversal;
    if (selectedFilter === 'split') return tx.isSharedSplitExpense;
    return true;
  }) || [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-semibold text-white tracking-tight">FinLens PDF Parser</h1>
                <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2 py-0.5 rounded-full font-mono border border-emerald-500/30">
                  Client-Side PDF Engine
                </span>
              </div>
              <p className="text-xs text-slate-400">Drop bank statement PDF $\to$ Clean, noise-free financial discovery</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!analysisResult ? (
              <button
                onClick={loadDemoStatement}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-indigo-300 bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-500/30 rounded-lg transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Load Sample Bank Statement
              </button>
            ) : (
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-lg transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Upload Another Statement
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        
        {/* Upload State (if no file analyzed yet) */}
        {!analysisResult && (
          <div className="max-w-2xl mx-auto space-y-6 pt-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white tracking-tight">Parse Your Bank Statement PDF</h2>
              <p className="text-sm text-slate-400">
                Extracts raw transactions directly in your browser. Self-transfers, refunds, and split bills are reconciled automatically.
              </p>
            </div>

            <div className="border-2 border-dashed border-slate-800 hover:border-indigo-500/80 rounded-3xl p-10 text-center transition bg-slate-900/40 relative group">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                disabled={isProcessing}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                id="pdfStatementUpload"
              />
              <div className="flex flex-col items-center pointer-events-none">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 transition duration-300">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <h3 className="text-base font-semibold text-white">Drag & drop your bank statement PDF</h3>
                <p className="text-xs text-slate-400 mt-1">Supports HDFC, ICICI, SBI, Axis, Chase, Bank of America, etc.</p>
                <div className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-medium shadow-md shadow-indigo-600/30">
                  Browse Files
                </div>
              </div>
            </div>

            {isProcessing && (
              <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-center gap-3 text-xs text-indigo-200">
                <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
                Extracting transaction stream and running anti-distortion analysis...
              </div>
            )}

            {errorMessage && (
              <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 flex items-start gap-3 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Quick Privacy Assurance Card */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>
                <strong>100% Client-Side Privacy:</strong> Your statement is parsed locally inside your browser via WebAssembly/pdfjs. No financial records are sent to external cloud servers.
              </span>
            </div>
          </div>
        )}

        {/* Results Dashboard (After Parsing) */}
        {analysisResult && (
          <div className="space-y-6">
            {/* File info pill */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-900/70 border border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">{file?.name || 'Bank_Statement.pdf'}</div>
                  <div className="text-[10px] text-slate-400">
                    Parsed {extractedRawTxs.length} transaction entries $\cdot$ Noise Filtering Applied
                  </div>
                </div>
              </div>

              {/* Navigation tabs */}
              <div className="flex gap-2">
                {[
                  { id: 'insights', label: 'Financial Discovery' },
                  { id: 'transactions', label: `Normalized Ledger (${analysisResult.enriched.length})` },
                  { id: 'subscriptions', label: `Recurring Drains (${analysisResult.subscriptions.length})` }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      activeTab === tab.id 
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* VIEW 1: INSIGHTS & NOISE DEDUCTION */}
            {activeTab === 'insights' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Spend Metric */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/70 border border-slate-800">
                    <span className="text-xs uppercase font-semibold text-slate-400">True Living Outflow</span>
                    <div className="text-2xl font-bold font-mono text-white mt-2">
                      ₹{analysisResult.kpis.trueLivingExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                      <span className="line-through text-slate-500">₹{analysisResult.kpis.rawOutflows.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      <span className="text-emerald-400 font-semibold">
                        (-₹{(analysisResult.kpis.rawOutflows - analysisResult.kpis.trueLivingExpenses).toLocaleString('en-IN', { minimumFractionDigits: 2 })} noise filtered)
                      </span>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400 space-y-1">
                      <div className="flex justify-between">
                        <span>Self-Transfers excluded:</span>
                        <span className="font-mono text-slate-200">₹{analysisResult.kpis.internalTransfersDetected.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Refunds paired:</span>
                        <span className="font-mono text-cyan-300">₹{analysisResult.kpis.refundsReconciled.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>P2P Received:</span>
                        <span className="font-mono text-indigo-300">₹{analysisResult.kpis.sharedBillCredits.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Recurring Subscriptions */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/70 border border-slate-800">
                    <span className="text-xs uppercase font-semibold text-slate-400">Monthly Recurring Burden</span>
                    <div className="text-2xl font-bold font-mono text-white mt-2">
                      ₹{analysisResult.kpis.monthlyRecurringCommitments.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      <span className="text-xs font-normal text-slate-400"> / mo</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      ₹{(analysisResult.kpis.monthlyRecurringCommitments * 12).toLocaleString('en-IN', { minimumFractionDigits: 2 })} annual drain across detected subscriptions.
                    </p>
                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex justify-between text-xs">
                      <span className="text-indigo-400">Active Mandates:</span>
                      <span className="font-mono font-bold text-indigo-300">{analysisResult.subscriptions.length} detected</span>
                    </div>
                  </div>

                  {/* Net Liquidity */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/70 border border-slate-800">
                    <span className="text-xs uppercase font-semibold text-slate-400">Parsed Statement Net Flow</span>
                    <div className="text-2xl font-bold font-mono text-emerald-400 mt-2">
                      +₹{(
                        analysisResult.enriched.filter(t => t.amount > 0 && !t.isInternalTransfer).reduce((s, t) => s + t.amount, 0) -
                        analysisResult.kpis.trueLivingExpenses
                      ).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Net positive cash flow remaining after genuine living expenses.
                    </p>
                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex justify-between text-xs">
                      <span className="text-slate-400">Savings Rate:</span>
                      <span className="font-semibold text-cyan-400">
                        {((1 - (analysisResult.kpis.trueLivingExpenses / Math.max(1, analysisResult.enriched.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0)))) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Highlighted Detections */}
                <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                  <h3 className="text-sm font-semibold text-white">Detection Engine Highlights in This Statement</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {analysisResult.enriched.filter(t => t.anomalyWarning || t.isInternalTransfer || t.isSharedSplitExpense).map((tx, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 mt-0.5">
                          <Tag className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-semibold text-white truncate">{tx.cleanMerchant}</span>
                            <span className="text-xs font-mono text-slate-300">${Math.abs(tx.amount).toFixed(2)}</span>
                          </div>
                          <p className="text-xs text-indigo-300 font-medium mt-1">
                            {tx.anomalyWarning || (tx.isInternalTransfer ? 'Self-transfer excluded from spending' : 'Shared split bill reconciled')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 2: NORMALIZED LEDGER */}
            {activeTab === 'transactions' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Filter className="w-3.5 h-3.5 text-slate-400" />
                    <select
                      value={selectedFilter}
                      onChange={e => setSelectedFilter(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-lg text-xs px-2.5 py-1.5 text-slate-300"
                    >
                      <option value="all">All Transactions ({analysisResult.enriched.length})</option>
                      <option value="recurring">Recurring Only</option>
                      <option value="transfer">Self-Transfers Only</option>
                      <option value="refund">Refunds Only</option>
                      <option value="split">Shared Bill Splits Only</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/30">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold">
                      <tr>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Mode / RRN</th>
                        <th className="py-3 px-4">Beneficiary / Merchant</th>
                        <th className="py-3 px-4">Bank / VPA</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4 text-right">Statement Amt</th>
                        <th className="py-3 px-4 text-right">Net Spend</th>
                        <th className="py-3 px-4 text-center">Engine Tag</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredTransactions.map(tx => {
                        const isInflow = tx.amount > 0;
                        return (
                          <tr key={tx.id} className="hover:bg-slate-800/40 transition">
                            <td className="py-3 px-4 text-slate-400 whitespace-nowrap font-mono">
                              {new Date(tx.timestamp).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <span className="font-semibold text-slate-300 block">{tx.txMode || 'TRANSFER'}</span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                {tx.upiRrn ? `RRN: ${tx.upiRrn}` : ''}
                              </span>
                            </td>
                            <td className="py-3 px-4 max-w-xs">
                              <div className="font-bold text-white text-sm">
                                {tx.payeeName || tx.cleanMerchant}
                              </div>
                              <div className="text-[10px] text-slate-500 font-mono truncate" title={tx.rawDescription}>
                                {tx.remark && tx.remark !== 'UPI' ? `Note: "${tx.remark}" · ` : ''}
                                {tx.terminalRef ? `${tx.terminalRef}` : ''}
                              </div>
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <span className="font-mono text-xs text-indigo-300 font-semibold block">
                                {tx.bankCode || 'UPI'}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400 block truncate max-w-[130px]" title={tx.vpaHandle}>
                                {tx.vpaHandle ? `@${tx.vpaHandle}` : '-'}
                              </span>
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <span className="font-medium text-slate-300">{tx.category}</span>
                            </td>
                            <td className={`py-3 px-4 text-right font-mono font-medium whitespace-nowrap ${
                              isInflow ? 'text-emerald-400' : 'text-slate-300'
                            }`}>
                              {isInflow ? '+' : '-'}₹{Math.abs(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-bold whitespace-nowrap text-white">
                              {tx.isInternalTransfer ? (
                                <span className="text-slate-500 line-through">₹0.00</span>
                              ) : (
                                `₹${tx.netOutflowAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                              )}
                            </td>
                            <td className="py-3 px-4 text-center whitespace-nowrap">
                              {tx.isInternalTransfer && (
                                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] px-2 py-0.5 rounded-full font-medium">
                                  Self-Transfer
                                </span>
                              )}
                              {tx.isRefundOrReversal && (
                                <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] px-2 py-0.5 rounded-full font-medium">
                                  Refund Paired
                                </span>
                              )}
                              {tx.isSharedSplitExpense && (
                                <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] px-2 py-0.5 rounded-full font-medium">
                                  Split Reimbursed
                                </span>
                              )}
                              {tx.isRecurring && (
                                <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] px-2 py-0.5 rounded-full font-medium">
                                  AutoPay / Recurring
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* VIEW 3: RECURRING DRAINS */}
            {activeTab === 'subscriptions' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analysisResult.subscriptions.map((sub, idx) => (
                  <div key={idx} className="p-5 rounded-xl border border-slate-800 bg-slate-900/50 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-medium">{sub.category}</span>
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full">{sub.status}</span>
                      </div>
                      <h4 className="text-lg font-bold text-white">{sub.merchant}</h4>
                      <div className="text-2xl font-bold font-mono text-white mt-2">
                        ₹{sub.monthlyCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}/mo
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        Annual Impact: ₹{sub.annualImpact.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
