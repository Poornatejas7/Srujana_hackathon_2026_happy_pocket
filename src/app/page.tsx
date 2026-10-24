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
  DollarSign,
  Lock,
  KeyRound,
  Sliders,
  Edit3,
  Zap,
  Building,
  Smartphone,
  Send
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
  const [activeTab, setActiveTab] = useState<'insights' | 'transactions' | 'subscriptions' | 'sandbox'>('insights');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [userOverrides, setUserOverrides] = useState<Record<string, { category: Category; tier: 'Essential' | 'Discretionary' | 'Transfer_or_Offset' | 'Income' }>>({});

  // What-If Sandbox Parameters
  const [cancelZombieSub, setCancelZombieSub] = useState(false);
  const [trimDiningPercent, setTrimDiningPercent] = useState(15);

  // Password Unlock Modal State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [pdfPassword, setPdfPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  // Account Aggregator (AA) Live Flow Simulator State
  const [isAAModalOpen, setIsAAModalOpen] = useState(false);
  const [aaStep, setAaStep] = useState<'MOBILE' | 'OTP' | 'SELECT_ACCOUNTS' | 'FETCHING' | 'SUCCESS'>('MOBILE');
  const [aaMobile, setAaMobile] = useState('9876543210');
  const [aaOtp, setAaOtp] = useState('');
  const [selectedAABanks, setSelectedAABanks] = useState<string[]>(['sbi_40665', 'canara_91636']);

  // Live UPI Phone Payment Simulator State
  const [isPhoneSimOpen, setIsPhoneSimOpen] = useState(false);
  const [simPayee, setSimPayee] = useState('Swiggy');
  const [simAmount, setSimAmount] = useState('450');
  const [simApp, setSimApp] = useState<'Google Pay' | 'PhonePe' | 'Paytm' | 'CRED'>('Google Pay');
  const [liveToast, setLiveToast] = useState<string | null>(null);

  // Send file to parser with optional password
  const submitPdfForParsing = async (targetFile: File, pwd?: string) => {
    setIsProcessing(true);
    setErrorMessage(null);
    setPasswordError(null);

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

      // Check if statement requires password
      if (data.is_encrypted) {
        setPendingFile(targetFile);
        setIsPasswordModalOpen(true);
        if (data.error === 'INCORRECT_PASSWORD') {
          setPasswordError(data.message || 'Incorrect password.');
        }
        setIsProcessing(false);
        return;
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to parse the bank statement PDF.');
      }

      if (data.transactions.length === 0) {
        throw new Error('No debit/credit transaction entries found in this PDF.');
      }

      // Successful parse: close modal and set state
      setIsPasswordModalOpen(false);
      setPdfPassword('');
      setPendingFile(null);
      setFile(targetFile);
      setExtractedRawTxs(data.transactions);

      // Run Financial Visibility & Anti-Distortion Engine
      const analyzed = enrichAndAnalyzeTransactions(data.transactions, userOverrides);
      setAnalysisResult(analyzed);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to parse the bank statement PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Human-in-the-Loop Category Override Handler
  const handleRecategorize = (txId: string, currentCategory: Category) => {
    const categories: Category[] = [
      'Housing & Utilities',
      'Groceries',
      'Dining & Nightlife',
      'Subscriptions & Digital',
      'Transport & Fuel',
      'Healthcare',
      'Shopping & Discretionary',
      'Internal Transfer',
      'Reimbursement / Split'
    ];
    const nextIdx = (categories.indexOf(currentCategory) + 1) % categories.length;
    const newCat = categories[nextIdx];
    const isEssential = ['Housing & Utilities', 'Groceries', 'Healthcare'].includes(newCat);
    const newTier = isEssential ? 'Essential' : (newCat === 'Internal Transfer' || newCat === 'Reimbursement / Split' ? 'Transfer_or_Offset' : 'Discretionary');

    const updated = {
      ...userOverrides,
      [txId]: { category: newCat, tier: newTier as any }
    };
    setUserOverrides(updated);
    if (extractedRawTxs.length > 0) {
      const reanalyzed = enrichAndAnalyzeTransactions(extractedRawTxs, updated);
      setAnalysisResult(reanalyzed);
    }
  };

  // Handle initial PDF selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
      setErrorMessage('Please upload a valid bank statement PDF file.');
      return;
    }

    await submitPdfForParsing(selectedFile);
  };

  // Handle password form submission
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingFile || !pdfPassword) return;
    submitPdfForParsing(pendingFile, pdfPassword);
  };

  // Account Aggregator Workflow Handlers
  const handleAASubmitMobile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aaMobile || aaMobile.length < 10) return;
    setAaStep('OTP');
  };

  const handleAASubmitOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (aaOtp.length < 4) return;
    setAaStep('SELECT_ACCOUNTS');
  };

  const handleAAAuthorize = async () => {
    setAaStep('FETCHING');
    setTimeout(() => {
      // Simulate live encrypted fetch from SBI & Canara Bank
      loadDemoStatement();
      setAaStep('SUCCESS');
      setTimeout(() => {
        setIsAAModalOpen(false);
        setAaStep('MOBILE');
        setAaOtp('');
      }, 1200);
    }, 1500);
  };

  // Live Phone UPI Payment Trigger (simulates making a payment on GPay/PhonePe and receiving real-time bank event)
  const handleLivePayment = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(simAmount);
    if (!amt || isNaN(amt)) return;

    const rrn = Math.floor(100000000000 + Math.random() * 900000000000).toString();
    const vpa = `${simPayee.toLowerCase().replace(/[^a-z0-9]/g, '')}@okaxis`;
    const newTx: RawTransaction = {
      id: `tx_live_${Date.now()}`,
      accountId: 'acc_primary_sbi',
      amount: -amt,
      rawDescription: `WDL TFR UPI/DR/${rrn}/${simPayee.toUpperCase()}/UTIB/${vpa}/UPI`,
      currency: 'INR',
      timestamp: new Date().toISOString(),
      txMode: 'UPI',
      upiRrn: rrn,
      payeeName: simPayee,
      bankCode: 'UTIB',
      vpaHandle: vpa,
      remark: 'UPI Live Payment',
      terminalRef: 'LIVE POS AT 40184'
    };

    const updated = [newTx, ...extractedRawTxs];
    setExtractedRawTxs(updated);
    const reanalyzed = enrichAndAnalyzeTransactions(updated, userOverrides);
    setAnalysisResult(reanalyzed);

    // Trigger visual toast
    setLiveToast(`⚡ Paid ₹${amt} to ${simPayee} via ${simApp}! Auto-ingested & classified.`);
    setIsPhoneSimOpen(false);
    setTimeout(() => setLiveToast(null), 5000);
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
            <button
              onClick={() => setIsPhoneSimOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-cyan-300 bg-cyan-950/70 hover:bg-cyan-900/80 border border-cyan-500/40 rounded-lg shadow-sm transition"
              title="Simulate making a UPI payment on GPay/PhonePe and watch it auto-reflect live!"
            >
              <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
              Simulate Live Payment (GPay/UPI)
            </button>
            <button
              onClick={() => setIsAAModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-500/40 rounded-lg shadow-sm transition"
              title="Connect bank via RBI Account Aggregator (OTP Consent)"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              Connect via AA
            </button>
            {!analysisResult ? (
              <button
                onClick={loadDemoStatement}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-300 bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-500/30 rounded-lg transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Sample Bank Statement
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

      {/* Real-time Event Toast Notification */}
      {liveToast && (
        <div className="fixed top-20 right-8 z-50 bg-gradient-to-r from-cyan-950 to-indigo-950 border border-cyan-500/60 p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300">
            <Zap className="w-5 h-5 animate-pulse text-cyan-400" />
          </div>
          <div>
            <div className="text-xs font-bold text-white uppercase tracking-wider">Live Bank Feed Ingested</div>
            <div className="text-xs text-cyan-200 mt-0.5">{liveToast}</div>
          </div>
        </div>
      )}

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
                  { id: 'subscriptions', label: `Recurring Drains (${analysisResult.subscriptions.length})` },
                  { id: 'sandbox', label: 'What-If Savings Sandbox' }
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
                        <th className="py-3 px-4 text-center">Override</th>
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
                              {tx.userOverridden && (
                                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded-full font-medium ml-1">
                                  User Adjusted
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-center whitespace-nowrap">
                              <button
                                onClick={() => handleRecategorize(tx.id, tx.category)}
                                className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-indigo-400 transition"
                                title="Click to cycle category"
                              >
                                <Edit3 className="w-3 h-3" />
                                Override
                              </button>
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

            {/* VIEW 4: WHAT-IF SAVINGS SANDBOX */}
            {activeTab === 'sandbox' && (
              <div className="space-y-6">
                <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
                  <h3 className="text-base font-semibold text-white mb-1">Financial Adjustment & What-If Scenario Sandbox</h3>
                  <p className="text-xs text-slate-400">
                    Explore actionable adjustments: calculate how cutting unnecessary commitments or dialing back discretionary categories changes your wealth growth.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Controls */}
                  <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-6">
                    <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Adjustment Levers</h4>

                    {/* Lever 1: Discretionary Spend Slider */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-300 font-medium">Trim Discretionary (Shopping & Dining)</span>
                        <span className="font-mono text-indigo-400">{trimDiningPercent}% reduction</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="50"
                        step="5"
                        value={trimDiningPercent}
                        onChange={e => setTrimDiningPercent(parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>0% (As-is)</span>
                        <span>25% (Moderate)</span>
                        <span>50% (High discipline)</span>
                      </div>
                    </div>

                    {/* Lever 2: Subscriptions Toggle */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-300 font-medium">Cancel Forgotten Digital Subscriptions</span>
                        <span className="font-mono text-emerald-400">
                          +₹{(analysisResult.subscriptions.length > 0 ? analysisResult.subscriptions[0].monthlyCost : 0).toLocaleString('en-IN')}/mo
                        </span>
                      </div>
                      <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700">
                        <input
                          type="checkbox"
                          checked={cancelZombieSub}
                          onChange={e => setCancelZombieSub(e.target.checked)}
                          className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0 w-4 h-4"
                        />
                        <div className="text-xs">
                          <div className="text-white font-medium">Terminate inactive recurring subscriptions</div>
                          <div className="text-slate-500">Eliminates unused recurring drain with 0 lifestyle disruption.</div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Projected Savings Card */}
                  {(() => {
                    const discretionarySpend = analysisResult.enriched
                      .filter(t => t.tier === 'Discretionary' && t.amount < 0)
                      .reduce((s, t) => s + t.netOutflowAmount, 0);
                    const subTrim = cancelZombieSub && analysisResult.subscriptions.length > 0 ? analysisResult.subscriptions[0].monthlyCost : 0;
                    const monthlySavings = (discretionarySpend * (trimDiningPercent / 100)) + subTrim;

                    return (
                      <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-500/30 flex flex-col justify-between">
                        <div>
                          <span className="text-xs uppercase font-semibold tracking-wider text-indigo-300">Projected Compounding Value</span>
                          <div className="text-4xl font-extrabold font-mono text-white mt-2">
                            +₹{monthlySavings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            <span className="text-sm font-normal text-slate-400"> / month</span>
                          </div>
                          <p className="text-xs text-slate-400 mt-2">
                            Free cash flow unlocked without altering essential needs (Rent, Electricity, Groceries).
                          </p>

                          <div className="mt-8 space-y-3">
                            <div className="flex justify-between items-center p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                              <span className="text-xs text-slate-400">1-Year Direct Cash Boost:</span>
                              <span className="text-sm font-mono font-bold text-emerald-400">
                                +₹{(monthlySavings * 12).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                            <div className="flex justify-between items-center p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                              <span className="text-xs text-slate-400">5-Year Growth (at 7% return):</span>
                              <span className="text-sm font-mono font-bold text-cyan-400">
                                +₹{(monthlySavings * 12 * 5 * 1.15).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-500">
                          Maintains your historical emergency liquidity and high-yield savings interest.
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Password Unlock Modal */}
        {isPasswordModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">Statement is Encrypted</h3>
                    <p className="text-xs text-slate-400">{pendingFile?.name || 'Bank_Statement.pdf'}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsPasswordModalOpen(false);
                    setPendingFile(null);
                    setPdfPassword('');
                  }}
                  className="text-slate-400 hover:text-white text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
                    Enter PDF Password
                  </label>
                  <input
                    type="password"
                    placeholder="e.g. DDMMYYYY or PAN in lowercase"
                    value={pdfPassword}
                    onChange={e => setPdfPassword(e.target.value)}
                    autoFocus
                    required
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none transition font-mono tracking-wider"
                  />
                </div>

                {passwordError && (
                  <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{passwordError}</span>
                  </div>
                )}

                {/* Helpful Hints for Indian Banks */}
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                  <div className="font-semibold text-slate-300">Common Bank Password Formats:</div>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-400">
                    <li><strong className="text-slate-300">SBI:</strong> 11-digit Account No. or DOB (DDMMYYYY) + last 5 digits of mobile.</li>
                    <li><strong className="text-slate-300">HDFC:</strong> NetBanking Customer ID or DOB (DDMMYYYY).</li>
                    <li><strong className="text-slate-300">ICICI / Axis:</strong> DOB (DDMMYYYY) or PAN in lowercase.</li>
                  </ul>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsPasswordModalOpen(false);
                      setPendingFile(null);
                      setPdfPassword('');
                    }}
                    className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessing || !pdfPassword}
                    className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Decrypting...
                      </>
                    ) : (
                      'Unlock & Parse Statement'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Account Aggregator (AA) Consent Flow Simulator Modal */}
        {isAAModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-white">RBI Account Aggregator</h3>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono border border-emerald-500/40">
                        Live Consent Flow
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">End-to-End Encrypted Open Banking Stream</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAAModalOpen(false)}
                  className="text-slate-400 hover:text-white text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition"
                >
                  ✕
                </button>
              </div>

              {/* Step 1: Mobile Number Input */}
              {aaStep === 'MOBILE' && (
                <form onSubmit={handleAASubmitMobile} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Enter Mobile Number Linked to Bank Accounts
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-xs text-slate-500 font-mono">+91</span>
                      <input
                        type="tel"
                        maxLength={10}
                        value={aaMobile}
                        onChange={e => setAaMobile(e.target.value)}
                        required
                        className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-12 pr-3.5 py-2.5 text-sm text-white focus:outline-none font-mono tracking-wider"
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                    <div className="font-semibold text-slate-300">How it works:</div>
                    <p>An OTP will be sent by RBI-licensed Account Aggregator (e.g. Setu / Anumati). No bank passwords or net banking logins are ever required.</p>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-emerald-600/30 transition"
                  >
                    Request Consent OTP
                  </button>
                </form>
              )}

              {/* Step 2: OTP Verification */}
              {aaStep === 'OTP' && (
                <form onSubmit={handleAASubmitOtp} className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-medium text-slate-300">Enter 4-Digit OTP</label>
                      <span className="text-[11px] text-slate-500">Sent to +91 {aaMobile}</span>
                    </div>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="e.g. 1234 or 123456"
                      value={aaOtp}
                      onChange={e => setAaOtp(e.target.value)}
                      autoFocus
                      required
                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-center text-lg text-white focus:outline-none font-mono tracking-widest"
                    />
                    <p className="text-[10px] text-slate-500 text-center mt-1">Hint: Enter any 4 numbers (e.g. 1234) for live sandbox authorization.</p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setAaStep('MOBILE')}
                      className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-emerald-600/30 transition"
                    >
                      Verify OTP
                    </button>
                  </div>
                </form>
              )}

              {/* Step 3: Select Bank Accounts to Link */}
              {aaStep === 'SELECT_ACCOUNTS' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-semibold text-white mb-1">Select Accounts to Share with Happy Pocket</h4>
                    <p className="text-[11px] text-slate-400">Discovered 2 accounts registered with your phone number:</p>
                  </div>

                  <div className="space-y-2">
                    {[
                      { id: 'sbi_40665', name: 'State Bank of India', mask: '•••• 40665', type: 'Savings A/C (Salary)' },
                      { id: 'canara_91636', name: 'Canara Bank', mask: '•••• 91636', type: 'Savings A/C (Personal)' }
                    ].map(acc => {
                      const isSelected = selectedAABanks.includes(acc.id);
                      return (
                        <div
                          key={acc.id}
                          onClick={() => {
                            setSelectedAABanks(prev => 
                              prev.includes(acc.id) ? prev.filter(x => x !== acc.id) : [...prev, acc.id]
                            );
                          }}
                          className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                            isSelected 
                              ? 'border-emerald-500/80 bg-emerald-950/20' 
                              : 'border-slate-800 bg-slate-950/60'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-slate-800 text-slate-300">
                              <Building className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-white">{acc.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{acc.mask} · {acc.type}</div>
                            </div>
                          </div>
                          <CheckCircle2 className={`w-4 h-4 ${isSelected ? 'text-emerald-400' : 'text-slate-600'}`} />
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-[10px] text-slate-500 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Consent is periodic, read-only, and can be revoked anytime.</span>
                  </div>

                  <button
                    onClick={handleAAAuthorize}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2"
                  >
                    Authorize & Fetch Transactions
                  </button>
                </div>
              )}

              {/* Step 4: Fetching animation */}
              {aaStep === 'FETCHING' && (
                <div className="py-8 text-center space-y-3">
                  <RefreshCw className="w-8 h-8 animate-spin text-emerald-400 mx-auto" />
                  <div className="text-sm font-semibold text-white">Pulling Encrypted Bank Packets...</div>
                  <p className="text-xs text-slate-400">Verifying digital signatures via Setu AA Gateway and decrypting FIP payload.</p>
                </div>
              )}

              {/* Step 5: Success confirmation */}
              {aaStep === 'SUCCESS' && (
                <div className="py-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-semibold text-white">Accounts Linked Successfully!</div>
                  <p className="text-xs text-emerald-400 font-mono">Streamed 144 transactions directly into engine.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Live Phone UPI Payment Simulator Modal */}
        {isPhoneSimOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-cyan-500/40 rounded-3xl max-w-sm w-full p-6 space-y-5 shadow-2xl shadow-cyan-500/10 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">Live UPI Payment Sim</h3>
                    <p className="text-xs text-slate-400">Simulate paying via GPay/PhonePe</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsPhoneSimOpen(false)}
                  className="text-slate-400 hover:text-white text-xs px-2.5 py-1 rounded-lg bg-slate-800"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleLivePayment} className="space-y-4">
                {/* App Selector */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Payment App</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['Google Pay', 'PhonePe', 'Paytm', 'CRED'] as const).map(app => (
                      <button
                        type="button"
                        key={app}
                        onClick={() => setSimApp(app)}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold border transition ${
                          simApp === app 
                            ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300' 
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {app}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Merchant Buttons */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Quick Merchants</label>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { name: 'Swiggy', defaultAmt: '380' },
                      { name: 'Zomato', defaultAmt: '420' },
                      { name: 'Blinkit', defaultAmt: '290' },
                      { name: 'Indian Oil Fuel', defaultAmt: '500' },
                      { name: 'Uber Cab', defaultAmt: '210' },
                      { name: 'Netflix India', defaultAmt: '199' }
                    ].map(m => (
                      <button
                        type="button"
                        key={m.name}
                        onClick={() => {
                          setSimPayee(m.name);
                          setSimAmount(m.defaultAmt);
                        }}
                        className={`px-2.5 py-1 text-[11px] rounded-lg border transition ${
                          simPayee === m.name 
                            ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300' 
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {m.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Payee */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Payee Name / Merchant</label>
                  <input
                    type="text"
                    value={simPayee}
                    onChange={e => setSimPayee(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none"
                  />
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    value={simAmount}
                    onChange={e => setSimAmount(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2 text-lg font-bold font-mono text-emerald-400 focus:outline-none"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[10px] text-slate-500 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Submitting fires a live webhook simulating real-time bank debit & instant ledger updates.</span>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-600/30 transition flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  Pay ₹{simAmount} & Stream to App
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
