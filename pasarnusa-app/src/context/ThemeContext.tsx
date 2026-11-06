"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { flushSync } from "react-dom";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: (event?: React.MouseEvent | MouseEvent, explicitTheme?: Theme) => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("pasarnusa_theme") as Theme | null;
      if (stored === "dark" || stored === "light") {
        setThemeState(stored);
        document.documentElement.classList.toggle("dark", stored === "dark");
      } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        setThemeState("dark");
        document.documentElement.classList.add("dark");
      }
    } catch {
      // Ignore storage access errors
    }
    setMounted(true);
  }, []);

  const applyThemeToDOM = (nextTheme: Theme) => {
    setThemeState(nextTheme);
    try {
      localStorage.setItem("pasarnusa_theme", nextTheme);
    } catch {
      // Ignore storage errors
    }
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const toggleTheme = useCallback(
    (event?: React.MouseEvent | MouseEvent, explicitTheme?: Theme) => {
      const nextTheme = explicitTheme || (theme === "light" ? "dark" : "light");
      if (nextTheme === theme) return;

      // Extract click position (or center of button)
      let x = typeof window !== "undefined" ? window.innerWidth / 2 : 0;
      let y = typeof window !== "undefined" ? window.innerHeight / 2 : 0;

      if (event && "clientX" in event && typeof event.clientX === "number" && event.clientX > 0) {
        x = event.clientX;
        y = event.clientY;
      } else if (event && "currentTarget" in event && event.currentTarget instanceof HTMLElement) {
        const rect = event.currentTarget.getBoundingClientRect();
        x = rect.left + rect.width / 2;
        y = rect.top + rect.height / 2;
      }

      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );

      // Check if startViewTransition is available and reduced motion is off
      const isReducedMotion =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const doc = typeof document !== "undefined" ? (document as unknown as { startViewTransition?: (cb: () => void) => { ready: Promise<void> } }) : null;

      if (!doc?.startViewTransition || isReducedMotion) {
        applyThemeToDOM(nextTheme);
        return;
      }

      // Use flushSync to force synchronous DOM commit inside startViewTransition
      const transition = doc.startViewTransition(() => {
        flushSync(() => {
          applyThemeToDOM(nextTheme);
        });
      });

      transition.ready
        .then(() => {
          const clipPath = [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ];

          document.documentElement.animate(
            {
              clipPath,
            },
            {
              duration: 550,
              easing: "cubic-bezier(0.4, 0, 0.2, 1)",
              pseudoElement: "::view-transition-new(root)",
            }
          );
        })
        .catch(() => {
          applyThemeToDOM(nextTheme);
        });
    },
    [theme]
  );

  const setTheme = useCallback(
    (newTheme: Theme) => {
      toggleTheme(undefined, newTheme);
    },
    [toggleTheme]
  );

  return (
    <ThemeContext.Provider
      value={{
        theme: mounted ? theme : "light",
        isDark: mounted && theme === "dark",
        toggleTheme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
