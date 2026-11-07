import React from "react";

interface NusaMascotProps {
  className?: string;
  size?: number;
  animated?: boolean;
}

export default function NusaMascot({ className = "", size = 48, animated = true }: NusaMascotProps) {
  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-full drop-shadow-md ${animated ? "animate-pulse-subtle" : ""}`}
      >
        <defs>
          {/* Body gradient */}
          <linearGradient id="nusaBody" x1="20" y1="20" x2="80" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="60%" stopColor="#F1F5F9" />
            <stop offset="100%" stopColor="#CBD5E1" />
          </linearGradient>

          {/* Screen face gradient */}
          <linearGradient id="nusaScreen" x1="30" y1="40" x2="70" y2="75" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>

          {/* Antenna bolt gradient */}
          <linearGradient id="nusaAntenna" x1="50" y1="5" x2="55" y2="28" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#4ADE80" />
            <stop offset="100%" stopColor="#16A34A" />
          </linearGradient>

          {/* Glow filter for lightning */}
          <filter id="nusaGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* --- Antenna: Lightning Bolt --- */}
        <g filter="url(#nusaGlow)">
          <path
            d="M52 4 L44 16 L51 16 L46 27 L58 14 L51 14 Z"
            fill="url(#nusaAntenna)"
            stroke="#15803D"
            strokeWidth="0.8"
            strokeLinejoin="round"
          />
        </g>
        {/* Antenna Base Mount */}
        <ellipse cx="50" cy="27" rx="5" ry="2.5" fill="#94A3B8" />

        {/* --- Head / Body: Smooth Capsule Shape --- */}
        <path
          d="M 50 24
             C 74 24, 82 40, 82 62
             C 82 78, 72 88, 50 88
             C 28 88, 18 78, 18 62
             C 18 40, 26 24, 50 24 Z"
          fill="url(#nusaBody)"
          stroke="#94A3B8"
          strokeWidth="1.5"
        />

        {/* Head glossy highlight reflection */}
        <path
          d="M 32 32
             C 42 27, 58 27, 68 32
             C 60 30, 40 30, 32 32 Z"
          fill="#FFFFFF"
          opacity="0.8"
        />

        {/* Ear pods */}
        <ellipse cx="17" cy="62" rx="3.5" ry="7" fill="#64748B" />
        <ellipse cx="83" cy="62" rx="3.5" ry="7" fill="#64748B" />

        {/* --- Face Screen: Blue Oval --- */}
        <ellipse
          cx="50"
          cy="63"
          rx="25"
          ry="17"
          fill="url(#nusaScreen)"
          stroke="#1E40AF"
          strokeWidth="1.5"
        />

        {/* Screen inner top reflection */}
        <path
          d="M 33 55
             C 40 50, 60 50, 67 55
             C 58 53, 42 53, 33 55 Z"
          fill="#60A5FA"
          opacity="0.6"
        />

        {/* --- Eyes: Two expressive white capsules --- */}
        {/* Left eye */}
        <ellipse cx="41" cy="62" rx="3.2" ry="5.5" fill="#FFFFFF" />
        {/* Right eye */}
        <ellipse cx="59" cy="62" rx="3.2" ry="5.5" fill="#FFFFFF" />

        {/* Friendly eye shine dots */}
        <circle cx="42" cy="60" r="1.2" fill="#93C5FD" />
        <circle cx="60" cy="60" r="1.2" fill="#93C5FD" />

        {/* Cute blush cheeks */}
        <ellipse cx="32" cy="68" rx="2.5" ry="1.2" fill="#3B82F6" opacity="0.6" />
        <ellipse cx="68" cy="68" rx="2.5" ry="1.2" fill="#3B82F6" opacity="0.6" />
      </svg>
    </div>
  );
}
