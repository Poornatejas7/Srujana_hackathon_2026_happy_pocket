'use client';

import React from 'react';

interface HappyPocketLogoProps {
  className?: string;
  size?: number;
}

export default function HappyPocketLogo({ className = '', size = 52 }: HappyPocketLogoProps) {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible select-none"
      >
        {/* Three Yellow Radiating Spark Rays above mascot */}
        <line x1="62" y1="12" x2="62" y2="20" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="72" y1="15" x2="68" y2="22" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="52" y1="15" x2="56" y2="22" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />

        {/* Mascot Body tilted ~ -8 degrees */}
        <g transform="rotate(-8 50 55)">
          {/* Back pocket top flap */}
          <rect
            x="22"
            y="26"
            width="54"
            height="46"
            rx="12"
            fill="#E2E8F0"
            stroke="#1E293B"
            strokeWidth="2.8"
          />

          {/* Yellow/Orange credit card sticking out */}
          <rect
            x="30"
            y="20"
            width="38"
            height="16"
            rx="4"
            fill="#F97316"
            stroke="#1E293B"
            strokeWidth="2.5"
          />

          {/* Main Wallet Front Body */}
          <rect
            x="18"
            y="28"
            width="58"
            height="46"
            rx="14"
            fill="#FFFFFF"
            stroke="#1E293B"
            strokeWidth="3"
          />

          {/* Inner flap fold curve */}
          <path
            d="M 20 40 Q 44 46 74 38"
            stroke="#E2E8F0"
            strokeWidth="2"
            fill="none"
          />

          {/* Orange Right Side Clasp & Golden Coin */}
          <g transform="translate(64, 42)">
            <path
              d="M 0 0 L 12 0 C 16 0 18 3 18 7 C 18 11 16 14 12 14 L 0 14 Z"
              fill="#F97316"
              stroke="#1E293B"
              strokeWidth="2.4"
            />
            {/* Golden Circle Coin Button */}
            <circle cx="10" cy="7" r="5" fill="#FBBF24" stroke="#1E293B" strokeWidth="1.8" />
            <circle cx="10" cy="7" r="2.5" fill="#F59E0B" />
          </g>

          {/* Cute Face */}
          {/* Left Eye */}
          <circle cx="34" cy="45" r="3.2" fill="#1E293B" />
          <circle cx="35" cy="44" r="1" fill="#FFFFFF" />

          {/* Right Eye */}
          <circle cx="52" cy="43" r="3.2" fill="#1E293B" />
          <circle cx="53" cy="42" r="1" fill="#FFFFFF" />

          {/* Cute Eyelid / Brow Arcs */}
          <path d="M 31 39 Q 34 37 37 39" stroke="#1E293B" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          <path d="M 49 37 Q 52 35 55 37" stroke="#1E293B" strokeWidth="1.8" strokeLinecap="round" fill="none" />

          {/* Rosy Blush Cheeks */}
          <ellipse cx="29" cy="49" rx="3.5" ry="2" fill="#FDA4AF" />
          <ellipse cx="57" cy="47" rx="3.5" ry="2" fill="#FDA4AF" />

          {/* Joyful Smiling Open Mouth */}
          <path
            d="M 40 48 Q 43 54 47 48"
            stroke="#1E293B"
            strokeWidth="2.2"
            strokeLinecap="round"
            fill="#1E293B"
          />

          {/* Stylized UPI Emblem on front belly */}
          <g transform="translate(38, 58)">
            <path
              d="M 0 4 Q 6 8 12 4"
              stroke="#10B981"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
            <text
              x="6"
              y="1"
              textAnchor="middle"
              fontSize="6.5"
              fontWeight="900"
              fontFamily="sans-serif"
              fill="#1E293B"
            >
              UPI
            </text>
          </g>
        </g>
      </svg>
    </div>
  );
}
