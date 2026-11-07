"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { flushSync } from "react-dom";

export type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: (event?: React.MouseEvent | MouseEvent, explicitTheme?: Theme) => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [systemIsDark, setSystemIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);
  const themeRef = useRef<Theme>("system");

  themeRef.current = theme;

  // Resolve if dark class should be active
  const isEffectiveDark = useCallback(
    (targetTheme: Theme, sysDark: boolean) => {
      if (targetTheme === "dark") return true;
      if (targetTheme === "light") return false;
      return sysDark;
    },
    []
  );

  useEffect(() => {
    let initialTheme: Theme = "system";
    let sysDark = false;

    if (typeof window !== "undefined") {
      sysDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setSystemIsDark(sysDark);

      try {
        const stored = localStorage.getItem("pasarnusa_theme") as Theme | null;
        if (stored === "dark" || stored === "light" || stored === "system") {
          initialTheme = stored;
        }
      } catch {
        // Ignore localStorage errors
      }

      setThemeState(initialTheme);
      themeRef.current = initialTheme;

      const activeDark = isEffectiveDark(initialTheme, sysDark);
      document.documentElement.classList.toggle("dark", activeDark);

      // Listen for system theme changes in real time
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      const handleSystemChange = (e: MediaQueryListEvent) => {
        setSystemIsDark(e.matches);
        if (themeRef.current === "system") {
          document.documentElement.classList.toggle("dark", e.matches);
        }
      };

      media.addEventListener("change", handleSystemChange);
      setMounted(true);

      return () => media.removeEventListener("change", handleSystemChange);
    }
  }, [isEffectiveDark]);

  const applyThemeToDOM = (nextTheme: Theme) => {
    setThemeState(nextTheme);
    themeRef.current = nextTheme;

    try {
      localStorage.setItem("pasarnusa_theme", nextTheme);
    } catch {
      // Ignore storage errors
    }

    const currentSysDark =
      typeof window !== "undefined"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
        : false;

    const shouldBeDark = isEffectiveDark(nextTheme, currentSysDark);
    if (shouldBeDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const toggleTheme = useCallback(
    (event?: React.MouseEvent | MouseEvent, explicitTheme?: Theme) => {
      let nextTheme: Theme;
      if (explicitTheme) {
        nextTheme = explicitTheme;
      } else {
        // Cycle: system -> light -> dark -> system
        if (theme === "system") nextTheme = "light";
        else if (theme === "light") nextTheme = "dark";
        else nextTheme = "system";
      }

      if (nextTheme === theme) return;

      const currentSysDark =
        typeof window !== "undefined"
          ? window.matchMedia("(prefers-color-scheme: dark)").matches
          : false;

      const currentEffectiveDark = isEffectiveDark(theme, currentSysDark);
      const nextEffectiveDark = isEffectiveDark(nextTheme, currentSysDark);

      // If effective dark mode does not visually flip (e.g. system is light and user picked light), skip heavy transition
      if (currentEffectiveDark === nextEffectiveDark) {
        applyThemeToDOM(nextTheme);
        return;
      }

      // Extract click position (or center of viewport)
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

      const doc =
        typeof document !== "undefined"
          ? (document as unknown as {
              startViewTransition?: (cb: () => void) => { ready: Promise<void> };
            })
          : null;

      if (!doc?.startViewTransition || isReducedMotion) {
        applyThemeToDOM(nextTheme);
        return;
      }

      // Smooth circular reveal transition
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
            { clipPath },
            {
              duration: 500,
              easing: "cubic-bezier(0.4, 0, 0.2, 1)",
              pseudoElement: "::view-transition-new(root)",
            }
          );
        })
        .catch(() => {
          applyThemeToDOM(nextTheme);
        });
    },
    [theme, isEffectiveDark]
  );

  const setTheme = useCallback(
    (newTheme: Theme) => {
      toggleTheme(undefined, newTheme);
    },
    [toggleTheme]
  );

  const resolvedIsDark = mounted
    ? isEffectiveDark(theme, systemIsDark)
    : false;

  return (
    <ThemeContext.Provider
      value={{
        theme: mounted ? theme : "system",
        isDark: resolvedIsDark,
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
