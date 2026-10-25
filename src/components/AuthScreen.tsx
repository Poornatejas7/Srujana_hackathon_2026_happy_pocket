'use client';

import React, { useState } from 'react';
import { 
  Landmark, 
  Lock, 
  Eye, 
  EyeOff, 
  Smartphone, 
  Wifi, 
  CheckCircle2 
} from 'lucide-react';
import HappyPocketLogo from '@/components/HappyPocketLogo';

export type UserRole = 'personal' | 'medical' | 'college';

interface AuthScreenProps {
  onLoginSuccess: (accountNumber?: string, role?: UserRole) => void;
  initialMode?: 'login' | 'register';
  initialRole?: UserRole;
}

export default function AuthScreen({
  onLoginSuccess,
  initialMode = 'login',
  initialRole = 'personal',
}: AuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);
  
  // Form fields per role
  const [accountNumber, setAccountNumber] = useState('5010 0492 8174');
  const [password, setPassword] = useState('1234');
  const [mobileNumber, setMobileNumber] = useState('98765 43210');
  const [confirmPassword, setConfirmPassword] = useState('1234');
  
  // Visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    if (role === 'personal') {
      setAccountNumber('5010 0492 8174');
      setMobileNumber('98765 43210');
      setPassword('1234');
    } else if (role === 'medical') {
      setAccountNumber('5010 0492 8192');
      setMobileNumber('98765 09283');
      setPassword('1234');
    } else if (role === 'college') {
      setAccountNumber('3019 4827 1928');
      setMobileNumber('98765 11928');
      setPassword('1234');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate brief smooth authentication
    setTimeout(() => {
      setIsSubmitting(false);
      onLoginSuccess(accountNumber || '5010 0492 8174', selectedRole);
    }, 400);
  };

  const handleOtpLogin = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onLoginSuccess('Mobile OTP: ' + mobileNumber, selectedRole);
    }, 400);
  };

  return (
    <div className="relative w-full min-h-[660px] bg-[#EEF2F6] flex flex-col justify-between overflow-hidden select-none">
      
      {/* 1. Mobile Status Bar (9:41, Signal, Battery) */}
      <div className="w-full pt-3 px-6 flex items-center justify-between text-slate-800 select-none z-10">
        <span className="font-bold text-sm tracking-tight font-sans">9:41</span>
        
        {/* Status Bar Icons */}
        <div className="flex items-center gap-1.5 text-slate-800">
          <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor">
            <rect x="0" y="7" width="2.8" height="4" rx="0.8" />
            <rect x="4.5" y="4.5" width="2.8" height="6.5" rx="0.8" />
            <rect x="9" y="2" width="2.8" height="9" rx="0.8" />
            <rect x="13.5" y="0" width="2.8" height="11" rx="0.8" />
          </svg>
          <Wifi className="w-3.5 h-3.5 stroke-[2.4]" />
          <div className="w-5 h-2.5 rounded-[4px] border-[1.5px] border-slate-800 p-0.5 flex items-center">
            <div className="w-full h-full bg-slate-800 rounded-[1.5px]" />
          </div>
        </div>
      </div>

      {/* 2. Main Content Form */}
      <div className="flex-1 px-6 pt-6 pb-12 flex flex-col items-center justify-center z-10">
        
        {/* Mascot Logo */}
        <div className="mb-3 hover:scale-105 transition-transform duration-300">
          <HappyPocketLogo size={78} />
        </div>

        {/* ==================================================== */}
        {/* MODE 1: LOGIN SCREEN */}
        {/* ==================================================== */}
        {mode === 'login' ? (
          <div className="w-full max-w-sm space-y-4 animate-fadeIn">
            {/* Account Role Selector (Personal, Medical Shop, Education College) */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-200/90 rounded-2xl mb-2 shadow-inner">
              <button
                type="button"
                onClick={() => handleRoleChange('personal')}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                  selectedRole === 'personal'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>👤</span>
                <span className="truncate">Personal</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('medical')}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                  selectedRole === 'medical'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>💊</span>
                <span className="truncate">Medical</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('college')}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                  selectedRole === 'college'
                    ? 'bg-white text-indigo-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>🎓</span>
                <span className="truncate">College</span>
              </button>
            </div>

            {/* Dynamic Role Titles */}
            <div className="text-center mb-4">
              <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-1.5">
                <span>
                  {selectedRole === 'personal'
                    ? 'Kotresh C'
                    : selectedRole === 'medical'
                    ? 'City Care Medicals'
                    : "St. Xavier College"}
                </span>
                <span className="text-lg">
                  {selectedRole === 'personal' ? '👋' : selectedRole === 'medical' ? '💊' : '🎓'}
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {selectedRole === 'personal'
                  ? 'Personal Banking & UPI Ledger'
                  : selectedRole === 'medical'
                  ? 'Medical Shop Merchant QR & Live Inflow'
                  : 'College Merchant Portal & Fee QR'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Account Number Input */}
              <div className="bg-white rounded-2xl border border-slate-200/90 px-4 py-3.5 flex items-center gap-3 shadow-2xs focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-200/50 transition">
                <Landmark className="w-5 h-5 text-slate-700 shrink-0 stroke-[2.2]" />
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="Account Number"
                  className="w-full bg-transparent text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none"
                  required
                />
              </div>

              {/* Password Input with Show/Hide Toggle */}
              <div className="bg-white rounded-2xl border border-slate-200/90 px-4 py-3.5 flex items-center gap-3 shadow-2xs focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-200/50 transition">
                <Lock className="w-5 h-5 text-slate-700 shrink-0 stroke-[2.2]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password / UPI PIN"
                  className="w-full bg-transparent text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-500 hover:text-slate-700 p-1 focus:outline-none cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 stroke-[2]" />
                  ) : (
                    <Eye className="w-4 h-4 stroke-[2]" />
                  )}
                </button>
              </div>

              {/* Primary Login Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3.5 rounded-2xl text-white font-extrabold text-sm sm:text-base shadow-lg transition-all cursor-pointer flex items-center justify-center active:scale-[0.98] ${
                  selectedRole === 'personal'
                    ? 'bg-[#F97316] hover:bg-[#EA580C] shadow-orange-500/25'
                    : selectedRole === 'medical'
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25'
                    : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/25'
                }`}
              >
                {isSubmitting 
                  ? 'Authenticating...' 
                  : selectedRole === 'personal'
                  ? 'Login to Personal Banking'
                  : selectedRole === 'medical'
                  ? 'Login as Medical Shop'
                  : 'Login as Education College'}
              </button>
            </form>

            {/* Forgot Password Link */}
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => alert('Password reset link sent to registered mobile number (Demo Mode)')}
                className="text-xs sm:text-[13px] font-bold text-[#F97316] hover:underline cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>

            {/* or divider */}
            <div className="flex items-center gap-3 pt-1">
              <div className="h-px bg-slate-200 flex-1" />
              <span className="text-xs text-slate-400 font-medium">or</span>
              <div className="h-px bg-slate-200 flex-1" />
            </div>

            {/* Login with Mobile Number (OTP) */}
            <button
              type="button"
              onClick={handleOtpLogin}
              className="w-full py-3 px-4 rounded-2xl bg-white/90 hover:bg-slate-100/80 active:scale-[0.98] text-slate-700 font-bold text-xs sm:text-[13px] border border-slate-200/80 shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Smartphone className="w-4 h-4 text-slate-600 stroke-[2.2]" />
              <span>Login with Mobile Number (OTP)</span>
            </button>

            {/* Switch to Register footer */}
            <div className="text-center pt-2 text-xs text-slate-600 font-medium">
              New to Happy Pocket?{' '}
              <button
                type="button"
                onClick={() => setMode('register')}
                className="text-[#F97316] font-extrabold hover:underline cursor-pointer"
              >
                Register
              </button>
            </div>
          </div>
        ) : (
          /* ==================================================== */
          /* MODE 2: CREATE ACCOUNT (REGISTER SCREEN) */
          /* ==================================================== */
          <div className="w-full max-w-sm space-y-3.5 animate-fadeIn">
            {/* Titles */}
            <div className="text-center mb-4">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Create Account
              </h2>
              <p className="text-xs sm:text-[13px] text-slate-500 font-medium mt-1">
                Open your Happy Pocket account in minutes
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Account Number */}
              <div className="bg-white rounded-2xl border border-slate-200/90 px-4 py-3 flex items-center gap-3 shadow-2xs focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-200/50 transition">
                <Landmark className="w-5 h-5 text-slate-700 shrink-0 stroke-[2.2]" />
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="Account Number"
                  className="w-full bg-transparent text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none"
                  required
                />
              </div>

              {/* Mobile Number */}
              <div className="bg-white rounded-2xl border border-slate-200/90 px-4 py-3 flex items-center gap-3 shadow-2xs focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-200/50 transition">
                <Smartphone className="w-5 h-5 text-slate-700 shrink-0 stroke-[2.2]" />
                <input
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="Mobile Number"
                  className="w-full bg-transparent text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none"
                  required
                />
              </div>

              {/* Create Password */}
              <div className="bg-white rounded-2xl border border-slate-200/90 px-4 py-3 flex items-center gap-3 shadow-2xs focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-200/50 transition">
                <Lock className="w-5 h-5 text-slate-700 shrink-0 stroke-[2.2]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create Password"
                  className="w-full bg-transparent text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-500 hover:text-slate-700 p-1 focus:outline-none cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 stroke-[2]" />
                  ) : (
                    <Eye className="w-4 h-4 stroke-[2]" />
                  )}
                </button>
              </div>

              {/* Confirm Password */}
              <div className="bg-white rounded-2xl border border-slate-200/90 px-4 py-3 flex items-center gap-3 shadow-2xs focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-200/50 transition">
                <Lock className="w-5 h-5 text-slate-700 shrink-0 stroke-[2.2]" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm Password"
                  className="w-full bg-transparent text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-slate-500 hover:text-slate-700 p-1 focus:outline-none cursor-pointer"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4 stroke-[2]" />
                  ) : (
                    <Eye className="w-4 h-4 stroke-[2]" />
                  )}
                </button>
              </div>

              {/* Register Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-2xl bg-[#F97316] hover:bg-[#EA580C] active:scale-[0.98] text-white font-extrabold text-sm sm:text-base shadow-lg shadow-orange-500/25 transition-all cursor-pointer flex items-center justify-center mt-2"
              >
                {isSubmitting ? 'Creating account...' : 'Register'}
              </button>
            </form>

            {/* Switch to Login footer */}
            <div className="text-center pt-3 text-xs text-slate-600 font-medium">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-[#F97316] font-extrabold hover:underline cursor-pointer"
              >
                Login
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. Decorative Warm Golden/Orange Wave Graphic at the Bottom */}
      <div className="w-full pointer-events-none leading-none relative">
        <svg
          viewBox="0 0 390 85"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto block"
          preserveAspectRatio="none"
        >
          {/* Back Soft Amber Wave */}
          <path
            d="M 50 85 C 160 80 230 20 390 48 L 390 85 Z"
            fill="#FDBA74"
            fillOpacity="0.55"
          />
          {/* Front Golden Orange Wave */}
          <path
            d="M 120 85 C 220 70 280 25 390 35 L 390 85 Z"
            fill="#F97316"
            fillOpacity="0.45"
          />
        </svg>
      </div>

    </div>
  );
}
