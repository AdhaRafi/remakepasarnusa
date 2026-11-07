"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Minus, MoreVertical, Send, RotateCcw, Sparkles } from "lucide-react";
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
  timestamp: string;
}

function formatTimestamp(d = new Date()): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  const seconds = pad(d.getSeconds());
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
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
  const [showMenu, setShowMenu] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "bot",
      text: "Halo! Saya Nusa ChatBot, asisten resmi PasarNusa. Ada karya kriya, wastra tradisional, atau informasi belanja yang bisa saya bantu?",
      suggestions: INITIAL_SUGGESTIONS,
      timestamp: formatTimestamp(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [addedId, setAddedId] = useState<number | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLButtonElement>(null);

  // Auto-scroll when messages change or loading
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
        barRef.current?.focus();
      }
    };
    const onClick = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        barRef.current &&
        !barRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setShowMenu(false);
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

    setMessages((prev) => [...prev, { role: "user", text, timestamp: formatTimestamp() }]);
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
          timestamp: formatTimestamp(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "Maaf, koneksi ke asisten sedang terganggu. Coba kirim ulang pesanmu ya.",
          timestamp: formatTimestamp(),
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
        timestamp: formatTimestamp(),
      },
    ]);
    setShowMenu(false);
  };

  return (
    <div className="fixed z-50 bottom-0 right-3 sm:right-6 md:right-8 font-sans">
      {/* 1. DOCKED MINIMIZED BAR (Screenshot 1: Nempel di dasar layar dengan maskot mengintip) */}
      {!isOpen && (
        <button
          ref={barRef}
          type="button"
          onClick={() => {
            setIsOpen(true);
            setTimeout(() => inputRef.current?.focus(), 150);
          }}
          aria-expanded={false}
          aria-haspopup="dialog"
          aria-label="Buka Nusa ChatBot"
          className="group relative flex items-center justify-between gap-3 h-11 pl-4 pr-3 bg-[#C94B1A] dark:bg-[#B33F14] text-white rounded-t-xl rounded-b-none shadow-2xl cursor-pointer hover:bg-[#B33F14] transition-all select-none bottom-0 border-t-2 border-x-2 border-b-0 border-[#E06D43]"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#34D399] inline-block animate-pulse" />
            <span className="text-xs sm:text-sm font-bold tracking-tight">
              Nusa Virtual Assistant
            </span>
          </div>

          <div className="relative -mt-3.5 -mr-1 flex-shrink-0">
            <NusaMascot size={46} animated={false} />
          </div>
        </button>
      )}

      {/* 2. DOCKED EXPANDED CHAT WINDOW (Screenshot 2: Sesuai referensi Lenovo Lena ChatBot) */}
      {isOpen && (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="false"
          aria-label="Nusa ChatBot Window"
          className="w-[min(94vw,370px)] rounded-t-xl rounded-b-none bg-[#140F0C] text-[#F5EFEB] shadow-2xl overflow-hidden flex flex-col bottom-0 border-t-2 border-x-2 border-b-0 border-[#C94B1A]"
          style={{ height: "min(560px, 86vh)" }}
        >
          {/* Header Bar: Clean single-line header with title on left and minus dash on right */}
          <div className="relative flex items-center justify-between px-4 h-12 bg-[#C94B1A] text-white select-none flex-shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FDE68A]" />
              <h3 className="text-sm font-bold tracking-tight">
                Nusa ChatBot
              </h3>
            </div>

            {/* Minus Button on Far Right (exact layout from screenshot 2) */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                barRef.current?.focus();
              }}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white/90 hover:text-white hover:bg-black/15 transition-colors"
              aria-label="Minimalkan ChatBot"
              title="Minimalkan"
            >
              <Minus className="h-5 w-5 stroke-[2.5]" />
            </button>
          </div>

          {/* Messages Area (Screenshot 2: Avatar di kiri, tanggal di atas balon, balon di bawah) */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-3.5 py-4 space-y-4 overscroll-contain bg-[#0D0A08]"
            aria-live="polite"
            aria-label="Percakapan"
          >
            {messages.map((msg, i) => (
              <div key={i} className="flex flex-col">
                {msg.role === "bot" ? (
                  /* Bot Message: Avatar on left, Timestamp above, Bubble below */
                  <div className="flex items-start gap-2.5 max-w-[92%]">
                    {/* Circular Mascot Avatar */}
                    <div className="w-8 h-8 rounded-full bg-[#231B16] border border-[#3A2B22] flex items-center justify-center flex-shrink-0 mt-0.5 overflow-hidden">
                      <NusaMascot size={26} animated={false} />
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Timestamp above bubble (Screenshot 2 format: YYYY-MM-DD HH:mm:ss) */}
                      <span className="text-[10px] text-[#A89D91] font-mono block mb-1">
                        {msg.timestamp}
                      </span>

                      {/* Bot Message Bubble */}
                      <div className="rounded-xl rounded-tl-xs bg-[#241C17] border border-[#382C24] px-3.5 py-2.5 text-xs text-[#F5EFEB] leading-relaxed shadow-xs">
                        <p className="whitespace-pre-line">{msg.text}</p>
                      </div>

                      {/* Interactive Product Cards if any */}
                      {msg.products && msg.products.length > 0 && (
                        <div className="mt-2.5 space-y-2">
                          {msg.products.map((p) => (
                            <div
                              key={p.id}
                              className="flex gap-2.5 rounded-xl border border-[#382C24] bg-[#1A1410] p-2 shadow-xs hover:border-[#C94B1A] transition-colors"
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
                                className="w-13 h-13 rounded-lg overflow-hidden flex-shrink-0 border border-[#382C24] cursor-pointer"
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
                                <p className="text-xs font-bold text-[#F5EFEB] truncate">
                                  {p.nama_produk}
                                </p>
                                <p className="text-[10px] text-[#A89D91] truncate">
                                  {p.asal_daerah} · {p.nama_toko}
                                </p>
                                <div className="mt-1 flex items-center justify-between gap-2">
                                  <span className="text-xs font-black text-[#E06D43]">
                                    Rp {p.harga.toLocaleString("id-ID")}
                                  </span>
                                  {p.stok > 0 ? (
                                    <button
                                      type="button"
                                      onClick={() => handleAddToCart(p)}
                                      className={`min-h-[26px] px-2 rounded-md text-[10px] font-bold transition-all ${
                                        addedId === p.id
                                          ? "bg-[#246E4A] text-white"
                                          : "bg-[#C94B1A] text-white hover:bg-[#B33F14]"
                                      }`}
                                      aria-label={`Tambah ${p.nama_produk} ke keranjang`}
                                    >
                                      {addedId === p.id ? "✓ Masuk" : "+ Keranjang"}
                                    </button>
                                  ) : (
                                    <span className="text-[10px] font-bold text-[#EF4444]">Habis</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Action button */}
                      {msg.action && (
                        <div className="mt-2">
                          <button
                            type="button"
                            onClick={() => router.push(msg.action!.href)}
                            className="inline-flex items-center min-h-[30px] px-3.5 rounded-full bg-[#C94B1A] hover:bg-[#B33F14] text-white text-[11px] font-bold shadow-xs transition-colors"
                          >
                            {msg.action.label}
                          </button>
                        </div>
                      )}

                      {/* Suggestions Pills */}
                      {msg.suggestions && msg.suggestions.length > 0 && i === messages.length - 1 && (
                        <div className="mt-2.5 flex flex-wrap gap-1.5">
                          {msg.suggestions.map((sug, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => send(sug)}
                              className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-[#1A1410] border border-[#382C24] text-[#D5C7B5] hover:border-[#C94B1A] hover:text-[#E06D43] transition-colors"
                            >
                              {sug}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* User Message: Right aligned */
                  <div className="flex flex-col items-end self-end max-w-[85%]">
                    <span className="text-[10px] text-[#A89D91] font-mono mb-1">
                      {msg.timestamp}
                    </span>
                    <div className="rounded-xl rounded-tr-xs bg-[#C94B1A] text-white px-3.5 py-2.5 text-xs leading-relaxed shadow-xs">
                      <p className="whitespace-pre-line">{msg.text}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Loading Indicator (Screenshot 2: Avatar di kiri, timestamp di atas, kotak 3 titik di bawah) */}
            {loading && (
              <div className="flex items-start gap-2.5 max-w-[90%]">
                <div className="w-8 h-8 rounded-full bg-[#231B16] border border-[#3A2B22] flex items-center justify-center flex-shrink-0 mt-0.5 overflow-hidden">
                  <NusaMascot size={26} animated={false} />
                </div>
                <div>
                  <span className="text-[10px] text-[#A89D91] font-mono block mb-1">
                    {formatTimestamp()}
                  </span>
                  {/* The 3 pulsing dots bubble (exact as in screenshot 2) */}
                  <div className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl bg-[#241C17] border border-[#382C24]">
                    <span className="w-2 h-2 rounded-full bg-[#A89D91] animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-[#A89D91] animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 rounded-full bg-[#A89D91] animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Menu Popover (When 3 dots clicked) */}
          {showMenu && (
            <div className="border-t border-[#382C24] bg-[#1A1410] p-2 flex items-center justify-between z-20">
              <span className="text-[11px] text-[#A89D91] pl-2">Mulai ulang obrolan?</span>
              <button
                type="button"
                onClick={resetChat}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C94B1A] text-white text-[11px] font-bold hover:bg-[#B33F14] transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset Chat
              </button>
            </div>
          )}

          {/* Input Bar (Screenshot 2: Tiga titik di kiri, placeholder, batas karakter 0/150, kirim di kanan) */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 px-3 py-2.5 bg-[#1F1814] border-t border-[#382C24] flex-shrink-0"
          >
            {/* Three Vertical Dots Menu Button */}
            <button
              type="button"
              onClick={() => setShowMenu((prev) => !prev)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#A89D91] hover:text-[#F5EFEB] hover:bg-white/5 transition-colors flex-shrink-0"
              aria-label="Menu Opsi Chat"
              title="Menu"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {/* Input Field with 'Ask a question...' / 'Tulis pertanyaan...' placeholder */}
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value.slice(0, 150))}
              placeholder="Ask a question..."
              maxLength={150}
              className="flex-1 h-9 bg-transparent border-none text-xs text-[#F5EFEB] placeholder-[#7E7266] focus:outline-none"
              aria-label="Tulis pertanyaan"
            />

            {/* Character Counter (e.g. 0/150 as in screenshot 2) */}
            <span className="text-[11px] text-[#7E7266] font-mono select-none flex-shrink-0">
              {input.length}/150
            </span>

            {/* Send Paper Plane Icon */}
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#C94B1A] hover:text-[#E06D43] disabled:text-[#52463C] disabled:cursor-not-allowed transition-colors flex-shrink-0"
              aria-label="Kirim pesan"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
