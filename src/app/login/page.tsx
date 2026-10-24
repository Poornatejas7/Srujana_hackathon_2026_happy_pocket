'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import AuthScreen from '@/components/AuthScreen';

export default function LoginPage() {
  const router = useRouter();

  const handleLoginSuccess = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('hp_logged_in', 'true');
    }
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[#EEF2F6] text-slate-900 flex flex-col items-center justify-center p-2 sm:p-4 font-sans selection:bg-orange-500 selection:text-white">
      <div className="w-full max-w-[380px] sm:max-w-[390px] mx-auto transition-all duration-300">
        <div className="w-full bg-[#EEF2F6] md:rounded-[48px] md:shadow-[0_20px_50px_rgba(15,23,42,0.12)] md:border-[10px] md:border-white overflow-hidden">
          <AuthScreen onLoginSuccess={handleLoginSuccess} />
        </div>
      </div>
    </div>
  );
}
