"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ShoppingBag,
  Search,
  User,
  LogOut,
  Store,
  Shield,
  Menu,
  X,
  Heart,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import ThemeToggle from "@/components/ThemeToggle";

interface NavbarProps {
  initialSearch?: string;
  activeCategory?: string;
}

export default function Navbar({ initialSearch = "", activeCategory = "semua" }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { totalItems, toggleCart } = useCart();
  const { wishlistCount } = useWishlist();

  const [keyword, setKeyword] = useState(initialSearch);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const getAvatarUrl = (foto?: string | null) => {
    if (!foto) return null;
    if (foto.startsWith("http") || foto.startsWith("/")) return foto;
    return `/uploads/profil/${foto}`;
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.set("search", keyword.trim());
    if (activeCategory && activeCategory !== "semua") params.set("kategori", activeCategory);
    router.push(`/?${params.toString()}#katalog`);
  };

  return (
    <header className="sticky top-2 sm:top-4 z-50 px-3 sm:px-6 max-w-7xl mx-auto w-full transition-all">
      {/* Floating Island Capsule Navbar */}
      <div className="bg-white/95 dark:bg-[#16120E]/95 backdrop-blur-md rounded-full border border-[#E7DFD4] dark:border-[#2C211A] shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)] px-3.5 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2.5 sm:gap-6">
        
        {/* ========================================= */}
        {/* 1. BRAND LOGO                             */}
        {/* ========================================= */}
        <Link href="/" className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0 group">
          <img
            src="/logo-jake.png"
            alt="Logo PasarNusa"
            className="h-7 sm:h-8 w-auto object-contain transition-transform duration-300 group-hover:scale-105 select-none"
          />
          <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#1A110B] dark:text-[#FAF7F2] leading-none">
            Pasar<span className="text-[#C94B1A]">Nusa.</span>
          </span>
        </Link>

        {/* ========================================= */}
        {/* 2. CENTER NAV LINKS & SEARCH BAR          */}
        {/* ========================================= */}
        <nav className="hidden lg:flex items-center gap-6">
          <Link
            href="/#katalog"
            className={`text-xs uppercase tracking-wider font-semibold transition-colors ${
              pathname === "/" ? "text-[#C94B1A]" : "text-[#5C4F44] dark:text-[#C5B8AA] hover:text-[#C94B1A]"
            }`}
          >
            Katalog Kriya
          </Link>
          <Link
            href="/tentang-kami"
            className="text-xs uppercase tracking-wider font-semibold text-[#5C4F44] dark:text-[#C5B8AA] hover:text-[#C94B1A] transition-colors"
          >
            Kisah Artisan
          </Link>
        </nav>

        {/* Search Bar (Desktop) */}
        <form
          onSubmit={handleSearchSubmit}
          role="search"
          className="hidden md:flex flex-1 max-w-xs lg:max-w-sm items-center relative"
        >
          <div className="relative w-full h-9 flex items-center bg-[#FAF7F2] dark:bg-[#201A16] rounded-full border border-[#E7DFD4] dark:border-[#2E241E] focus-within:border-[#C94B1A] focus-within:ring-1 focus-within:ring-[#C94B1A] transition-all">
            <Search className="ml-3 h-3.5 w-3.5 text-[#8C7E72] dark:text-[#A89887] pointer-events-none flex-shrink-0" />
            <input
              type="search"
              aria-label="Cari produk kriya nusantara"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Cari karya kriya nusantara..."
              className="w-full bg-transparent py-1 pl-2.5 pr-7 text-xs text-[#1A110B] dark:text-[#FAF7F2] placeholder-[#8C7E72] dark:placeholder-[#A89887] focus:outline-none"
            />
            {keyword ? (
              <button
                type="button"
                onClick={() => setKeyword("")}
                className="mr-2 text-[#8C7E72] hover:text-[#1A110B] dark:hover:text-white p-0.5"
                aria-label="Bersihkan pencarian"
              >
                <X className="w-3 h-3" />
              </button>
            ) : null}
          </div>
        </form>

        {/* ========================================= */}
        {/* 3. NAVIGATION LINKS & ACTIONS             */}
        {/* ========================================= */}
        <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
          
          {/* Quick Portal Badges for Admin or Seller */}
          {user?.role === "admin" && (
            <Link
              href="/admin"
              className="hidden xl:inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-bold bg-[#FAF2E6] dark:bg-[#251B14] text-[#8A5912] dark:text-[#E09F3E] border border-[#B8872A]/30 dark:border-[#B8872A]/20 hover:bg-[#8A5912] hover:text-white transition-colors"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin</span>
            </Link>
          )}

          {user?.role === "penjual" && (
            <Link
              href="/penjual"
              className="hidden xl:inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-bold bg-[#FDF2EC] dark:bg-[#251710] text-[#C94B1A] border border-[#C94B1A]/30 dark:border-[#C94B1A]/20 hover:bg-[#C94B1A] hover:text-white transition-colors"
            >
              <Store className="w-3.5 h-3.5" />
              <span>Toko</span>
            </Link>
          )}

          {/* Wishlist Button */}
          <Link
            href="/?filter=favorit#katalog"
            className="relative hidden sm:flex h-8 sm:h-9 w-8 sm:w-9 items-center justify-center rounded-full bg-[#FAF7F2] dark:bg-[#201A16] hover:bg-[#F0EBE1] dark:hover:bg-[#2C231E] text-[#1A110B] dark:text-[#FAF7F2] border border-[#E7DFD4] dark:border-[#2E241E] transition-colors"
            title="Karya Favorit Tersimpan"
            aria-label={`Karya Favorit, ${wishlistCount} tersimpan`}
          >
            <Heart className={`w-3.5 sm:w-4 h-3.5 sm:h-4 ${wishlistCount > 0 ? "fill-[#8A5912] text-[#8A5912]" : ""}`} />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#8A5912] px-1 text-[9px] font-bold text-white">
                {wishlistCount > 99 ? "99+" : wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart Button */}
          <button
            type="button"
            onClick={toggleCart}
            className="relative flex h-8 sm:h-9 w-8 sm:w-9 items-center justify-center rounded-full bg-[#FAF7F2] dark:bg-[#201A16] hover:bg-[#F0EBE1] dark:hover:bg-[#2C231E] text-[#1A110B] dark:text-[#FAF7F2] border border-[#E7DFD4] dark:border-[#2E241E] transition-colors"
            title="Keranjang Belanja"
            aria-label={`Keranjang Belanja, ${totalItems} barang`}
          >
            <ShoppingBag className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#C94B1A] px-1 text-[9px] font-bold text-white">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </button>

          {/* Theme Switcher Toggle */}
          <ThemeToggle mode="horizontal" className="hidden sm:inline-flex" />
          <ThemeToggle mode="compact" className="sm:hidden inline-flex" />

          {/* User Auth Section (Pill style matching reference) */}
          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                aria-expanded={profileDropdownOpen}
                aria-haspopup="menu"
                className="flex items-center gap-1.5 sm:gap-2 h-8 sm:h-9 pl-1 pr-2 sm:pr-3 rounded-full bg-[#FAF7F2] dark:bg-[#201A16] hover:bg-[#F0EBE1] dark:hover:bg-[#2C231E] border border-[#E7DFD4] dark:border-[#2E241E] transition-all shadow-xs"
              >
                <div className="w-6 sm:w-7 h-6 sm:h-7 rounded-full bg-[#C94B1A] text-white font-bold flex items-center justify-center text-xs overflow-hidden select-none flex-shrink-0">
                  {getAvatarUrl(user.foto) ? (
                    <img src={getAvatarUrl(user.foto)!} alt={user.nama} className="w-full h-full object-cover" />
                  ) : (
                    <span>{user.nama.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <span className="hidden sm:inline text-xs font-semibold text-[#1A110B] dark:text-[#FAF7F2] max-w-[100px] truncate">
                  {user.nama.split(" ")[0]}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#8C7E72]" />
              </button>

              {/* Profile Dropdown Menu */}
              {profileDropdownOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-60 max-w-[calc(100vw-32px)] rounded-2xl border border-[#E7DFD4] dark:border-[#2E241E] bg-white dark:bg-[#181310] py-2 text-sm shadow-xl z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                  onMouseLeave={() => setProfileDropdownOpen(false)}
                >
                  <div className="px-4 py-2.5 border-b border-[#EAE3D8] dark:border-[#261E19] flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#C94B1A] text-white font-bold flex items-center justify-center text-sm overflow-hidden flex-shrink-0 shadow-xs">
                      {getAvatarUrl(user.foto) ? (
                        <img src={getAvatarUrl(user.foto)!} alt={user.nama} className="w-full h-full object-cover" />
                      ) : (
                        <span>{user.nama.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-xs text-[#1A110B] dark:text-[#FAF7F2] truncate">{user.nama}</p>
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[#FAF2E6] dark:bg-[#251B14] text-[#8A5912] dark:text-[#E09F3E]">
                        {user.role}
                      </span>
                    </div>
                  </div>

                  <Link
                    href="/profil"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-[#1A110B] dark:text-[#FAF7F2] hover:bg-[#F7F4EE] dark:hover:bg-[#221A15] transition"
                  >
                    <User className="w-4 h-4 text-[#8C7E72]" />
                    <span>Profil &amp; Pesanan Saya</span>
                  </Link>

                  {user.role === "penjual" && (
                    <Link
                      href="/penjual"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-[#C94B1A] hover:bg-[#FDF2EC] dark:hover:bg-[#251710] transition"
                    >
                      <Store className="w-4 h-4" />
                      <span>Studio Kelola Toko</span>
                    </Link>
                  )}

                  {user.role === "admin" && (
                    <Link
                      href="/admin"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-[#8A5912] dark:text-[#E09F3E] hover:bg-[#FAF2E6] dark:hover:bg-[#251B14] transition"
                    >
                      <Shield className="w-4 h-4" />
                      <span>Panel Dashboard Admin</span>
                    </Link>
                  )}

                  <div className="border-t border-[#EAE3D8] dark:border-[#261E19] my-1" />

                  <button
                    type="button"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-[#A82A2A] dark:text-[#FF8080] hover:bg-[#FBEAEA] dark:hover:bg-[#381A1A] transition text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Keluar Akun</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                href="/masuk"
                className="h-8 sm:h-9 px-3.5 rounded-full flex items-center text-xs font-semibold text-[#1A110B] dark:text-[#FAF7F2] hover:bg-[#F0EBE1] dark:hover:bg-[#2C231E] transition-colors"
              >
                Masuk
              </Link>
              <Link
                href="/daftar"
                className="h-8 sm:h-9 px-4 rounded-full flex items-center bg-[#C94B1A] hover:bg-[#B33F14] text-white text-xs font-bold shadow-xs transition-colors"
              >
                Daftar
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex h-8 w-8 items-center justify-center rounded-full bg-[#FAF7F2] dark:bg-[#201A16] border border-[#E7DFD4] dark:border-[#2E241E] text-[#1A110B] dark:text-[#FAF7F2]"
            aria-label={mobileMenuOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Floating Dropdown Card */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 rounded-2xl bg-white/95 dark:bg-[#16120E]/95 backdrop-blur-md border border-[#E7DFD4] dark:border-[#2C211A] shadow-xl p-4 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Mobile Search Bar */}
          <form onSubmit={handleSearchSubmit} role="search" className="relative mb-3">
            <div className="relative w-full h-9 flex items-center bg-[#FAF7F2] dark:bg-[#201A16] rounded-full border border-[#E7DFD4] dark:border-[#2E241E] focus-within:border-[#C94B1A]">
              <Search className="ml-3 h-3.5 w-3.5 text-[#8C7E72] pointer-events-none" />
              <input
                type="search"
                aria-label="Cari produk kriya"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Cari karya kriya nusantara..."
                className="w-full bg-transparent py-1 pl-2 pr-8 text-xs text-[#1A110B] dark:text-[#FAF7F2] placeholder-[#8C7E72] focus:outline-none"
              />
              {keyword && (
                <button
                  type="button"
                  onClick={() => setKeyword("")}
                  className="absolute right-2 text-[#8C7E72] hover:text-[#1A110B] dark:hover:text-white p-1"
                  aria-label="Bersihkan pencarian"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </form>

          <nav id="mobile-navigation" aria-label="Navigasi mobile" className="space-y-1">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center px-3 py-2 text-xs font-semibold text-[#1A110B] dark:text-[#FAF7F2] hover:bg-[#F7F4EE] dark:hover:bg-[#221A15] rounded-xl"
            >
              Beranda
            </Link>
            <Link
              href="/#katalog"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center px-3 py-2 text-xs font-semibold text-[#5C4F44] dark:text-[#C5B8AA] hover:bg-[#F7F4EE] dark:hover:bg-[#221A15] rounded-xl"
            >
              Katalog Kriya
            </Link>
            <Link
              href="/tentang-kami"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center px-3 py-2 text-xs font-semibold text-[#5C4F44] dark:text-[#C5B8AA] hover:bg-[#F7F4EE] dark:hover:bg-[#221A15] rounded-xl"
            >
              Kisah Artisan
            </Link>

            {user?.role === "penjual" && (
              <Link
                href="/penjual"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-[#C94B1A] bg-[#FDF2EC] dark:bg-[#251710] rounded-xl"
              >
                <Store className="w-4 h-4" />
                <span>Studio Kelola Toko</span>
              </Link>
            )}

            {user?.role === "admin" && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-[#8A5912] dark:text-[#E09F3E] bg-[#FAF2E6] dark:bg-[#251B14] rounded-xl"
              >
                <Shield className="w-4 h-4" />
                <span>Dashboard Admin</span>
              </Link>
            )}

            {/* Mobile Theme Toggle */}
            <div className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-[#5C4F44] dark:text-[#C5B8AA] border-t border-[#EAE3D8] dark:border-[#261E19] pt-2.5">
              <span>Mode Tampilan</span>
              <ThemeToggle mode="horizontal" />
            </div>

            {user ? (
              <div className="pt-2 border-t border-[#EAE3D8] dark:border-[#261E19] space-y-1">
                <Link
                  href="/profil"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#5C4F44] dark:text-[#C5B8AA] hover:bg-[#F7F4EE] dark:hover:bg-[#221A15] rounded-xl"
                >
                  <User className="w-4 h-4" />
                  <span>Profil &amp; Pesanan Saya</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-xs font-bold text-[#A82A2A] dark:text-[#FF8080] hover:bg-[#FBEAEA] dark:hover:bg-[#381A1A] rounded-xl text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar Akun</span>
                </button>
              </div>
            ) : (
              <div className="pt-2.5 border-t border-[#EAE3D8] dark:border-[#261E19] flex gap-2">
                <Link
                  href="/masuk"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 text-xs font-bold text-[#1A110B] dark:text-[#FAF7F2] bg-[#F7F4EE] dark:bg-[#221A15] rounded-full"
                >
                  Masuk
                </Link>
                <Link
                  href="/daftar"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 text-xs font-bold text-white bg-[#C94B1A] rounded-full"
                >
                  Daftar
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
