"use client";

import React from "react";
import { motion } from "framer-motion";

interface NusaMascotProps {
  className?: string;
  size?: number;
  variant?: "waving" | "head";
  animated?: boolean;
}

export default function NusaMascot({
  className = "",
  size = 56,
  variant = "waving",
  animated = true,
}: NusaMascotProps) {
  // 1. Compact Head Avatar Variant (for chat message avatars)
  if (variant === "head") {
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
          className="w-full h-full drop-shadow-xs"
        >
          <defs>
            <linearGradient id="headBody" x1="20" y1="20" x2="80" y2="90" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="60%" stopColor="#F9F6F0" />
              <stop offset="100%" stopColor="#E5DCCE" />
            </linearGradient>
            <linearGradient id="headScreen" x1="30" y1="40" x2="70" y2="75" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#2A1B14" />
              <stop offset="100%" stopColor="#140D09" />
            </linearGradient>
            <linearGradient id="headSpark" x1="50" y1="5" x2="55" y2="28" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#C94B1A" />
            </linearGradient>
          </defs>
          {/* Antenna */}
          <path d="M52 4 L44 16 L51 16 L46 27 L58 14 L51 14 Z" fill="url(#headSpark)" stroke="#9A3412" strokeWidth="0.8" />
          <ellipse cx="50" cy="27" rx="5" ry="2.5" fill="#C94B1A" />
          {/* Head */}
          <path
            d="M 50 24 C 74 24, 82 40, 82 62 C 82 78, 72 88, 50 88 C 28 88, 18 78, 18 62 C 18 40, 26 24, 50 24 Z"
            fill="url(#headBody)"
            stroke="#D5C7B5"
            strokeWidth="1.5"
          />
          {/* Screen */}
          <ellipse cx="50" cy="63" rx="25" ry="17" fill="url(#headScreen)" stroke="#38251C" strokeWidth="1.5" />
          {/* Happy smiling eyes ^ _ ^ */}
          <path d="M 38 64 Q 43 56 48 64" stroke="#FFFBEB" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M 52 64 Q 57 56 62 64" stroke="#FFFBEB" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          {/* Cheeks */}
          <ellipse cx="33" cy="69" rx="2.5" ry="1.2" fill="#C94B1A" opacity="0.6" />
          <ellipse cx="67" cy="69" rx="2.5" ry="1.2" fill="#C94B1A" opacity="0.6" />
        </svg>
      </div>
    );
  }

  // 2. Full-Body Robot Mascot with Lively Waving Arms & Floating Animation (Inspired by reference video)
  return (
    <motion.div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: Math.round(size * 1.15) }}
      aria-hidden="true"
      animate={animated ? { y: [0, -4, 0] } : undefined}
      transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
      whileHover={{ scale: 1.08 }}
    >
      <svg
        viewBox="0 0 120 135"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md overflow-visible"
      >
        <defs>
          {/* Ceramic Body Gradient */}
          <linearGradient id="bodyGrad" x1="30" y1="20" x2="90" y2="120" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="65%" stopColor="#FAF7F2" />
            <stop offset="100%" stopColor="#E5DCCE" />
          </linearGradient>

          {/* Glazed Obsidian Face Screen */}
          <linearGradient id="faceGrad" x1="40" y1="42" x2="80" y2="78" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2A1B14" />
            <stop offset="100%" stopColor="#140D09" />
          </linearGradient>

          {/* Golden Spark Antenna */}
          <linearGradient id="sparkGrad" x1="58" y1="2" x2="63" y2="25" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="60%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#C94B1A" />
          </linearGradient>

          {/* Soft glow for antenna */}
          <filter id="sparkFilter" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* --- Antenna: Golden Creative Spark with subtle pulse --- */}
        <motion.g
          animate={animated ? { scale: [1, 1.1, 1], y: [0, -1, 0] } : undefined}
          transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
          style={{ transformOrigin: "60px 25px" }}
          filter="url(#sparkFilter)"
        >
          <path
            d="M62 2 L54 14 L61 14 L56 25 L68 12 L61 12 Z"
            fill="url(#sparkGrad)"
            stroke="#9A3412"
            strokeWidth="0.8"
            strokeLinejoin="round"
          />
        </motion.g>
        {/* Antenna Base Mount */}
        <ellipse cx="60" cy="25" rx="5" ry="2.5" fill="#C94B1A" />

        {/* --- Left Arm: Animated Waving Up & Down --- */}
        <motion.g
          animate={
            animated
              ? {
                  rotate: [-8, 14, -8],
                }
              : undefined
          }
          transition={{
            repeat: Infinity,
            duration: 1.3,
            ease: "easeInOut",
          }}
          style={{ transformOrigin: "36px 62px" }}
        >
          <path
            d="M 36 62
               C 24 55, 14 45, 12 34
               C 11 29, 17 26, 21 30
               C 26 36, 32 46, 40 56 Z"
            fill="url(#bodyGrad)"
            stroke="#D5C7B5"
            strokeWidth="1.4"
          />
        </motion.g>

        {/* --- Right Arm: Animated Waving Up & Down (Alternating Rhythm) --- */}
        <motion.g
          animate={
            animated
              ? {
                  rotate: [8, -14, 8],
                }
              : undefined
          }
          transition={{
            repeat: Infinity,
            duration: 1.3,
            ease: "easeInOut",
            delay: 0.25,
          }}
          style={{ transformOrigin: "84px 62px" }}
        >
          <path
            d="M 84 62
               C 96 55, 106 45, 108 34
               C 109 29, 103 26, 99 30
               C 94 36, 88 46, 80 56 Z"
            fill="url(#bodyGrad)"
            stroke="#D5C7B5"
            strokeWidth="1.4"
          />
        </motion.g>

        {/* --- Little Feet / Legs with subtle step motion --- */}
        <g>
          {/* Left Foot */}
          <path
            d="M 40 106
               C 38 114, 40 124, 47 124
               C 53 124, 53 116, 52 108 Z"
            fill="url(#bodyGrad)"
            stroke="#D5C7B5"
            strokeWidth="1.4"
          />
          {/* Right Foot */}
          <path
            d="M 68 108
               C 67 116, 67 124, 73 124
               C 80 124, 82 114, 80 106 Z"
            fill="url(#bodyGrad)"
            stroke="#D5C7B5"
            strokeWidth="1.4"
          />
        </g>

        {/* --- Main Capsule Body --- */}
        <path
          d="M 60 22
             C 86 22, 94 40, 94 68
             C 94 92, 85 110, 60 110
             C 35 110, 26 92, 26 68
             C 26 40, 34 22, 60 22 Z"
          fill="url(#bodyGrad)"
          stroke="#D5C7B5"
          strokeWidth="1.5"
        />

        {/* Glossy Head Highlight */}
        <path
          d="M 42 30
             C 52 25, 68 25, 78 30
             C 70 28, 50 28, 42 30 Z"
          fill="#FFFFFF"
          opacity="0.9"
        />

        {/* Body Horizontal Seam Line */}
        <path
          d="M 28 82 Q 60 88 92 82"
          stroke="#D5C7B5"
          strokeWidth="1"
          strokeDasharray="2 1"
          fill="none"
          opacity="0.7"
        />

        {/* Tiny belly brand emblem */}
        <ellipse cx="60" cy="90" rx="3" ry="1.5" fill="#C94B1A" opacity="0.4" />

        {/* --- Face Screen: Glazed Obsidian Oval --- */}
        <ellipse
          cx="60"
          cy="56"
          rx="24"
          ry="17"
          fill="url(#faceGrad)"
          stroke="#38251C"
          strokeWidth="1.5"
        />

        {/* Top inner sheen */}
        <path
          d="M 44 48
             C 50 44, 70 44, 76 48
             C 68 46, 52 46, 44 48 Z"
          fill="#B8872A"
          opacity="0.3"
        />

        {/* --- Happy Smiling Curved Eyes with Gentle Blink: ^ _ ^ --- */}
        <motion.g
          animate={
            animated
              ? {
                  scaleY: [1, 1, 0.1, 1, 1],
                }
              : undefined
          }
          transition={{
            repeat: Infinity,
            duration: 3.5,
            times: [0, 0.9, 0.93, 0.96, 1],
            ease: "easeInOut",
          }}
          style={{ transformOrigin: "60px 57px" }}
        >
          {/* Left Curved Eye */}
          <path
            d="M 47 57 Q 53 49 59 57"
            stroke="#FFFBEB"
            strokeWidth="2.8"
            strokeLinecap="round"
            fill="none"
          />
          {/* Right Curved Eye */}
          <path
            d="M 61 57 Q 67 49 73 57"
            stroke="#FFFBEB"
            strokeWidth="2.8"
            strokeLinecap="round"
            fill="none"
          />
        </motion.g>

        {/* Cute Warm Terracotta Blush Cheeks */}
        <ellipse cx="42" cy="61" rx="2.8" ry="1.4" fill="#C94B1A" opacity="0.7" />
        <ellipse cx="78" cy="61" rx="2.8" ry="1.4" fill="#C94B1A" opacity="0.7" />
      </svg>
    </motion.div>
  );
}
