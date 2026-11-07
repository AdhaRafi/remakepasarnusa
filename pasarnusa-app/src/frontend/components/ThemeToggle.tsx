"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/frontend/context/ThemeContext";

interface ThemeToggleProps {
  mode?: "vertical" | "horizontal" | "compact";
  className?: string;
}

export default function ThemeToggle({
  mode = "vertical",
  className = "",
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  // Compact Single Button Mode (for mobile / tight navbars)
  if (mode === "compact") {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        type="button"
        onClick={(e) => toggleTheme(e)}
        className={`relative h-9 w-9 items-center justify-center rounded-full bg-white dark:bg-[#201A16] text-[#8A5912] dark:text-[#E09F3E] border border-[#DFD7CA] dark:border-white/10 transition-colors ${className}`}
        aria-label={isDark ? "Beralih ke mode terang" : "Beralih ke mode gelap"}
        title={isDark ? "Mode Terang (Light)" : "Mode Gelap (Dark)"}
      >
        <motion.div
          key={theme}
          initial={{ rotate: -90, scale: 0.6, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          exit={{ rotate: 90, scale: 0.6, opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {isDark ? <Moon className="w-4 h-4 fill-current" /> : <Sun className="w-4 h-4" />}
        </motion.div>
      </motion.button>
    );
  }

  // Horizontal Pill Mode (for top action bar)
  if (mode === "horizontal") {
    return (
      <div
        className={`relative items-center p-1 rounded-full bg-white/90 dark:bg-[#1A1411] border border-[#DFD7CA] dark:border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.04),inset_0_1px_2px_rgba(255,255,255,0.9)] ${className}`}
        role="group"
        aria-label="Pengalih Tema Mode Gelap Terang"
      >
        {/* Animated Sliding Bubble */}
        <motion.div
          animate={{ x: isDark ? 32 : 0 }}
          transition={{ type: "spring", stiffness: 450, damping: 28 }}
          className="absolute left-1 top-1 w-8 h-8 rounded-full bg-[#FAF5EB] dark:bg-[#2C211A] border border-[#E8DFD5] dark:border-white/10 pointer-events-none"
        />

        {/* Light Option Button */}
        <button
          type="button"
          onClick={(e) => toggleTheme(e, "light")}
          className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
            !isDark ? "text-[#C94B1A]" : "text-[#8C7E72] hover:text-[#D1C7BD]"
          }`}
          aria-label="Mode Terang"
          title="Mode Terang (Siang)"
        >
          <Sun className="w-4 h-4" />
        </button>

        {/* Dark Option Button */}
        <button
          type="button"
          onClick={(e) => toggleTheme(e, "dark")}
          className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
            isDark ? "text-[#FF8F6B]" : "text-[#8C7E72] hover:text-[#1A110B]"
          }`}
          aria-label="Mode Gelap"
          title="Mode Gelap (Malam)"
        >
          <Moon className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Vertical Pill Mode (Exact Layout & Physics from TikTok Video @settigation Dashboard V14)
  return (
    <div
      className={`relative inline-flex flex-col items-center justify-between w-[38px] h-[76px] p-1 rounded-full bg-white/95 dark:bg-[#1C1613] border border-[#E4DDD3] dark:border-white/10 shadow-[0_4px_16px_rgba(0,0,0,0.06),inset_0_2px_4px_rgba(255,255,255,0.95)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.4),inset_0_1px_2px_rgba(255,255,255,0.06)] select-none ${className}`}
      role="group"
      aria-label="Pengalih Tema Vertikal"
    >
      {/* Animated Sliding Background Bubble */}
      <motion.div
        animate={{ y: isDark ? 36 : 0 }}
        transition={{ type: "spring", stiffness: 450, damping: 28 }}
        className="absolute left-1 top-1 w-7 h-7 rounded-full bg-[#FAF5EB] dark:bg-[#2C211A] shadow-[0_2px_6px_rgba(0,0,0,0.12)] border border-[#E8DFD5] dark:border-white/10 pointer-events-none"
      />

      {/* Sun Button (Top) */}
      <button
        type="button"
        onClick={(e) => toggleTheme(e, "light")}
        className={`relative z-10 flex items-center justify-center w-7 h-7 rounded-full transition-colors active:scale-90 ${
          !isDark ? "text-[#C94B1A]" : "text-[#9C8F84] hover:text-[#1A110B] dark:hover:text-[#E2D8CE]"
        }`}
        aria-label="Aktifkan Mode Terang"
        title="Mode Terang (Siang)"
      >
        <Sun className="w-4 h-4" />
      </button>

      {/* Moon Button (Bottom) */}
      <button
        type="button"
        onClick={(e) => toggleTheme(e, "dark")}
        className={`relative z-10 flex items-center justify-center w-7 h-7 rounded-full transition-colors active:scale-90 ${
          isDark ? "text-[#FF8F6B]" : "text-[#9C8F84] hover:text-[#1A110B] dark:hover:text-[#E2D8CE]"
        }`}
        aria-label="Aktifkan Mode Gelap"
        title="Mode Gelap (Malam)"
      >
        <Moon className="w-4 h-4" />
      </button>
    </div>
  );
}
