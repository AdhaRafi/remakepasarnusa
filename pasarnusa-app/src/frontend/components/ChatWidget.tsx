"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, SendHorizontal, Loader2, RotateCcw, Sparkles } from "lucide-react";
import { useCart } from "@/frontend/context/CartContext";
import NusaMascot from "./NusaMascot";

interface ChatProduct {
  id: number;
  nama_produk: string;
  harga: number;
  stok: number;
  kategori: string;
  asal_daerah: string;
  nama_toko: string;
  foto: string;
}

interface ChatIntent {
  reply: string;
  products?: ChatProduct[];
  action?: { label: string; href: string };
  suggestions?: string[];
}

interface ChatMessage {
  role: "user" | "bot";
  text: string;
  products?: ChatProduct[];
  action?: { label: string; href: string };
  suggestions?: string[];
  time: string;
}

function now(): string {
  return new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

const INITIAL_SUGGESTIONS = [
  "Rekomendasi Tenun & Batik",
  "Kopi Robusta Nusantara",
  "Cara Belanja & Bayar",
  "Cara Buka Toko Pengrajin",
];

export default function ChatWidget() {
  const router = useRouter();
  const { addToCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "bot",
      text: "Halo! Saya Nusa, asisten virtual PasarNusa. Ada karya kriya, wastra tradisional, atau oleh-oleh Nusantara yang ingin kamu cari hari ini?",
      suggestions: INITIAL_SUGGESTIONS,
      time: now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [addedId, setAddedId] = useState<number | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const fabRef = useRef<HTMLButtonElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    if (!isOpen) return;
    const el = scrollRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [messages, loading, isOpen]);

  // Escape to close & click outside handling
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        fabRef.current?.focus();
      }
    };
    const onClick = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        fabRef.current &&
        !fabRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onClick);
    };
  }, [isOpen]);

  const send = async (raw: string) => {
    const text = raw.trim();
    if (!text || loading) return;

    setMessages((prev) => [...prev, { role: "user", text, time: now() }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data: ChatIntent & { error?: string } = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal memproses pesan.");
      }
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: data.reply,
          products: data.products,
          action: data.action,
          suggestions: data.suggestions,
          time: now(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "Maaf, koneksi ke asisten sedang terganggu. Coba kirim ulang pesanmu ya.",
          time: now(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (p: ChatProduct) => {
    const res = addToCart(
      {
        id: p.id,
        nama_produk: p.nama_produk,
        harga: p.harga,
        foto_produk: p.foto,
        kategori: p.kategori,
        asal_daerah: p.asal_daerah,
        stok: p.stok,
      },
      1
    );
    if (res.success) {
      setAddedId(p.id);
      setTimeout(() => setAddedId(null), 2500);
    }
  };

  const resetChat = () => {
    setMessages([
      {
        role: "bot",
        text: "Percakapan baru telah dimulai. Ada karya kriya atau informasi belanja yang bisa saya bantu?",
        suggestions: INITIAL_SUGGESTIONS,
        time: now(),
      },
    ]);
  };

  return (
    <div className="fixed bottom-[calc(68px+env(safe-area-inset-bottom)+12px)] right-4 z-50 md:bottom-6 md:right-6">
      {isOpen && (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="false"
          aria-label="Chat dengan Nusa, Virtual Assistant PasarNusa"
          className="absolute bottom-[calc(100%+12px)] right-0 w-[min(94vw,380px)] rounded-3xl border border-[#DFD7CA] dark:border-[#2C241E] bg-[#FAF8F5] dark:bg-[#181310] shadow-2xl overflow-hidden animate-scale-in flex flex-col"
          style={{ maxHeight: "calc(100vh - 120px)" }}
        >
          {/* Header (Layout like Lena reference, themed with PasarNusa Deep Espresso & Terracotta) */}
          <div className="relative flex items-center justify-between px-4 py-3 bg-[#1A1008] dark:bg-[#0D0A08] border-b border-[#2A1D13] dark:border-[#1E1611] select-none">
            {/* Subtle warm terracotta aura accent */}
            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-[#C94B1A]/15 blur-xl pointer-events-none" />

            {/* Left: Title & Status */}
            <div className="flex-1 min-w-0 pr-2 z-10">
              <h3 className="text-sm font-bold text-[#F5EFEB] tracking-tight">
                Nusa Virtual Assistant
              </h3>
              <p className="text-[11px] text-[#B8ADA2] font-medium flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-[#246E4A] inline-block" />
                Asisten Belanja PasarNusa • Siap Membantu
              </p>
            </div>

            {/* Right: Mascot Avatar Peeking out from Header (Inspired by reference position) */}
            <div className="flex items-center gap-1 z-10">
              <div className="cursor-pointer transition-transform hover:scale-105 active:scale-95" title="Nusa - Asisten Virtual PasarNusa">
                <NusaMascot size={46} animated={false} />
              </div>

              {/* Reset Conversation Button */}
              <button
                type="button"
                onClick={resetChat}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[#B8ADA2] hover:text-[#F5EFEB] hover:bg-white/10 transition-colors ml-1"
                aria-label="Mulai percakapan baru"
                title="Mulai percakapan baru"
              >
                <RotateCcw className="h-4 w-4" />
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  fabRef.current?.focus();
                }}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[#B8ADA2] hover:text-[#F5EFEB] hover:bg-white/10 transition-colors"
                aria-label="Tutup jendela chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div
            ref={scrollRef}
            className="flex-1 min-h-[300px] max-h-[380px] overflow-y-auto px-4 py-4 space-y-3.5 overscroll-contain bg-[#FAF8F5] dark:bg-[#181310]"
            aria-live="polite"
            aria-label="Percakapan"
          >
            {messages.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                <div className="flex items-end gap-2 max-w-[90%]">
                  {msg.role === "bot" && (
                    <div className="flex-shrink-0 mb-1">
                      <NusaMascot size={28} animated={false} />
                    </div>
                  )}

                  <div
                    className={`rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                      msg.role === "user"
                        ? "bg-[#C94B1A] text-white rounded-br-sm shadow-sm"
                        : "bg-white dark:bg-[#231B16] text-[#1A1008] dark:text-[#F5EFEB] border border-[#DFD7CA] dark:border-[#2C241E] rounded-bl-sm shadow-xs"
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>
                  </div>
                </div>

                {/* Interactive Product Recommendation Cards */}
                {msg.products && msg.products.length > 0 && (
                  <div className="mt-2.5 w-full pl-8 space-y-2">
                    {msg.products.map((p) => (
                      <div
                        key={p.id}
                        className="flex gap-2.5 rounded-xl border border-[#DFD7CA] dark:border-[#2C241E] bg-white dark:bg-[#231B16] p-2.5 shadow-xs hover:border-[#C94B1A] transition-colors"
                      >
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={() => router.push(`/?search=${encodeURIComponent(p.nama_produk)}#katalog`)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              router.push(`/?search=${encodeURIComponent(p.nama_produk)}#katalog`);
                            }
                          }}
                          className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 border border-[#DFD7CA] dark:border-[#2C241E] cursor-pointer"
                        >
                          <img
                            src={p.foto}
                            alt={p.nama_produk}
                            className="w-full h-full object-cover transition-transform hover:scale-105"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = "/pasar.jpg";
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-[#1A1008] dark:text-[#F5EFEB] truncate">
                            {p.nama_produk}
                          </p>
                          <p className="text-[10px] text-[#6E6254] dark:text-[#B8ADA2] truncate">
                            {p.asal_daerah} · {p.nama_toko}
                          </p>
                          <div className="mt-1 flex items-center justify-between gap-2">
                            <span className="text-xs font-black text-[#C94B1A]">
                              Rp {p.harga.toLocaleString("id-ID")}
                            </span>
                            {p.stok > 0 ? (
                              <button
                                type="button"
                                onClick={() => handleAddToCart(p)}
                                className={`min-h-[28px] px-2.5 rounded-lg text-[10px] font-bold transition-all ${
                                  addedId === p.id
                                    ? "bg-[#246E4A] text-white"
                                    : "bg-[#FDF4EF] dark:bg-[#2A1B14] text-[#C94B1A] hover:bg-[#C94B1A] hover:text-white"
                                }`}
                                aria-label={`Tambah ${p.nama_produk} ke keranjang`}
                              >
                                {addedId === p.id ? "✓ Masuk Keranjang" : "+ Keranjang"}
                              </button>
                            ) : (
                              <span className="text-[10px] font-bold text-[#A82A2A]">Stok Habis</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Action button if provided */}
                {msg.action && (
                  <div className="mt-2 pl-8">
                    <button
                      type="button"
                      onClick={() => router.push(msg.action!.href)}
                      className="inline-flex items-center min-h-[32px] px-3.5 rounded-full bg-[#C94B1A] hover:bg-[#B33F14] text-white text-[11px] font-bold shadow-xs transition-colors"
                    >
                      {msg.action.label}
                    </button>
                  </div>
                )}

                {/* Suggestions Pills */}
                {msg.suggestions && msg.suggestions.length > 0 && i === messages.length - 1 && (
                  <div className="mt-2.5 pl-8 flex flex-wrap gap-1.5">
                    {msg.suggestions.map((sug, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => send(sug)}
                        className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-white dark:bg-[#231B16] border border-[#DFD7CA] dark:border-[#2C241E] text-[#6E6254] dark:text-[#B8ADA2] hover:border-[#C94B1A] hover:text-[#C94B1A] transition-colors"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                )}

                <span className="mt-1 text-[9px] text-[#8C7E72] dark:text-[#6E6254] pl-9">{msg.time}</span>
              </div>
            ))}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex items-end gap-2">
                <div className="flex-shrink-0 mb-1">
                  <NusaMascot size={28} animated={false} />
                </div>
                <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm bg-white dark:bg-[#231B16] border border-[#DFD7CA] dark:border-[#2C241E] px-3.5 py-2.5 shadow-xs">
                  <Loader2 className="h-3.5 w-3.5 text-[#C94B1A] animate-spin" />
                  <span className="text-xs text-[#6E6254] dark:text-[#B8ADA2]">
                    Nusa sedang mencari karya...
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 border-t border-[#DFD7CA] dark:border-[#2C241E] p-3 bg-white dark:bg-[#1C1613]"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tulis karya yang dicari atau tanya cara beli..."
              maxLength={500}
              className="flex-1 h-10 rounded-xl bg-[#F7F3EC] dark:bg-[#231B16] border border-[#DFD7CA] dark:border-[#2C241E] px-3 text-xs text-[#1A1008] dark:text-[#F5EFEB] placeholder-[#8C7E72] focus:border-[#C94B1A] focus:outline-none transition-colors"
              aria-label="Tulis pertanyaan untuk Nusa"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#C94B1A] text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#B33F14] active:scale-95 shadow-xs"
              aria-label="Kirim pesan"
            >
              <SendHorizontal className="h-4 w-4" fill="currentColor" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Launcher Button (PasarNusa Deep Terracotta Theme) */}
      <button
        ref={fabRef}
        type="button"
        onClick={() => {
          setIsOpen((prev) => !prev);
          if (!isOpen) setTimeout(() => inputRef.current?.focus(), 150);
        }}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={isOpen ? "Tutup chat dengan Nusa" : "Buka chat dengan Nusa, Virtual Assistant PasarNusa"}
        className="group relative flex items-center gap-2.5 h-14 pl-2 pr-4 rounded-full bg-[#C94B1A] hover:bg-[#B33F14] text-white shadow-xl transition-all duration-200 active:scale-95 border border-[#E06D43]"
      >
        {isOpen ? (
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20">
            <X className="h-5 w-5 text-white" />
          </div>
        ) : (
          <>
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <NusaMascot size={34} animated={false} />
              </div>
              {/* Online indicator */}
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#246E4A] border-2 border-[#C94B1A]" />
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-black text-white leading-none flex items-center gap-1">
                Tanya Nusa
                <Sparkles className="w-3 h-3 text-[#FCD34D]" />
              </p>
              <p className="text-[10px] text-white/80 font-medium leading-tight mt-0.5">
                Virtual Assistant
              </p>
            </div>
          </>
        )}
      </button>
    </div>
  );
}
