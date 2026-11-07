"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export interface CartItem {
  id: number;
  nama_produk: string;
  harga: number;
  foto_produk: string;
  kategori: string;
  asal_daerah?: string;
  qty: number;
  stok_tersedia: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: {
    id: number;
    nama_produk: string;
    harga: number;
    foto_produk: string;
    kategori: string;
    asal_daerah?: string;
    stok: number;
  }, qty?: number) => { success: boolean; message: string };
  updateQty: (id: number, qty: number) => { success: boolean; message: string };
  removeFromCart: (id: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  totalAmount: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

const CartContext = createContext<CartContextType>({
  items: [],
  addToCart: () => ({ success: false, message: "" }),
  updateQty: () => ({ success: false, message: "" }),
  removeFromCart: () => {},
  clearCart: () => {},
  totalItems: 0,
  subtotal: 0,
  totalAmount: 0,
  isCartOpen: false,
  openCart: () => {},
  closeCart: () => {},
  toggleCart: () => {},
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen((prev) => !prev);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("pasarnusa_cart");
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch {
      // Ignore JSON error
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem("pasarnusa_cart", JSON.stringify(items));
    }
  }, [items, loaded]);

  const addToCart = (product: {
    id: number;
    nama_produk: string;
    harga: number;
    foto_produk: string;
    kategori: string;
    asal_daerah?: string;
    stok: number;
  }, qty = 1) => {
    if (product.stok <= 0) {
      return { success: false, message: "Maaf, stok produk ini sedang habis." };
    }

    const existing = items.find((i) => i.id === product.id);
    const currentQty = existing ? existing.qty : 0;
    const targetQty = currentQty + qty;

    if (targetQty > product.stok) {
      return {
        success: false,
        message: `Stok hanya tersedia ${product.stok} unit. Kamu sudah memilih ${currentQty} unit.`,
      };
    }

    if (existing) {
      setItems((prev) =>
        prev.map((i) =>
          i.id === product.id
            ? { ...i, qty: targetQty, stok_tersedia: product.stok }
            : i
        )
      );
    } else {
      setItems((prev) => [
        ...prev,
        {
          id: product.id,
          nama_produk: product.nama_produk,
          harga: product.harga,
          foto_produk: product.foto_produk,
          kategori: product.kategori,
          asal_daerah: product.asal_daerah,
          qty,
          stok_tersedia: product.stok,
        },
      ]);
    }

    return { success: true, message: "Produk berhasil ditambahkan ke keranjang belanja." };
  };

  const updateQty = (id: number, qty: number) => {
    if (qty <= 0) {
      removeFromCart(id);
      return { success: true, message: "Produk dihapus dari keranjang." };
    }

    const item = items.find((i) => i.id === id);
    if (!item) return { success: false, message: "Produk tidak ada di keranjang." };

    if (qty > item.stok_tersedia) {
      return {
        success: false,
        message: `Stok produk hanya tersisa ${item.stok_tersedia} unit.`,
      };
    }

    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, qty } : i))
    );
    return { success: true, message: "Jumlah berhasil diperbarui." };
  };

  const removeFromCart = (id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((acc, i) => acc + i.qty, 0);
  const subtotal = items.reduce((acc, i) => acc + i.harga * i.qty, 0);
  const totalAmount = subtotal;

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQty,
        removeFromCart,
        clearCart,
        totalItems,
        subtotal,
        totalAmount,
        isCartOpen,
        openCart,
        closeCart,
        toggleCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
