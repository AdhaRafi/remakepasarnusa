"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, MapPin, Eye, Sparkles } from "lucide-react";

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

  // Auto-play timer that pauses on user hover
  useEffect(() => {
    if (isHovered || autoPlayInterval <= 0 || total <= 1) return;
    timerRef.current = setInterval(handleNext, autoPlayInterval);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isHovered, autoPlayInterval, total, handleNext]);

  // Keyboard arrow navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev]);

  // Compute circular 3D transform for each card based on its relative offset
  const getCardTransform = (index: number) => {
    let offset = index - activeIndex;
    // Circular wrap around closest distance
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

    // Immediate right
    if (offset === 1) {
      return {
        x: "56%",
        z: -150,
        rotateY: -28,
        scale: 0.86,
        opacity: 0.78,
        filter: "blur(1.5px)",
        zIndex: 20,
        pointerEvents: "auto" as const,
      };
    }

    // Immediate left
    if (offset === -1) {
      return {
        x: "-56%",
        z: -150,
        rotateY: 28,
        scale: 0.86,
        opacity: 0.78,
        filter: "blur(1.5px)",
        zIndex: 20,
        pointerEvents: "auto" as const,
      };
    }

    // Far right
    if (offset === 2) {
      return {
        x: "96%",
        z: -300,
        rotateY: -42,
        scale: 0.72,
        opacity: 0.38,
        filter: "blur(3.5px)",
        zIndex: 10,
        pointerEvents: "auto" as const,
      };
    }

    // Far left
    if (offset === -2) {
      return {
        x: "-96%",
        z: -300,
        rotateY: 42,
        scale: 0.72,
        opacity: 0.38,
        filter: "blur(3.5px)",
        zIndex: 10,
        pointerEvents: "auto" as const,
      };
    }

    // Hidden cards beyond 2 steps
    return {
      x: offset > 0 ? "130%" : "-130%",
      z: -500,
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
      className={`relative w-full select-none ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label="3D Image Carousel Mahakarya Nusantara"
    >
      {/* 3D Stage Container (MZCode01 stage-container style) */}
      <div
        className="relative w-full h-[400px] sm:h-[450px] lg:h-[480px] rounded-3xl overflow-hidden flex items-center justify-center bg-gradient-to-b from-[#F3ECE0] via-[#FAF7F2] to-[#ECE3D4] dark:from-[#1E1713] dark:via-[#140F0C] dark:to-[#0C0908] border border-[#E7DFD4] dark:border-[#2C211A] shadow-2xl"
        style={{
          perspective: "1400px",
          transformStyle: "preserve-3d",
        }}
      >
        {/* Subtle radial ambient spotlight in background */}
        <div className="absolute inset-0 pointer-events-none opacity-60 dark:opacity-40 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#C94B1A]/20 via-transparent to-transparent" />

        {/* Floating Top Header Badges on Center Active Slide */}
        <div className="absolute top-4 inset-x-5 z-40 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2 rounded-full bg-black/60 dark:bg-black/80 backdrop-blur-md px-3.5 py-1.5 text-xs font-medium text-white shadow-md border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-[#E09F3E]" />
            <span>Mahakarya Kurasi</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-white/90 dark:bg-[#1A1411]/90 backdrop-blur-md px-3 py-1.5 text-xs font-bold text-[#8A5912] dark:text-[#E09F3E] border border-[#B8872A]/30 shadow-md">
            <span>
              {String(activeIndex + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </span>
          </div>
        </div>

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
                className={`absolute w-[240px] sm:w-[270px] lg:w-[290px] h-[330px] sm:h-[370px] lg:h-[390px] rounded-2xl overflow-hidden cursor-pointer ${
                  isCenter
                    ? "shadow-[0_22px_45px_rgba(26,17,11,0.35)] dark:shadow-[0_22px_45px_rgba(0,0,0,0.7)] ring-2 ring-[#C94B1A]/80 dark:ring-[#C94B1A]/60"
                    : "shadow-[0_12px_28px_rgba(0,0,0,0.25)] hover:opacity-95"
                } transition-shadow duration-300`}
                style={{
                  transformStyle: "preserve-3d",
                }}
              >
                {/* Product Image */}
                <img
                  src={slide.image}
                  alt={slide.title}
                  draggable={false}
                  className="w-full h-full object-cover select-none"
                />

                {/* Subtle glass reflection highlight */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-transparent pointer-events-none opacity-40" />

                {/* Gradient vignette for text legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

                {/* Top badges inside the card */}
                <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10 pointer-events-none">
                  <div className="flex items-center gap-1 rounded bg-black/65 backdrop-blur-sm px-2.5 py-1 text-[11px] font-medium text-white shadow">
                    <MapPin className="w-3 h-3 text-[#FFA07A]" />
                    <span className="truncate max-w-[120px]">{slide.location}</span>
                  </div>
                  <span className="rounded bg-[#C94B1A] px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase text-white shadow">
                    {slide.badge}
                  </span>
                </div>

                {/* Bottom Information (Active vs Inactive) */}
                <div className="absolute inset-x-0 bottom-0 p-4 text-white z-10">
                  <p className="text-[11px] font-semibold tracking-wide text-[#FFA07A] uppercase">
                    {slide.tag}
                  </p>
                  <h3 className="font-serif text-lg sm:text-xl font-bold mt-0.5 leading-snug line-clamp-1">
                    {slide.title}
                  </h3>
                  <p className="text-xs text-white/80 mt-1 line-clamp-2 leading-relaxed">
                    {slide.desc}
                  </p>

                  {/* Active Card CTA Button */}
                  <AnimatePresence>
                    {isCenter && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.25 }}
                        className="mt-3.5 pt-2.5 border-t border-white/20 flex items-center justify-between"
                      >
                        <span className="text-xs font-semibold text-[#FFA07A] flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5" />
                          <span>Klik untuk detail</span>
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onSelectSlide) onSelectSlide(slide);
                          }}
                          className="px-3.5 py-1.5 rounded-lg bg-[#C94B1A] hover:bg-[#B33F14] text-white text-xs font-bold shadow-md transition-transform active:scale-95 flex items-center gap-1"
                        >
                          <span>Buka Karya</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Floating Left Arrow Navigation */}
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Karya Sebelumnya"
          className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-40 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-black/40 hover:bg-black/75 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg group"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 group-hover:-translate-x-0.5 transition-transform" />
        </button>

        {/* Floating Right Arrow Navigation */}
        <button
          type="button"
          onClick={handleNext}
          aria-label="Karya Berikutnya"
          className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-40 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-black/40 hover:bg-black/75 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg group"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* Bottom Navigation Indicators (Pill Dots) */}
        <div className="absolute bottom-4 inset-x-0 z-40 flex items-center justify-center gap-2">
          {slides.map((_, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveIndex(idx)}
                aria-label={`Pindah ke slide ${idx + 1}`}
                className={`transition-all duration-300 rounded-full ${
                  isActive
                    ? "w-8 h-2 bg-[#C94B1A] shadow-md"
                    : "w-2 h-2 bg-black/30 dark:bg-white/30 hover:bg-black/60 dark:hover:bg-white/60"
                }`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
