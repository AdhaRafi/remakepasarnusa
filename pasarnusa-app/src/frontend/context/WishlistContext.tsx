"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/frontend/components/Toast";

interface WishlistContextType {
  wishlist: number[];
  isWishlisted: (id: number) => boolean;
  toggleWishlist: (product: { id: number; nama_produk: string }) => boolean;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const WISHLIST_STORAGE_KEY = "pasarnusa_wishlist";

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [mounted, setMounted] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    try {
      const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (stored) {
        setWishlist(JSON.parse(stored));
      }
    } catch {
      // Ignore storage errors
    }
    setMounted(true);
  }, []);

  const saveWishlist = (items: number[]) => {
    setWishlist(items);
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore storage errors
    }
  };

  const isWishlisted = (id: number) => {
    return wishlist.includes(id);
  };

  const toggleWishlist = (product: { id: number; nama_produk: string }) => {
    const exists = wishlist.includes(product.id);
    let updated: number[];
    if (exists) {
      updated = wishlist.filter((item) => item !== product.id);
      saveWishlist(updated);
      showToast({
        type: "info",
        title: "Dihapus dari Favorit",
        message: `${product.nama_produk} telah dihapus dari daftar karya favorit Anda.`,
      });
      return false;
    } else {
      updated = [...wishlist, product.id];
      saveWishlist(updated);
      showToast({
        type: "success",
        title: "Disimpan ke Favorit",
        message: `${product.nama_produk} berhasil ditambahkan ke daftar karya favorit Anda.`,
      });
      return true;
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist: mounted ? wishlist : [],
        isWishlisted,
        toggleWishlist,
        wishlistCount: mounted ? wishlist.length : 0,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
