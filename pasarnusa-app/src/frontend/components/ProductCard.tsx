"use client";

import React, { useState } from "react";
import { Product } from "@/shared/db";
import { resolveProductImage } from "@/shared/media";
import { useCart } from "@/frontend/context/CartContext";
import { useWishlist } from "@/frontend/context/WishlistContext";
import { useToast } from "@/frontend/components/Toast";
import { MapPin, ShoppingBag, Eye, Check, Heart, Store } from "lucide-react";

interface ProductCardProps {
  product: Product;
  onViewDetail: (product: Product) => void;
}

export default function ProductCard({ product, onViewDetail }: ProductCardProps) {
  const { addToCart, openCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { showToast } = useToast();
  const [added, setAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    const res = addToCart({
      id: product.id,
      nama_produk: product.nama_produk,
      harga: product.harga,
      foto_produk: product.foto_produk,
      kategori: product.kategori,
      asal_daerah: product.asal_daerah,
      stok: product.stok,
    });

    if (res.success) {
      setAdded(true);
      showToast({
        type: "success",
        title: "Ditambahkan ke Keranjang",
        message: `${product.nama_produk} berhasil masuk ke daftar belanja Anda.`,
        action: {
          label: "Buka Keranjang",
          onClick: () => openCart(),
        },
      });
      setTimeout(() => setAdded(false), 2000);
    } else {
      showToast({
        type: "error",
        title: "Tidak Dapat Menambahkan",
        message: res.message,
      });
    }
  };

  const isOutOfStock = product.stok <= 0;
  const isLowStock = product.stok > 0 && product.stok <= 5;
  const wish = isWishlisted(product.id);

  return (
    <article
      onClick={() => onViewDetail(product)}
      className="group relative flex flex-col bg-white dark:bg-[#181310] rounded-xl border border-[#E7DFD4] dark:border-[#2C211A] overflow-hidden transition-colors hover:border-[#C94B1A] cursor-pointer"
    >
      {/* 3:4 Portrait Image Container (Artisan Editorial Luxury Ratio) */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#F3EEE6] dark:bg-[#201814]">
        {product.foto_produk ? (
          <img
            src={resolveProductImage(product.foto_produk)}
            alt={product.nama_produk}
            className={`h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${
              isOutOfStock ? "grayscale opacity-50" : ""
            }`}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "/pasar.jpg";
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-[#7A6B5C] dark:text-[#A89887]">
            Foto belum tersedia
          </div>
        )}

        {/* Quiet Provenance & Heritage Category Tag */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 items-start">
          <span className="rounded bg-white/95 dark:bg-[#1A1411]/95 px-2.5 py-1 text-[10px] font-semibold text-[#1A110B] dark:text-[#FAF7F2] border border-[#E7DFD4]/80 dark:border-[#382B22]">
            {product.kategori}
          </span>
        </div>

        {/* Wishlist Heart Action */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist({ id: product.id, nama_produk: product.nama_produk });
          }}
          className={`absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200 active:scale-90 border ${
            wish
              ? "bg-[#C94B1A] text-white border-[#C94B1A]"
              : "bg-white/90 dark:bg-[#1A1411]/90 text-[#6B5E52] dark:text-[#B8ADA2] hover:text-[#C94B1A] hover:bg-white border-[#E7DFD4]/80 dark:border-[#382B22]"
          }`}
          title={wish ? "Hapus dari Favorit" : "Simpan ke Favorit"}
          aria-label={wish ? "Hapus dari Favorit" : "Simpan ke Favorit"}
        >
          <Heart className={`w-4 h-4 transition-transform duration-200 ${wish ? "fill-current scale-110" : ""}`} />
        </button>

        {/* Subtle Dark Gradient at bottom of image for contrast */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 via-black/15 to-transparent pointer-events-none" />

        {/* Origin Stamp over photo footer */}
        <div className="absolute bottom-2.5 left-3 right-3 z-10 flex items-center justify-between text-[11px] text-white/95 pointer-events-none">
          <div className="flex items-center gap-1 font-medium truncate drop-shadow-sm">
            <MapPin className="w-3.5 h-3.5 text-[#FFA07A] flex-shrink-0" />
            <span className="truncate">{product.asal_daerah || "Nusantara"}</span>
          </div>
          {product.nama_toko && (
            <div className="flex items-center gap-1 text-[10px] text-white/80 font-medium truncate max-w-[110px] drop-shadow-sm">
              <Store className="w-3 h-3 text-[#E2BA73] flex-shrink-0" />
              <span className="truncate">{product.nama_toko}</span>
            </div>
          )}
        </div>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[#1A110B]/65">
            <span className="rounded-md bg-white dark:bg-[#251D18] px-3.5 py-1 text-xs font-bold text-[#A82A2A] dark:text-[#FF8080] border border-[#E7DFD4]/60">
              Stok Habis
            </span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
        <div className="space-y-1.5">
          {/* Product Title */}
          <h3 className="font-serif text-base sm:text-lg font-bold text-[#1A110B] dark:text-[#FAF7F2] group-hover:text-[#C94B1A] transition-colors line-clamp-2 leading-snug">
            {product.nama_produk}
          </h3>

          {/* Product Description */}
          <p className="text-xs text-[#6B5E52] dark:text-[#A89887] line-clamp-2 leading-relaxed">
            {product.deskripsi}
          </p>
        </div>

        {/* Card Footer: Price & Actions */}
        <div className="mt-4 pt-3.5 border-t border-[#EAE3D8] dark:border-[#2C211A] space-y-3">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-[11px] font-medium text-[#8C7E72] dark:text-[#9C9084] block leading-none mb-1">
                Harga Pengrajin
              </span>
              <span className="font-serif text-lg sm:text-xl font-bold text-[#1A110B] dark:text-[#FAF7F2] tracking-tight">
                Rp {product.harga.toLocaleString("id-ID")}
              </span>
            </div>
            
            <div>
              <span
                className={`text-[11px] font-semibold ${
                  isOutOfStock ? "text-[#A82A2A] dark:text-[#FF8080]" : isLowStock ? "text-[#8A5912] dark:text-[#E09F3E]" : "text-[#246E4A] dark:text-[#4ADE80]"
                }`}
              >
                {isOutOfStock ? "Stok Habis" : isLowStock ? `Sisa ${product.stok} karya` : `${product.stok} siap kirim`}
              </span>
            </div>
          </div>

          {/* Action Row */}
          <div className="grid grid-cols-[1fr_auto] gap-2 pt-1">
            <button
              type="button"
              disabled={isOutOfStock}
              onClick={handleAddToCart}
              className={`min-h-11 w-full rounded-lg flex items-center justify-center gap-2 px-3 text-xs font-bold transition-all duration-200 active:scale-[0.98] ${
                isOutOfStock
                  ? "bg-[#EAE3D8] dark:bg-[#251D18] text-[#8C7E72] dark:text-[#6E6155] cursor-not-allowed"
                  : added
                  ? "bg-[#246E4A] text-white"
                  : "bg-[#C94B1A] hover:bg-[#B33F14] text-white"
              }`}
            >
              {added ? (
                <>
                  <Check className="w-4 h-4" />
                  Masuk Keranjang
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  + Keranjang
                </>
              )}
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetail(product);
              }}
              className="min-h-11 min-w-11 px-3 rounded-lg flex items-center justify-center bg-[#F7F4EE] dark:bg-[#221A15] text-[#1A110B] dark:text-[#FAF7F2] hover:bg-[#EAE3D8] dark:hover:bg-[#2E231C] border border-[#E7DFD4] dark:border-[#332720] transition-colors"
              title="Lihat Detail Produk"
              aria-label="Lihat Detail Produk"
            >
              <Eye className="w-4 h-4 text-[#6B5E52] dark:text-[#B8ADA2]" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
