import React from "react";

interface NusaMascotProps {
  className?: string;
  size?: number;
  animated?: boolean;
}

export default function NusaMascot({ className = "", size = 48 }: NusaMascotProps) {
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
        className="w-full h-full drop-shadow-sm"
      >
        <defs>
          {/* Body gradient: Warm ivory ceramic */}
          <linearGradient id="nusaClayBody" x1="20" y1="20" x2="80" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="60%" stopColor="#F9F6F0" />
            <stop offset="100%" stopColor="#E5DCCE" />
          </linearGradient>

          {/* Screen face gradient: Deep Glazed Espresso */}
          <linearGradient id="nusaObsidianScreen" x1="30" y1="40" x2="70" y2="75" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2A1B14" />
            <stop offset="100%" stopColor="#140D09" />
          </linearGradient>

          {/* Antenna spark gradient: Antique Gold to Terracotta */}
          <linearGradient id="nusaGoldSpark" x1="50" y1="5" x2="55" y2="28" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="50%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#C94B1A" />
          </linearGradient>

          {/* Soft spark glow */}
          <filter id="nusaSparkGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* --- Antenna: Golden Flame / Creative Spark --- */}
        <g filter="url(#nusaSparkGlow)">
          <path
            d="M52 4 L44 16 L51 16 L46 27 L58 14 L51 14 Z"
            fill="url(#nusaGoldSpark)"
            stroke="#9A3412"
            strokeWidth="0.8"
            strokeLinejoin="round"
          />
        </g>
        {/* Antenna Base: Terakota Ring */}
        <ellipse cx="50" cy="27" rx="5" ry="2.5" fill="#C94B1A" />

        {/* --- Head / Body: Smooth Handcrafted Ceramic Capsule --- */}
        <path
          d="M 50 24
             C 74 24, 82 40, 82 62
             C 82 78, 72 88, 50 88
             C 28 88, 18 78, 18 62
             C 18 40, 26 24, 50 24 Z"
          fill="url(#nusaClayBody)"
          stroke="#D5C7B5"
          strokeWidth="1.5"
        />

        {/* Head glossy highlight reflection */}
        <path
          d="M 32 32
             C 42 27, 58 27, 68 32
             C 60 30, 40 30, 32 32 Z"
          fill="#FFFFFF"
          opacity="0.9"
        />

        {/* Ear pods: Warm Terakota Accent */}
        <ellipse cx="17" cy="62" rx="3.5" ry="7" fill="#C94B1A" />
        <ellipse cx="83" cy="62" rx="3.5" ry="7" fill="#C94B1A" />

        {/* --- Face Screen: Deep Glazed Obsidian Oval --- */}
        <ellipse
          cx="50"
          cy="63"
          rx="25"
          ry="17"
          fill="url(#nusaObsidianScreen)"
          stroke="#38251C"
          strokeWidth="1.5"
        />

        {/* Screen inner top subtle warm sheen */}
        <path
          d="M 33 55
             C 40 50, 60 50, 67 55
             C 58 53, 42 53, 33 55 Z"
          fill="#B8872A"
          opacity="0.35"
        />

        {/* --- Eyes: Two warm golden/cream capsules --- */}
        {/* Left eye */}
        <ellipse cx="41" cy="62" rx="3.2" ry="5.5" fill="#FFFBEB" />
        {/* Right eye */}
        <ellipse cx="59" cy="62" rx="3.2" ry="5.5" fill="#FFFBEB" />

        {/* Warm eye pupils / highlights */}
        <circle cx="42" cy="60" r="1.2" fill="#FDE68A" />
        <circle cx="60" cy="60" r="1.2" fill="#FDE68A" />

        {/* Warm Terakota blush cheeks */}
        <ellipse cx="32" cy="68" rx="2.5" ry="1.2" fill="#C94B1A" opacity="0.6" />
        <ellipse cx="68" cy="68" rx="2.5" ry="1.2" fill="#C94B1A" opacity="0.6" />
      </svg>
    </div>
  );
}
