"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme, Theme } from "@/frontend/context/ThemeContext";

interface ThemeToggleProps {
  mode?: "vertical" | "horizontal" | "compact";
  className?: string;
}

export default function ThemeToggle({
  mode = "vertical",
  className = "",
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  // 1. Compact Single Button Mode (for mobile / tight navbars)
  if (mode === "compact") {
    const icon =
      theme === "system" ? (
        <Monitor className="w-4 h-4" />
      ) : theme === "dark" ? (
        <Moon className="w-4 h-4 fill-current" />
      ) : (
        <Sun className="w-4 h-4" />
      );

    const title =
      theme === "system"
        ? "Tema Sistem (Otomatis)"
        : theme === "dark"
        ? "Mode Gelap (Malam)"
        : "Mode Terang (Siang)";

    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        type="button"
        onClick={(e) => toggleTheme(e)}
        className={`relative inline-flex h-9 w-9 items-center justify-center rounded-full bg-white dark:bg-[#201A16] text-[#8A5912] dark:text-[#E09F3E] border border-[#DFD7CA] dark:border-white/10 transition-colors shadow-2xs ${className}`}
        aria-label={`Pengalih tema. Saat ini: ${title}`}
        title={title}
      >
        <motion.div
          key={theme}
          initial={{ rotate: -70, scale: 0.6, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          exit={{ rotate: 70, scale: 0.6, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {icon}
        </motion.div>
      </motion.button>
    );
  }

  // 2. Horizontal 3-Way Pill Mode (for top navbar & headers)
  if (mode === "horizontal") {
    const xPos = theme === "light" ? 0 : theme === "dark" ? 32 : 64;

    return (
      <div
        className={`relative inline-flex items-center p-1 rounded-full bg-white/95 dark:bg-[#1A1411] border border-[#DFD7CA] dark:border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.04),inset_0_1px_2px_rgba(255,255,255,0.9)] select-none ${className}`}
        role="group"
        aria-label="Pengalih Tema: Terang, Gelap, atau Sistem"
      >
        {/* Animated Sliding Bubble */}
        <motion.div
          animate={{ x: xPos }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="absolute left-1 top-1 w-8 h-8 rounded-full bg-[#FAF5EB] dark:bg-[#2C211A] border border-[#E8DFD5] dark:border-white/10 shadow-xs pointer-events-none"
        />

        {/* 1. Light Option */}
        <button
          type="button"
          onClick={(e) => toggleTheme(e, "light")}
          className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
            theme === "light" ? "text-[#C94B1A]" : "text-[#8C7E72] hover:text-[#1A110B] dark:hover:text-[#F5EFEB]"
          }`}
          aria-label="Mode Terang"
          title="Mode Terang (Siang)"
        >
          <Sun className="w-4 h-4" />
        </button>

        {/* 2. Dark Option */}
        <button
          type="button"
          onClick={(e) => toggleTheme(e, "dark")}
          className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
            theme === "dark" ? "text-[#FF8F6B]" : "text-[#8C7E72] hover:text-[#1A110B] dark:hover:text-[#F5EFEB]"
          }`}
          aria-label="Mode Gelap"
          title="Mode Gelap (Malam)"
        >
          <Moon className="w-4 h-4" />
        </button>

        {/* 3. System Option */}
        <button
          type="button"
          onClick={(e) => toggleTheme(e, "system")}
          className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
            theme === "system" ? "text-[#B8872A] dark:text-[#FCD34D]" : "text-[#8C7E72] hover:text-[#1A110B] dark:hover:text-[#F5EFEB]"
          }`}
          aria-label="Ikuti Sistem Perangkat"
          title="Ikuti Sistem Perangkat (Otomatis)"
        >
          <Monitor className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // 3. Vertical 3-Way Pill Mode (for admin / vertical toolbars)
  const yPos = theme === "light" ? 0 : theme === "dark" ? 36 : 72;

  return (
    <div
      className={`relative inline-flex flex-col items-center justify-between w-[38px] h-[114px] p-1 rounded-full bg-white/95 dark:bg-[#1C1613] border border-[#E4DDD3] dark:border-white/10 shadow-[0_4px_16px_rgba(0,0,0,0.06),inset_0_2px_4px_rgba(255,255,255,0.95)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.4),inset_0_1px_2px_rgba(255,255,255,0.06)] select-none ${className}`}
      role="group"
      aria-label="Pengalih Tema Vertikal: Terang, Gelap, atau Sistem"
    >
      {/* Animated Sliding Background Bubble */}
      <motion.div
        animate={{ y: yPos }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="absolute left-1 top-1 w-7 h-7 rounded-full bg-[#FAF5EB] dark:bg-[#2C211A] shadow-[0_2px_6px_rgba(0,0,0,0.12)] border border-[#E8DFD5] dark:border-white/10 pointer-events-none"
      />

      {/* Sun Button (Top) */}
      <button
        type="button"
        onClick={(e) => toggleTheme(e, "light")}
        className={`relative z-10 flex items-center justify-center w-7 h-7 rounded-full transition-colors active:scale-90 ${
          theme === "light" ? "text-[#C94B1A]" : "text-[#9C8F84] hover:text-[#1A110B] dark:hover:text-[#E2D8CE]"
        }`}
        aria-label="Mode Terang"
        title="Mode Terang (Siang)"
      >
        <Sun className="w-4 h-4" />
      </button>

      {/* Moon Button (Middle) */}
      <button
        type="button"
        onClick={(e) => toggleTheme(e, "dark")}
        className={`relative z-10 flex items-center justify-center w-7 h-7 rounded-full transition-colors active:scale-90 ${
          theme === "dark" ? "text-[#FF8F6B]" : "text-[#9C8F84] hover:text-[#1A110B] dark:hover:text-[#E2D8CE]"
        }`}
        aria-label="Mode Gelap"
        title="Mode Gelap (Malam)"
      >
        <Moon className="w-4 h-4" />
      </button>

      {/* Monitor Button (Bottom) */}
      <button
        type="button"
        onClick={(e) => toggleTheme(e, "system")}
        className={`relative z-10 flex items-center justify-center w-7 h-7 rounded-full transition-colors active:scale-90 ${
          theme === "system" ? "text-[#B8872A] dark:text-[#FCD34D]" : "text-[#9C8F84] hover:text-[#1A110B] dark:hover:text-[#E2D8CE]"
        }`}
        aria-label="Ikuti Sistem Perangkat"
        title="Ikuti Sistem Perangkat (Otomatis)"
      >
        <Monitor className="w-4 h-4" />
      </button>
    </div>
  );
}
