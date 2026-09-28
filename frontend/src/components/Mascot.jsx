import React from 'react';

/**
 * QuizPulse Gamified Mascot inspired by modern learning apps (Duolingo/Elingo style)
 * Cute friendly purple drop character with expressive animated eyes and highlights
 */
export default function Mascot({ mood = 'happy', size = 80, className = '' }) {
  return (
    <div
      className={`inline-block select-none relative ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full filter drop-shadow-[0_8px_16px_rgba(108,92,231,0.3)] transition-transform hover:scale-105"
      >
        <defs>
          <linearGradient id="mascotGrad" x1="20" y1="10" x2="80" y2="95" gradientUnits="userSpaceOnUse">
            <stop stopColor="#8F7EFF" />
            <stop offset="0.5" stopColor="#6C5CE7" />
            <stop offset="1" stopColor="#5544DB" />
          </linearGradient>
          <linearGradient id="cheekGrad" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#FFAAA6" />
            <stop offset="1" stopColor="#FF7675" />
          </linearGradient>
          <linearGradient id="crownGrad" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#FFE066" />
            <stop offset="1" stopColor="#FDCB6E" />
          </linearGradient>
        </defs>

        {/* Body (Cute Plump Droplet) */}
        <path
          d="M50 12 C65 28 84 50 84 68 C84 84 68.8 94 50 94 C31.2 94 16 84 16 68 C16 50 35 28 50 12 Z"
          fill="url(#mascotGrad)"
        />

        {/* 3D Gloss / Light Reflection */}
        <path
          d="M48 20 C40 32 26 48 24 64 C23 72 26 78 30 82 C24 76 22 68 23 58 C25 46 36 32 46 22 C47 21 48 20 48 20 Z"
          fill="white"
          opacity="0.35"
        />

        {/* Cheeks (Blushing) */}
        <ellipse cx="28" cy="67" rx="5" ry="3" fill="url(#cheekGrad)" opacity="0.8" />
        <ellipse cx="72" cy="67" rx="5" ry="3" fill="url(#cheekGrad)" opacity="0.8" />

        {/* Mood-Specific Eyes & Expression */}
        {mood === 'celebrating' ? (
          <>
            {/* Happy Curved Wink Eyes (^_^ style) */}
            <path d="M30 58 Q36 50 42 58" stroke="white" strokeWidth="4" strokeLinecap="round" fill="none" />
            <path d="M58 58 Q64 50 70 58" stroke="white" strokeWidth="4" strokeLinecap="round" fill="none" />
            {/* Big Open Smile */}
            <path d="M42 66 Q50 78 58 66 Z" fill="#2D1152" />
            <path d="M46 71 Q50 76 54 71 Z" fill="#FF7675" />
            {/* Cute Crown on Top */}
            <path d="M38 16 L44 8 L50 14 L56 8 L62 16 Z" fill="url(#crownGrad)" />
          </>
        ) : mood === 'thinking' ? (
          <>
            {/* One Eyebrow Raised, Curious Eyes */}
            <circle cx="36" cy="56" r="6" fill="#1E0E38" />
            <circle cx="34" cy="54" r="2.5" fill="white" />
            <circle cx="64" cy="55" r="5" fill="#1E0E38" />
            <circle cx="62.5" cy="53.5" r="2" fill="white" />
            {/* Pout / Curved smile */}
            <path d="M46 68 Q52 66 56 70" stroke="#1E0E38" strokeWidth="3" strokeLinecap="round" fill="none" />
          </>
        ) : (
          <>
            {/* Big Anime Eyes */}
            <circle cx="36" cy="56" r="7" fill="#1E0E38" />
            <circle cx="34" cy="53" r="3" fill="white" />
            <circle cx="38" cy="59" r="1.2" fill="white" />

            <circle cx="64" cy="56" r="7" fill="#1E0E38" />
            <circle cx="62" cy="53" r="3" fill="white" />
            <circle cx="66" cy="59" r="1.2" fill="white" />

            {/* Cheerful Smile */}
            <path d="M43 65 Q50 73 57 65" stroke="#1E0E38" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          </>
        )}

        {/* Tiny playful sparkle */}
        <path d="M78 28 L80 24 L82 28 L86 30 L82 32 L80 36 L78 32 L74 30 Z" fill="#FDCB6E" />
      </svg>
    </div>
  );
}
