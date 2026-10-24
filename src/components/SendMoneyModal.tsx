'use client';

import React, { useState } from 'react';
import { X, Send, User, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SendMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendSuccess: (amount: number, recipient: string) => void;
}

const QUICK_CONTACTS = [
  { name: 'Priya Sharma', upi: 'priya@okhdfc', avatarBg: 'bg-rose-100 text-rose-600' },
  { name: 'Rohan Verma', upi: 'rohan.v@icici', avatarBg: 'bg-indigo-100 text-indigo-600' },
  { name: 'Harsha K', upi: 'harsha@upi', avatarBg: 'bg-amber-100 text-amber-600' },
  { name: 'Mom', upi: 'mom@sbi', avatarBg: 'bg-emerald-100 text-emerald-600' },
];

export default function SendMoneyModal({
  isOpen,
  onClose,
  onSendSuccess,
}: SendMoneyModalProps) {
  const [selectedContact, setSelectedContact] = useState(QUICK_CONTACTS[0]);
  const [customUpi, setCustomUpi] = useState('');
  const [amount, setAmount] = useState('500');
  const [note, setNote] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSend = () => {
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) return;

    setIsSuccess(true);
    try {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {}

    const recipientName = customUpi.trim() ? customUpi.trim() : selectedContact.name;

    setTimeout(() => {
      onSendSuccess(num, recipientName);
      setIsSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-sm rounded-[32px] bg-white text-slate-900 p-6 shadow-2xl overflow-hidden border border-slate-100">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="inline-flex p-3 rounded-2xl bg-orange-50 text-[#F97316] mb-2">
            <Send className="w-6 h-6 stroke-[2.2]" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Send Money via UPI</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Instant zero-fee transfer to any UPI ID or phone
          </p>
        </div>

        {isSuccess ? (
          <div className="py-10 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-xl font-bold text-slate-900">Transfer Sent!</h4>
            <p className="text-xs text-slate-500">
              ₹{amount} sent to {customUpi || selectedContact.name}
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            {/* Quick Contacts */}
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Recent Contacts
              </span>
              <div className="grid grid-cols-4 gap-2">
                {QUICK_CONTACTS.map((c) => {
                  const isSelected = selectedContact.name === c.name && !customUpi;
                  return (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => {
                        setSelectedContact(c);
                        setCustomUpi('');
                      }}
                      className={`flex flex-col items-center p-2 rounded-xl transition-all ${
                        isSelected
                          ? 'bg-orange-50 ring-2 ring-orange-500'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${c.avatarBg}`}
                      >
                        {c.name[0]}
                      </div>
                      <span className="text-[11px] font-semibold text-slate-700 mt-1 truncate max-w-[60px]">
                        {c.name.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom UPI ID */}
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                Or enter UPI ID / Mobile number
              </label>
              <input
                type="text"
                placeholder="e.g. rahul@oksbi"
                value={customUpi}
                onChange={(e) => setCustomUpi(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:border-orange-500 font-mono"
              />
            </div>

            {/* Amount Input */}
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                Transfer Amount (₹)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-slate-400">
                  ₹
                </span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-2xl font-bold text-slate-900 focus:outline-none focus:border-orange-500 font-sans"
                />
              </div>

              {/* Fast Pills */}
              <div className="flex gap-2 mt-2">
                {['200', '500', '1000', '2000'].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmount(val)}
                    className="flex-1 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-600 transition"
                  >
                    +₹{val}
                  </button>
                ))}
              </div>
            </div>

            {/* Note */}
            <div>
              <input
                type="text"
                placeholder="Add a remark (e.g. Dinner split, Rent)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Submit */}
            <button
              type="button"
              onClick={handleSend}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-sm font-bold text-white shadow-lg shadow-orange-500/25 transition cursor-pointer active:scale-98"
            >
              Send ₹{amount} Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
