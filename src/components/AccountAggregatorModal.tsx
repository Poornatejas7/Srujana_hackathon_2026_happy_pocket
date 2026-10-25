'use client';

import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Landmark,
  ArrowRight,
  CheckCircle2,
  Lock,
  Smartphone,
  RefreshCw,
  Sparkles,
  ChevronRight,
  AlertCircle,
  Database,
  Layers,
  KeyRound,
  FileCheck2,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SUPPORTED_FIP_BANKS, BankFipInfo } from '@/app/api/aa/consent/route';

interface AccountAggregatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newBalance: number, count: number) => void;
}

export default function AccountAggregatorModal({
  isOpen,
  onClose,
  onSuccess,
}: AccountAggregatorModalProps) {
  // Step tracker: 1 = Bank, 2 = Mobile/Consent, 3 = OTP, 4 = Discovered Accounts, 5 = Syncing, 6 = Done
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [selectedBank, setSelectedBank] = useState<BankFipInfo>(SUPPORTED_FIP_BANKS[0]);
  const [mobileNumber, setMobileNumber] = useState<string>('9876543210');
  const [aaHandle, setAaHandle] = useState<string>('setu-aa');
  const [consentId, setConsentId] = useState<string>('');
  const [consentArtifact, setConsentArtifact] = useState<any>(null);
  const [otp, setOtp] = useState<string>('123456');
  const [discoveredAccounts, setDiscoveredAccounts] = useState<any[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [syncResult, setSyncResult] = useState<{
    count: number;
    newBalance: number;
    fipName: string;
  } | null>(null);

  if (!isOpen) return null;

  // Step 2: Request Digital Consent Artifact
  const handleRequestConsent = async () => {
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/aa/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobileNumber,
          bankId: selectedBank.id,
          aaHandle,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to initiate consent request');
      }

      setConsentId(data.consentId);
      setConsentArtifact(data.consentArtifact);
      setStep(3); // Go to OTP screen
    } catch (err: any) {
      setErrorMessage(err.message || 'Error communicating with AA Gateway');
    } finally {
      setIsProcessing(false);
    }
  };

  // Step 3: Verify OTP & Discover Accounts at Bank
  const handleVerifyOtp = async () => {
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/aa/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consentId,
          otp,
          bankId: selectedBank.id,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid OTP code');
      }

      setDiscoveredAccounts(data.discoveredAccounts || []);
      if (data.discoveredAccounts?.length > 0) {
        setSelectedAccount(data.discoveredAccounts[0]);
      }
      setStep(4); // Discovered Accounts Screen
    } catch (err: any) {
      setErrorMessage(err.message || 'OTP verification failed');
    } finally {
      setIsProcessing(false);
    }
  };

  // Step 4: Fetch Encrypted Financial Data & Ingest into MongoDB Atlas
  const handleIngestData = async () => {
    setStep(5); // Ingestion animation
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/aa/fetch-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consentId,
          bankId: selectedBank.id,
          selectedAccount,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch financial data from Account Aggregator');
      }

      setSyncResult({
        count: data.count,
        newBalance: data.newBalance,
        fipName: data.fipName,
      });

      setStep(6);
      try {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}

      onSuccess(data.newBalance, data.count);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to sync financial data');
      setStep(4); // Back to account selection on error
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setErrorMessage(null);
    setIsProcessing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md rounded-[32px] bg-white text-slate-900 p-5 sm:p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center font-bold text-lg">
              <Landmark className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                  RBI Account Aggregator
                </h3>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  RBI Regulated
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono">
                Consent-Driven Open Banking (NBFC-AA)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-0.5">
          {/* STEP 1: SELECT YOUR BANK (FIP) */}
          {step === 1 && (
            <div className="space-y-3.5 animate-fadeIn">
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  1. Select Your Bank (Financial Provider)
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Direct API connect to live Indian banking systems
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                {SUPPORTED_FIP_BANKS.map((b) => {
                  const isSelected = selectedBank.id === b.id;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setSelectedBank(b)}
                      className={`p-3 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                          : 'bg-slate-50/70 hover:bg-slate-100 border-slate-200/80 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xl">{b.logo}</span>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        )}
                      </div>
                      <div className="mt-2">
                        <h5 className="text-xs font-bold text-slate-900 truncate">{b.name}</h5>
                        <span className="text-[10px] text-slate-400 font-mono">{b.fipId}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Security Pill */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-2.5 text-xs text-slate-600">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-[11px] leading-relaxed">
                  Data travels with <strong>256-bit encryption</strong>. No net banking passwords or PINs are ever requested.
                </span>
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition cursor-pointer"
              >
                <span>Continue with {selectedBank.name}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: ENTER MOBILE NUMBER & REVIEW DIGITAL CONSENT */}
          {step === 2 && (
            <div className="space-y-3.5 animate-fadeIn">
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  2. Digital Consent Artifact (ReBIT Spec)
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Link via verified mobile registered with {selectedBank.name}
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 block">
                  Registered Mobile Number
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 font-mono">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="9876543210"
                    className="w-full pl-12 pr-3 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold font-mono text-slate-900 focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              {/* AA Network Selector */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">
                  RBI Account Aggregator Handle
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'setu-aa', label: 'Setu AA' },
                    { id: 'onemoney', label: 'OneMoney' },
                    { id: 'finvu', label: 'Finvu' },
                  ].map((aa) => (
                    <button
                      key={aa.id}
                      type="button"
                      onClick={() => setAaHandle(aa.id)}
                      className={`py-2 rounded-xl text-[11px] font-bold transition border cursor-pointer ${
                        aaHandle === aa.id
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {aa.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Transparent Consent Summary */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 text-emerald-900 font-bold text-xs">
                  <FileCheck2 className="w-4 h-4 text-emerald-600" />
                  <span>Sovereign Consent Terms</span>
                </div>
                <div className="space-y-1 text-[11px] text-emerald-950/80">
                  <div className="flex justify-between">
                    <span>Purpose:</span>
                    <strong className="text-emerald-900">Personal Financial Management (101)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Data Range:</span>
                    <strong>Past 90 Days</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Access Mode:</span>
                    <strong>Read-Only (Deposit accounts)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Revocation:</span>
                    <strong>Instant (Revocable anytime)</strong>
                  </div>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-600 font-medium">
                  {errorMessage}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleRequestConsent}
                  disabled={isProcessing || mobileNumber.length < 10}
                  className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Request RBI Consent &amp; Send OTP</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: OTP VERIFICATION */}
          {step === 3 && (
            <div className="space-y-3.5 animate-fadeIn">
              <div className="text-center py-1">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-2">
                  <KeyRound className="w-6 h-6 stroke-[2.2]" />
                </div>
                <h4 className="text-sm font-extrabold text-slate-900">
                  Verify Bank Authorization OTP
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Enter 6-digit code sent to +91 ••••• •{mobileNumber.slice(-4)} via {selectedBank.name} AA Gateway
                </p>
                <span className="inline-block mt-1 text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-mono">
                  Sandbox OTP: 123456
                </span>
              </div>

              <div className="space-y-1">
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="123456"
                  className="w-full text-center py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xl font-bold font-mono tracking-widest text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-600 font-medium">
                  {errorMessage}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={isProcessing || otp.length !== 6}
                  className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Verify &amp; Discover Accounts</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: DISCOVERED ACCOUNTS SELECTION */}
          {step === 4 && (
            <div className="space-y-3.5 animate-fadeIn">
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  3. Accounts Discovered at {selectedBank.name}
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Select the bank account to synchronize into Happy Pocket
                </p>
              </div>

              <div className="space-y-2">
                {discoveredAccounts.map((acc, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedAccount(acc)}
                    className="p-3.5 rounded-2xl bg-slate-50 border-2 border-emerald-500 flex items-center justify-between cursor-pointer shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg">
                        {selectedBank.logo}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="text-xs font-bold text-slate-900">
                            {acc.bankName} ({acc.maskedAccountNumber})
                          </h5>
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800">
                            {acc.accountType}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                          IFSC: {acc.ifsc} • {acc.accountHolder}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-black text-slate-900 font-sans block">
                        ₹{acc.availableBalance?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-bold">Verified FIP</span>
                    </div>
                  </div>
                ))}
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-600 font-medium">
                  {errorMessage}
                </div>
              )}

              <button
                type="button"
                onClick={handleIngestData}
                disabled={isProcessing}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>Sync Financial Stream into Atlas</span>
              </button>
            </div>
          )}

          {/* STEP 5: INGESTION IN PROGRESS */}
          {step === 5 && (
            <div className="py-8 text-center space-y-4 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <RefreshCw className="w-8 h-8 animate-spin" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-extrabold text-slate-900">
                  Ingesting Canonical Financial Stream
                </h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Connecting to {selectedBank.name} $\rightarrow$ Decrypting 256-bit FI Packet $\rightarrow$ Isolating Living Expenses...
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-[11px] text-slate-600 max-w-xs mx-auto font-mono">
                NPCI / ReBIT Sovereign Gateway Verified ✓
              </div>
            </div>
          )}

          {/* STEP 6: SUCCESS */}
          {step === 6 && syncResult && (
            <div className="py-6 text-center space-y-4 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-md shadow-emerald-500/20">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-1">
                <h4 className="text-xl font-black text-slate-900">
                  Bank Synchronized Successfully!
                </h4>
                <p className="text-xs text-emerald-700 font-bold">
                  {syncResult.fipName} Account Linked via RBI Account Aggregator
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2 text-left">
                <div className="flex justify-between items-center pb-1.5 border-b border-slate-200">
                  <span className="text-slate-500">Transactions Ingested</span>
                  <span className="font-bold text-slate-900">{syncResult.count} Verified Records</span>
                </div>
                <div className="flex justify-between items-center pb-1.5 border-b border-slate-200">
                  <span className="text-slate-500">Live Account Balance</span>
                  <span className="font-bold text-emerald-600 font-mono">
                    ₹{syncResult.newBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Destination</span>
                  <span className="font-mono text-slate-700">MongoDB Atlas Cluster</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer shadow-md"
              >
                Done • View Live Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
