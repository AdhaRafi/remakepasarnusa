"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/frontend/context/CartContext";
import { resolveProductImage } from "@/shared/media";
import { X, ShoppingBag, Plus, Minus, Trash2 } from "lucide-react";

export default function CartDrawer() {
  const router = useRouter();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const wasOpenRef = useRef(false);
  const {
    items,
    isCartOpen,
    closeCart,
    updateQty,
    removeFromCart,
    totalItems,
    subtotal,
  } = useCart();

  useEffect(() => {
    if (!isCartOpen) {
      if (wasOpenRef.current) previousFocusRef.current?.focus();
      wasOpenRef.current = false;
      return;
    }
    wasOpenRef.current = true;
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCartOpen, closeCart]);

  // Prevent body scrolling when drawer is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Keranjang Belanja"
      className="fixed inset-0 z-50 overflow-hidden"
    >
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className="fixed inset-0 bg-[#1A1008]/60 transition-opacity duration-300"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-[#DFD7CA] flex flex-col">
          
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-[#DFD7CA] flex items-center justify-between bg-[#F7F3EC]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-[#C94B1A]/10 text-[#C94B1A] rounded-xl">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif text-lg font-bold text-[#1A1008]">
                  Keranjang Belanja
                </h2>
                <p className="text-xs text-[#6E6254]">
                  {totalItems} produk
                </p>
              </div>
            </div>

            <button
              ref={closeButtonRef}
              type="button"
              onClick={closeCart}
              className="min-h-[44px] min-w-[44px] p-2 text-[#6E6254] hover:text-[#1A1008] hover:bg-[#EFE8DC] rounded-xl transition flex items-center justify-center"
              aria-label="Tutup keranjang"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-[#FAF5EB] text-[#8A5912] flex items-center justify-center">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif text-lg font-bold text-[#1A1008]">
                    Keranjang Masih Kosong
                  </h3>
                  <p className="text-xs text-[#6E6254] leading-relaxed max-w-xs">
                    Pilih produk dari katalog untuk menambahkannya ke keranjang.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    closeCart();
                    router.push("/#katalog");
                  }}
                  className="min-h-[44px] px-6 py-2.5 bg-[#C94B1A] hover:bg-[#B33F14] text-white text-xs font-bold rounded-xl transition"
                >
                  Mulai Pilih Karya
                </button>
              </div>
            ) : (
              <div className="divide-y divide-[#DFD7CA]/60">
                {items.map((item) => (
                  <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex gap-3.5">
                    {/* Thumbnail */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-[#EFE8DC] overflow-hidden flex-shrink-0 border border-[#DFD7CA]">
                      <img
                        src={resolveProductImage(item.foto_produk)}
                        alt={item.nama_produk}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = "/pasar.jpg";
                        }}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-[10px] font-bold text-[#8A5912] block">
                            {item.kategori}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            className="flex min-h-11 min-w-11 items-center justify-center text-[#493D31] transition-colors hover:text-[#A82A2A]"
                            title="Hapus dari keranjang"
                            aria-label={`Hapus ${item.nama_produk}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <h4 className="text-xs sm:text-sm font-bold text-[#1A1008] truncate">
                          {item.nama_produk}
                        </h4>
                        
                        <p className="text-xs font-semibold text-[#C94B1A] mt-0.5">
                          Rp {item.harga.toLocaleString("id-ID")}
                        </p>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center border border-[#DFD7CA] rounded-lg overflow-hidden bg-[#F7F3EC]">
                          <button
                            type="button"
                            onClick={() => updateQty(item.id, item.qty - 1)}
                            className="flex min-h-11 min-w-11 items-center justify-center text-[#1A1008] transition-colors hover:bg-[#DFD7CA]"
                            aria-label="Kurang satu"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2.5 text-xs font-bold text-[#1A1008]">
                            {item.qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQty(item.id, item.qty + 1)}
                            className="flex min-h-11 min-w-11 items-center justify-center text-[#1A1008] transition-colors hover:bg-[#DFD7CA]"
                            aria-label="Tambah satu"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="text-xs font-black text-[#1A1008]">
                          Rp {(item.harga * item.qty).toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-5 sm:p-6 border-t border-[#DFD7CA] bg-[#FAF5EB] space-y-4">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-[#6E6254]">
                  <span>Subtotal Produk ({totalItems} barang):</span>
                  <span className="font-extrabold text-[#1A1008] text-sm">
                    Rp {subtotal.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    closeCart();
                    router.push("/keranjang");
                  }}
                  className="flex min-h-12 w-full items-center justify-center rounded-xl bg-[#C94B1A] hover:bg-[#B33F14] px-4 py-3 text-sm font-bold text-white hover:shadow-md transition-all active:scale-[0.98]"
                >
                  Lanjut ke Pembayaran
                </button>

                <Link
                  href="/keranjang"
                  onClick={closeCart}
                  className="w-full min-h-[40px] px-4 py-2 text-center text-xs font-bold text-[#1A1008] hover:bg-[#EFE8DC] rounded-xl transition flex items-center justify-center"
                >
                  Buka Halaman Keranjang Penuh
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
