"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface HeroSlide {
  id: number;
  tag: string;
  title: string;
  desc: string;
  location: string;
  badge: string;
  image: string;
  price?: number;
}

interface HeroCarousel3DProps {
  slides: HeroSlide[];
  onSelectSlide?: (slide: HeroSlide) => void;
  className?: string;
  autoPlayInterval?: number;
}

export default function HeroCarousel3D({
  slides,
  onSelectSlide,
  className = "",
  autoPlayInterval = 4500,
}: HeroCarousel3DProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const total = slides.length;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % total);
  }, [total]);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Auto-play timer with pause on hover
  useEffect(() => {
    if (isHovered || autoPlayInterval <= 0 || total <= 1) return;
    timerRef.current = setInterval(handleNext, autoPlayInterval);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isHovered, autoPlayInterval, total, handleNext]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev]);

  // Compute 3D coverflow transform for each card based on offset
  const getCardTransform = (index: number) => {
    let offset = index - activeIndex;
    if (offset > total / 2) offset -= total;
    if (offset < -total / 2) offset += total;

    // Center active card
    if (offset === 0) {
      return {
        x: "0%",
        z: 0,
        rotateY: 0,
        scale: 1,
        opacity: 1,
        filter: "blur(0px)",
        zIndex: 30,
        pointerEvents: "auto" as const,
      };
    }

    // Immediate right card
    if (offset === 1) {
      return {
        x: "56%",
        z: -140,
        rotateY: -28,
        scale: 0.86,
        opacity: 0.78,
        filter: "blur(1.5px)",
        zIndex: 20,
        pointerEvents: "auto" as const,
      };
    }

    // Immediate left card
    if (offset === -1) {
      return {
        x: "-56%",
        z: -140,
        rotateY: 28,
        scale: 0.86,
        opacity: 0.78,
        filter: "blur(1.5px)",
        zIndex: 20,
        pointerEvents: "auto" as const,
      };
    }

    // Far right card
    if (offset === 2) {
      return {
        x: "96%",
        z: -280,
        rotateY: -42,
        scale: 0.72,
        opacity: 0.4,
        filter: "blur(3px)",
        zIndex: 10,
        pointerEvents: "auto" as const,
      };
    }

    // Far left card
    if (offset === -2) {
      return {
        x: "-96%",
        z: -280,
        rotateY: 42,
        scale: 0.72,
        opacity: 0.4,
        filter: "blur(3px)",
        zIndex: 10,
        pointerEvents: "auto" as const,
      };
    }

    // Hidden cards beyond 2 steps
    return {
      x: offset > 0 ? "130%" : "-130%",
      z: -480,
      rotateY: offset > 0 ? -60 : 60,
      scale: 0.5,
      opacity: 0,
      filter: "blur(6px)",
      zIndex: 0,
      pointerEvents: "none" as const,
    };
  };

  return (
    <div
      className={`relative w-full select-none group ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label="3D Image Carousel"
    >
      {/* 3D Stage Container (MZCode01 stage-container style) */}
      <div
        className="relative w-full h-[380px] sm:h-[440px] lg:h-[470px] rounded-3xl overflow-hidden flex items-center justify-center bg-[radial-gradient(circle_at_50%_50%,#F5EFE6_0%,#E6DCCE_75%)] dark:bg-[radial-gradient(circle_at_50%_50%,#1F1813_0%,#0D0A08_75%)] border border-[#E7DFD4] dark:border-[#2C211A] shadow-2xl"
        style={{
          perspective: "1400px",
          transformStyle: "preserve-3d",
        }}
      >
        {/* Subtle radial spotlight glow in background */}
        <div className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-30 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#C94B1A]/20 via-transparent to-transparent" />

        {/* 3D Cards Stack */}
        <div
          className="relative w-full h-full flex items-center justify-center"
          style={{ transformStyle: "preserve-3d" }}
        >
          {slides.map((slide, index) => {
            const transform = getCardTransform(index);
            const isCenter = index === activeIndex;

            return (
              <motion.div
                key={slide.id}
                animate={transform}
                transition={{
                  type: "spring",
                  stiffness: 240,
                  damping: 26,
                  mass: 0.85,
                }}
                drag={isCenter ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(_, info) => {
                  if (info.offset.x > 50) handlePrev();
                  else if (info.offset.x < -50) handleNext();
                }}
                onClick={() => {
                  if (!isCenter) {
                    setActiveIndex(index);
                  } else if (onSelectSlide) {
                    onSelectSlide(slide);
                  }
                }}
                className={`absolute w-[230px] sm:w-[260px] lg:w-[280px] h-[320px] sm:h-[370px] lg:h-[395px] rounded-2xl overflow-hidden cursor-pointer ${
                  isCenter
                    ? "shadow-[0_25px_50px_rgba(0,0,0,0.45)] dark:shadow-[0_25px_50px_rgba(0,0,0,0.85)]"
                    : "shadow-[0_12px_28px_rgba(0,0,0,0.25)] hover:opacity-95"
                } transition-shadow duration-300`}
                style={{
                  transformStyle: "preserve-3d",
                }}
              >
                {/* Pure Product Image Card */}
                <img
                  src={slide.image}
                  alt={slide.title}
                  draggable={false}
                  className="w-full h-full object-cover select-none"
                />

                {/* Subtle soft edge highlight */}
                <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-black/10 dark:ring-white/10 pointer-events-none" />
              </motion.div>
            );
          })}
        </div>

        {/* Floating Left Arrow (Visible on hover or mobile) */}
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Sebelumnya"
          className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-40 h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-black/35 hover:bg-black/70 text-white backdrop-blur-md border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Floating Right Arrow (Visible on hover or mobile) */}
        <button
          type="button"
          onClick={handleNext}
          aria-label="Berikutnya"
          className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-40 h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-black/35 hover:bg-black/70 text-white backdrop-blur-md border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>
    </div>
  );
}
