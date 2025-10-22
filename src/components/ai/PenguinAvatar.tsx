"use client";

import React from 'react';

export default function PenguinAvatar({ size = 96, speaking = false }: { size?: number; speaking?: boolean }) {
  const s = size;
  return (
    <div
      className={speaking ? 'animate-gary-bob' : ''}
      style={{ width: s, height: s }}
      aria-label="Gary the Penguin avatar"
    >
      {/* Simple inline SVG penguin */}
      <svg
        viewBox="0 0 128 128"
        width={s}
        height={s}
        role="img"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="b" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#dfe7fb" stopOpacity="0.4" />
          </radialGradient>
        </defs>
        {/* Body */}
        <ellipse cx="64" cy="76" rx="40" ry="46" fill="#0b1b54" />
        {/* Belly */}
        <ellipse cx="64" cy="84" rx="30" ry="34" fill="url(#b)" />
        {/* Head */}
        <circle cx="64" cy="44" r="28" fill="#0b1b54" />
        <circle cx="54" cy="44" r="14" fill="#ffffff" />
        <circle cx="74" cy="44" r="14" fill="#ffffff" />
        <circle cx="54" cy="46" r="4" fill="#0b1b54" />
        <circle cx="74" cy="46" r="4" fill="#0b1b54" />
        {/* Beak */}
        <path d="M64 54 l14 6 -14 6 -14-6z" fill="#f59e0b" />
        {/* Feet */}
        <ellipse cx="50" cy="118" rx="10" ry="6" fill="#f59e0b" />
        <ellipse cx="78" cy="118" rx="10" ry="6" fill="#f59e0b" />
      </svg>
      <style jsx>{`
        @keyframes gary-bob { 0% { transform: translateY(0); } 50% { transform: translateY(-3px); } 100% { transform: translateY(0); } }
        .animate-gary-bob { animation: gary-bob 1.2s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

