"use client";

import React, { useState, useEffect, useRef } from "react";
import { Product } from "@/lib/db";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useToast } from "@/components/Toast";
import { X, MapPin, Store, ShoppingBag, Plus, Minus, Check, Heart } from "lucide-react";

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export default function ProductDetailModal({ product, onClose }: ProductDetailModalProps) {
  const { addToCart, openCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { showToast } = useToast();

  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<"deskripsi" | "pengrajin" | "pengiriman">("deskripsi");
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (!product) {
      if (wasOpenRef.current) previousFocusRef.current?.focus();
      wasOpenRef.current = false;
      return;
    }
    wasOpenRef.current = true;
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    setQty(1);
    setAdded(false);
    setActiveTab("deskripsi");
    requestAnimationFrame(() => closeButtonRef.current?.focus());
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [product, onClose]);

  if (!product) return null;

  const isOutOfStock = product.stok <= 0;

  const handleAdd = () => {
    const res = addToCart({
      id: product.id,
      nama_produk: product.nama_produk,
      harga: product.harga,
      foto_produk: product.foto_produk,
      kategori: product.kategori,
      asal_daerah: product.asal_daerah,
      stok: product.stok,
    }, qty);

    if (res.success) {
      setAdded(true);
      showToast({
        type: "success",
        title: "Karya Ditambahkan",
        message: `${qty}x ${product.nama_produk} berhasil masuk ke keranjang.`,
        action: {
          label: "Buka Keranjang",
          onClick: () => {
            onClose();
            openCart();
          },
        },
      });
      setTimeout(() => {
        setAdded(false);
        onClose();
      }, 1000);
    } else {
      showToast({
        type: "error",
        title: "Gagal Menambahkan",
        message: res.message,
      });
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1008]/70 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto border border-[#DFD7CA] shadow-2xl relative"
      >
        {/* Header Action Buttons: Wishlist & Close */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          <button
            type="button"
            onClick={() => toggleWishlist({ id: product.id, nama_produk: product.nama_produk })}
            className={`p-2.5 rounded-full border shadow-sm transition ${
              isWishlisted(product.id)
                ? "bg-[#C94B1A] text-white border-[#C94B1A]"
                : "bg-white/95 hover:bg-white text-[#1A1008] border-[#DFD7CA]"
            }`}
            title={isWishlisted(product.id) ? "Hapus dari Favorit" : "Simpan ke Favorit"}
            aria-label={isWishlisted(product.id) ? "Hapus dari Favorit" : "Simpan ke Favorit"}
          >
            <Heart className={`w-4 h-4 ${isWishlisted(product.id) ? "fill-current" : ""}`} />
          </button>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="flex min-h-11 min-w-11 items-center justify-center bg-white text-[#1A1008] transition-colors hover:bg-[#EFE8DC]"
            aria-label="Tutup Rincian"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 sm:p-8">
          {/* Image Column */}
          <div className="space-y-3">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#EFE8DC] border border-[#DFD7CA]/60">
              <img
                src={`/uploads/produk/${product.foto_produk}`}
                alt={product.nama_produk}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/pasar.jpg";
                }}
              />
              <span className="absolute top-3 left-3 px-3 py-1 bg-[#1A1008]/85 text-[#EDE6D9] text-xs font-semibold tracking-wider uppercase rounded-full">
                {product.kategori}
              </span>
            </div>

          </div>

          {/* Details Column */}
          <div className="flex flex-col justify-between space-y-4">
            <div>
              {/* Origin & Seller */}
              <div className="space-y-1 mb-2">
                <div className="flex items-center gap-1.5 text-xs text-[#8A5912] font-bold">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{product.asal_daerah || "Nusantara"}</span>
                </div>
                {product.nama_toko && (
                  <div className="flex items-center gap-1.5 text-xs text-[#6E6254]">
                    <Store className="w-3.5 h-3.5" />
                    <span>Dibuat oleh: <strong className="text-[#1A1008]">{product.nama_toko}</strong></span>
                  </div>
                )}
              </div>

              {/* Title */}
              <h2 id="modal-title" className="font-serif text-xl sm:text-2xl font-bold text-[#1A1008] leading-tight">
                {product.nama_produk}
              </h2>

              {/* Price & Stock */}
              <div className="mt-3 flex items-baseline gap-3">
                <span className="text-2xl font-black text-[#C94B1A]">
                  Rp {product.harga.toLocaleString("id-ID")}
                </span>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    isOutOfStock
                      ? "bg-[#FBEAEA] text-[#A82A2A]"
                      : "bg-[#EAF4EE] text-[#246E4A]"
                  }`}
                >
                  {isOutOfStock ? "Stok Habis" : `Tersedia ${product.stok} unit`}
                </span>
              </div>

              {/* Tabs */}
              <div className="mt-4 pt-3 border-t border-[#DFD7CA]">
                <div role="tablist" aria-label="Informasi produk" className="mb-2.5 flex gap-3 border-b border-[#DFD7CA] text-sm font-semibold">
                  <button
                    type="button"
                    role="tab"
                    id="tab-deskripsi"
                    aria-selected={activeTab === "deskripsi"}
                    aria-controls="panel-deskripsi"
                    onClick={() => setActiveTab("deskripsi")}
                    className={`min-h-11 border-b-2 pb-1.5 transition ${
                      activeTab === "deskripsi"
                        ? "border-[#C94B1A] text-[#C94B1A]"
                        : "border-transparent text-[#6E6254] hover:text-[#1A1008]"
                    }`}
                  >
                    Cerita Kriya
                  </button>
                  <button
                    type="button"
                    role="tab"
                    id="tab-asal"
                    aria-selected={activeTab === "pengrajin"}
                    aria-controls="panel-asal"
                    onClick={() => setActiveTab("pengrajin")}
                    className={`min-h-11 border-b-2 pb-1.5 transition ${
                      activeTab === "pengrajin"
                        ? "border-[#C94B1A] text-[#C94B1A]"
                        : "border-transparent text-[#6E6254] hover:text-[#1A1008]"
                    }`}
                  >
                    Sentra Daerah
                  </button>
                  <button
                    type="button"
                    role="tab"
                    id="tab-pengiriman"
                    aria-selected={activeTab === "pengiriman"}
                    aria-controls="panel-pengiriman"
                    onClick={() => setActiveTab("pengiriman")}
                    className={`min-h-11 border-b-2 pb-1.5 transition ${
                      activeTab === "pengiriman"
                        ? "border-[#C94B1A] text-[#C94B1A]"
                        : "border-transparent text-[#6E6254] hover:text-[#1A1008]"
                    }`}
                  >
                    Pengiriman
                  </button>
                </div>

                {activeTab === "deskripsi" && (
                  <p role="tabpanel" id="panel-deskripsi" aria-labelledby="tab-deskripsi" className="max-h-36 overflow-y-auto pr-1 text-base leading-relaxed text-[#33271D]">
                    {product.deskripsi}
                  </p>
                )}

                {activeTab === "pengrajin" && (
                  <div role="tabpanel" id="panel-asal" aria-labelledby="tab-asal" className="max-h-36 space-y-1.5 overflow-y-auto text-base text-[#33271D]">
                    <p>Asal produk</p>
                    <p className="font-semibold">{product.asal_daerah || "Belum dicantumkan"}</p>
                    {product.nama_toko && <p className="text-[#493D31]">Toko: {product.nama_toko}</p>}
                  </div>
                )}

                {activeTab === "pengiriman" && (
                  <div role="tabpanel" id="panel-pengiriman" aria-labelledby="tab-pengiriman" className="max-h-36 overflow-y-auto text-base leading-relaxed text-[#33271D]">
                    Biaya dan pilihan pengiriman ditampilkan saat checkout.
                  </div>
                )}
              </div>
            </div>

            {/* Quantity Selector & Action */}
            <div className="pt-4 border-t border-[#DFD7CA] space-y-3">
              {!isOutOfStock && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1A1008]">Jumlah Pesanan:</span>
                  <div className="flex items-center border border-[#DFD7CA] rounded-xl overflow-hidden bg-[#F7F3EC]">
                    <button
                      type="button"
                      disabled={qty <= 1}
                      onClick={() => setQty((prev) => Math.max(1, prev - 1))}
                      className="p-2.5 text-[#1A1008] hover:bg-[#EFE8DC] disabled:opacity-30 transition min-w-[44px] min-h-[44px] flex items-center justify-center"
                      aria-label="Kurang satu"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-4 text-xs font-bold text-[#1A1008]">{qty}</span>
                    <button
                      type="button"
                      disabled={qty >= product.stok}
                      onClick={() => setQty((prev) => Math.min(product.stok, prev + 1))}
                      className="p-2.5 text-[#1A1008] hover:bg-[#EFE8DC] disabled:opacity-30 transition min-w-[44px] min-h-[44px] flex items-center justify-center"
                      aria-label="Tambah satu"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              <button
                type="button"
                disabled={isOutOfStock}
                onClick={handleAdd}
                className={`w-full min-h-[48px] flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider rounded-xl transition ${
                  isOutOfStock
                    ? "bg-[#DFD7CA] text-[#6E6254] cursor-not-allowed"
                    : added
                    ? "bg-[#246E4A] text-white"
                    : "bg-[#C94B1A] hover:bg-[#B33F14] text-white shadow-md"
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" />
                    Karya Masuk Keranjang!
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    {isOutOfStock ? "Stok Belum Tersedia" : `Tambahkan ke Keranjang (Rp ${(product.harga * qty).toLocaleString("id-ID")})`}
                  </>
                )}
              </button>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
