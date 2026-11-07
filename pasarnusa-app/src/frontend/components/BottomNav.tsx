"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Heart, ShoppingBag, User } from "lucide-react";
import { useCart } from "@/frontend/context/CartContext";
import { useWishlist } from "@/frontend/context/WishlistContext";
import { useAuth } from "@/frontend/context/AuthContext";

export default function BottomNav() {
  const pathname = usePathname();
  const [browseState, setBrowseState] = useState({ hash: "", favorite: false });
  useEffect(() => {
    const updateLocation = () => setBrowseState({ hash: window.location.hash, favorite: new URLSearchParams(window.location.search).get("filter") === "favorit" });
    updateLocation();
    window.addEventListener("hashchange", updateLocation);
    window.addEventListener("popstate", updateLocation);
    return () => {
      window.removeEventListener("hashchange", updateLocation);
      window.removeEventListener("popstate", updateLocation);
    };
  }, []);
  const { totalItems, openCart } = useCart();
  const { wishlistCount } = useWishlist();
  const { user } = useAuth();

  const isProfile = pathname === "/profil" || pathname === "/masuk" || pathname === "/daftar";
  const isCatalog = pathname === "/" && browseState.hash === "#katalog";
  const isFavorites = pathname === "/" && browseState.favorite;
  const isHome = pathname === "/" && !isCatalog && !isFavorites;
  const hideNav = ["/admin", "/penjual", "/masuk", "/daftar"].includes(pathname);

  if (hideNav) return null;

  return (
    <>
    <nav
      aria-label="Navigasi Bawah Seluler"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[#CFC4B5] bg-[#F7F3EC] px-2 pt-1.5 pb-[calc(env(safe-area-inset-bottom)+6px)] dark:border-[#2A211B] dark:bg-[#15100D] md:hidden"
    >
      <div className="grid grid-cols-5 items-center max-w-md mx-auto">
        {/* Beranda */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors ${
            isHome ? "text-[#C94B1A]" : "text-[#6E6254] hover:text-[#1A1008] dark:text-[#B8ADA2] dark:hover:text-white"
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-1 tracking-tight">Beranda</span>
        </Link>

        {/* Jelajah Katalog */}
        <Link
          href="/#katalog"
          aria-current={isCatalog ? "page" : undefined}
          className={`flex min-h-11 flex-col items-center justify-center py-1 transition-colors ${isCatalog ? "text-[#A83B14] dark:text-[#E06334]" : "text-[#493D31] hover:text-[#A83B14] dark:text-[#B8ADA2] dark:hover:text-white"}`}
        >
          <Compass className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-1 tracking-tight">Jelajah</span>
        </Link>

        {/* Favorit */}
        <Link
          href="/?filter=favorit#katalog"
          aria-current={isFavorites ? "page" : undefined}
          className={`relative flex min-h-11 flex-col items-center justify-center py-1 transition-colors ${isFavorites ? "text-[#A83B14] dark:text-[#E06334]" : "text-[#493D31] hover:text-[#A83B14] dark:text-[#B8ADA2] dark:hover:text-white"}`}
        >
          <div className="relative">
            <Heart className="w-5 h-5" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-[#8A5912] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {wishlistCount > 9 ? "9+" : wishlistCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold mt-1 tracking-tight">Favorit</span>
        </Link>

        {/* Keranjang Drawer Trigger */}
        <button
          type="button"
          onClick={() => openCart()}
          className="relative flex flex-col items-center justify-center min-h-[48px] py-1 text-[#6E6254] hover:text-[#C94B1A] dark:text-[#B8ADA2] dark:hover:text-white transition-colors"
          aria-label={`Buka Keranjang Belanja, ${totalItems} item`}
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-[#C94B1A] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {totalItems > 9 ? "9+" : totalItems}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold mt-1 tracking-tight">Keranjang</span>
        </button>

        {/* Akun / Masuk */}
        <Link
          href={user ? "/profil" : "/masuk"}
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors ${
            isProfile ? "text-[#C94B1A]" : "text-[#6E6254] hover:text-[#1A1008] dark:text-[#B8ADA2] dark:hover:text-white"
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-1 tracking-tight">
            {user ? "Akun" : "Masuk"}
          </span>
        </Link>
      </div>
    </nav>
    <div aria-hidden="true" className="h-[calc(60px+env(safe-area-inset-bottom))] md:hidden" />
    </>
  );
}
