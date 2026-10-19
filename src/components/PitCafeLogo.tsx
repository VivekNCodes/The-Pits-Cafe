'use client';

import React from 'react';
import Link from 'next/link';

interface PitCafeLogoProps {
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  className?: string;
  showSubtitle?: boolean;
}

export function PitCafeLogo({
  size = 'md',
  href = '/',
  className = '',
  showSubtitle = true,
}: PitCafeLogoProps) {
  const badgeSizes = {
    sm: 'w-8 h-8 text-[10px]',
    md: 'w-10 h-10 sm:w-11 sm:h-11 text-xs',
    lg: 'w-12 h-12 text-sm',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg sm:text-xl',
    lg: 'text-2xl',
  };

  const content = (
    <div className={`flex items-center gap-3 group select-none ${className}`}>
      {/* Circular Red Biker Cutlery Seal */}
      <div
        className={`${badgeSizes[size]} rounded-full bg-gradient-to-br from-red-600 to-rose-700 p-[2px] shadow-lg shadow-red-600/30 flex-shrink-0 transition-transform group-hover:scale-105`}
      >
        <div className="w-full h-full rounded-full bg-zinc-950 border border-white/20 flex items-center justify-center relative overflow-hidden">
          {/* Subtle dotted outer ring */}
          <div className="absolute inset-0 rounded-full border border-dashed border-red-500/40 m-[2px]" />
          
          {/* Crossed Fork and Knife SVG */}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5 text-white drop-shadow relative z-10"
          >
            {/* Knife */}
            <line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" />
            <path d="M19 4c-1.5 0-3 1-3.5 2.5l-2.5 2.5 3.5 3.5 2.5-2.5C20.5 9.5 21 8 21 6.5A2.5 2.5 0 0 0 18.5 4z" fill="currentColor" stroke="none" opacity="0.9" />
            {/* Fork */}
            <line x1="20" y1="4" x2="4" y2="20" stroke="currentColor" />
            <path d="M5.5 4v4a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V4" stroke="currentColor" />
            <line x1="7.5" y1="4" x2="7.5" y2="8" stroke="currentColor" />
          </svg>
        </div>
      </div>

      {/* Brand Typography */}
      <div>
        <div className="flex items-center gap-2">
          <span
            className={`font-display font-black tracking-wider text-white group-hover:text-red-500 transition-colors uppercase ${textSizes[size]}`}
            style={{ letterSpacing: '0.06em' }}
          >
            THE PIT CAFE
          </span>
        </div>
        {showSubtitle && (
          <p className="text-[10px] sm:text-[11px] text-zinc-400 font-medium tracking-wider uppercase">
            Biker Courtyard · Rohini
          </p>
        )}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
