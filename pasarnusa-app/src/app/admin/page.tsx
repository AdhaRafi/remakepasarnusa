"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";
import { Order, Product, User as DbUser } from "@/lib/db";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Shield,
  Trash2,
  X,
  Search,
  Bell,
  Plus,
  RefreshCw,
  ExternalLink,
  LogOut,
  Store,
  TrendingUp,
  Wallet,
  Calendar,
  Edit3,
  CheckCircle2,
  Clock,
  Truck,
  AlertTriangle,
  ChevronRight,
  ArrowUpRight,
  MapPin,
  Check,
} from "lucide-react";

export default function AdminPage() {
  const { user, logout, loading: authLoading } = useAuth();

  const getAdminPhoto = (foto?: string | null) => {
    if (!foto) return null;
    if (foto.startsWith("http") || foto.startsWith("/")) return foto;
    return `/uploads/profil/${foto}`;
  };

  const [activeTab, setActiveTab] = useState<"dashboard" | "orders" | "products" | "users">("dashboard");
  const [usersList, setUsersList] = useState<DbUser[]>([]);
  const [ordersList, setOrdersList] = useState<Order[]>([]);
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  // Search in admin
  const [searchQuery, setSearchQuery] = useState("");

  // Edit Order Modal State
  const [editOrderModal, setEditOrderModal] = useState<Order | null>(null);
  const [editStatus, setEditStatus] = useState("pending");
  const [editRecipient, setEditRecipient] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");

  // Add Product Modal State
  const [addProductModal, setAddProductModal] = useState(false);
  const [newProdName, setNewProdName] = useState("");
  const [newProdCategory, setNewProdCategory] = useState<Product["kategori"]>("Kerajinan");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newProdStock, setNewProdStock] = useState("10");
  const [newProdDesc, setNewProdDesc] = useState("");
  const [newProdRegion, setNewProdRegion] = useState("Bantul, DI Yogyakarta");
  const [newProdImage, setNewProdImage] = useState("gerabah_kasongan_asli.jpg");
  const [submittingProduct, setSubmittingProduct] = useState(false);

  const loadAllData = async () => {
    setDataLoading(true);
    setDataError(null);
    try {
      const [uRes, oRes, pRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/orders"),
        fetch("/api/products"),
      ]);
      if (!uRes.ok || !oRes.ok || !pRes.ok) throw new Error("Sebagian data admin tidak dapat dimuat.");
      const [uData, oData, pData] = await Promise.all([uRes.json(), oRes.json(), pRes.json()]);
      setUsersList(uData.users || []);
      setOrdersList(oData.orders || []);
      setProductsList(pData.products || []);
    } catch (err) {
      setDataError(err instanceof Error ? err.message : "Data admin tidak dapat dimuat.");
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user?.role === "admin") {
      loadAllData();
    }
  }, [user, authLoading]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setEditOrderModal(null);
        setAddProductModal(false);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  const handleChangeRole = async (userId: number, newRole: string) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action: "change_role", newRole }),
      });
      if (res.ok) {
        setUsersList((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole as "pembeli" | "penjual" | "admin" } : u))
        );
      }
    } catch {
      alert("Gagal mengubah peran akun.");
    }
  };

  const handleResetPassword = async (userId: number) => {
    if (!confirm("Reset kata sandi akun ini menjadi 'pasar123'?")) return;
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action: "reset_password" }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || "Kata sandi berhasil di-reset.");
      }
    } catch {
      alert("Gagal me-reset kata sandi.");
    }
  };

  const handleSaveOrderEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editOrderModal) return;

    try {
      const res = await fetch(`/api/orders/${editOrderModal.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: editStatus,
          nama_penerima: editRecipient,
          no_hp: editPhone,
          alamat: editAddress,
        }),
      });

      if (res.ok) {
        setEditOrderModal(null);
        loadAllData();
      } else {
        alert("Gagal memperbarui data pesanan.");
      }
    } catch {
      alert("Terjadi kesalahan.");
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm("Admin: Hapus produk kriya ini dari katalog?")) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProductsList((prev) => prev.filter((p) => p.id !== id));
      }
    } catch {
      alert("Gagal menghapus produk.");
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingProduct(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama_produk: newProdName,
          kategori: newProdCategory,
          harga: Number(newProdPrice),
          stok: Number(newProdStock),
          deskripsi: newProdDesc,
          foto_produk: newProdImage,
          asal_daerah: newProdRegion,
        }),
      });

      if (res.ok) {
        setAddProductModal(false);
        setNewProdName("");
        setNewProdPrice("");
        setNewProdDesc("");
        loadAllData();
      } else {
        const d = await res.json();
        alert(d.error || "Gagal menambah produk.");
      }
    } catch {
      alert("Terjadi kendala saat menyimpan produk.");
    } finally {
      setSubmittingProduct(false);
    }
  };

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FAF7F2] text-base text-[#C94B1A] font-bold">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="clay-card p-8 flex items-center gap-3"
        >
          <RefreshCw className="w-5 h-5 animate-spin text-[#C94B1A]" />
          <span>Memuat Glassy Studio PasarNusa...</span>
        </motion.div>
      </main>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2] dark:bg-[#120F0D] p-6 transition-colors">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#181310] border border-[#E7DFD4] dark:border-[#2C211A] rounded-2xl p-8 sm:p-10 max-w-md w-full text-center space-y-5 shadow-xl"
        >
          <div className="w-14 h-14 rounded-xl bg-[#FAF2E6] dark:bg-[#251B14] text-[#C94B1A] flex items-center justify-center mx-auto border border-[#B8872A]/20">
            <Shield className="w-7 h-7" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#1A110B] dark:text-[#FAF7F2]">Akses Khusus Administrator</h2>
          <p className="text-sm text-[#5C4F44] dark:text-[#C5B8AA] leading-relaxed">
            Panel operasional ini hanya dapat diakses oleh akun Administrator resmi PasarNusa.
          </p>
          <div className="pt-2">
            <Link
              href="/masuk"
              className="inline-flex h-12 items-center justify-center px-6 rounded-xl bg-[#C94B1A] hover:bg-[#B33F14] text-white text-sm font-bold w-full shadow-xs hover:shadow-md transition-all active:scale-[0.98]"
            >
              Masuk sebagai Administrator
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // Calculated Metrics
  const totalRevenue = ordersList
    .filter((o) => o.status === "paid" || o.status === "selesai")
    .reduce((acc, o) => acc + o.total_bayar, 0);

  const pendingOrdersCount = ordersList.filter((o) => o.status === "pending" || o.status === "diproses").length;
  const outOfStockCount = productsList.filter((p) => p.stok <= 0).length;
  const nonAdminCount = usersList.filter((u) => u.role !== "admin").length;

  const orderStatusBadges: Record<Order["status"], { label: string; color: string; bg: string }> = {
    pending: { label: "Menunggu", color: "text-[#8A5912]", bg: "bg-[#FAF5EB] border-[#B8872A]/30" },
    paid: { label: "Lunas", color: "text-[#246E4A]", bg: "bg-[#EAF4EE] border-[#246E4A]/30" },
    diproses: { label: "Diproses", color: "text-[#C94B1A]", bg: "bg-[#FDF4EF] border-[#C94B1A]/30" },
    dikirim: { label: "Dikirim", color: "text-[#246E4A]", bg: "bg-[#EAF4EE] border-[#246E4A]/30" },
    selesai: { label: "Selesai", color: "text-[#246E4A]", bg: "bg-[#EAF4EE] border-[#246E4A]/30" },
    dibatalkan: { label: "Dibatalkan", color: "text-[#A82A2A]", bg: "bg-[#FBEAEA] border-[#A82A2A]/30" },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF7F2] via-[#F4EFE6] to-[#EFE8DC] text-[#1A110B] p-3 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1560px]">
        
        {/* ======================================================== */}
        {/* 1. TOP BAR (Clay Glass Search & Action Cluster)          */}
        {/* ======================================================== */}
        <header className="clay-card px-5 py-3.5 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="font-serif text-2xl font-bold tracking-tight text-[#1A110B]">
                Pasar<span className="text-[#C94B1A]">Nusa.</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FDF4EF] text-[#C94B1A] border border-[#C94B1A]/20">
                Studio Admin
              </span>
            </Link>
          </div>

          {/* Search Input Clay Bar */}
          <div className="w-full sm:max-w-md relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C7E72]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari transaksi, produk kriya, atau pembeli..."
              className="clay-input w-full h-10 pl-11 pr-4 text-xs sm:text-sm text-[#1A110B] placeholder-[#8C7E72] focus:outline-none"
            />
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            {/* Horizontal Theme Switcher in Header */}
            <ThemeToggle mode="horizontal" className="hidden sm:inline-flex" />

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={loadAllData}
              className="clay-card-flat h-10 w-10 flex items-center justify-center text-[#6B5E52] hover:text-[#C94B1A] transition-colors"
              title="Perbarui Data Realtime"
            >
              <RefreshCw className={`w-4 h-4 ${dataLoading ? "animate-spin text-[#C94B1A]" : ""}`} />
            </motion.button>

            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/"
                className="clay-card-flat h-10 px-3.5 flex items-center gap-1.5 text-xs font-bold text-[#6B5E52] hover:text-[#C94B1A] transition-colors"
                title="Kunjungi Toko PasarNusa"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Ke Toko</span>
              </Link>
            </motion.div>

            <div className="h-6 w-[1px] bg-[#E2DBD1] hidden sm:block" />

            <div className="flex items-center gap-2.5 pl-1">
              <div className="w-8 h-8 rounded-full bg-[#C94B1A] text-white font-bold flex items-center justify-center text-xs shadow-sm overflow-hidden flex-shrink-0">
                {getAdminPhoto(user?.foto) ? (
                  <img src={getAdminPhoto(user?.foto)!} alt={user?.nama || "Admin"} className="w-full h-full object-cover" />
                ) : (
                  <span>{user?.nama ? user.nama.charAt(0).toUpperCase() : "A"}</span>
                )}
              </div>
              <div className="hidden lg:block text-left text-xs leading-none">
                <p className="font-bold text-[#1A110B] dark:text-[#FAF7F2] truncate max-w-[120px]">{user?.nama || "Admin PasarNusa"}</p>
                <span className="text-[10px] text-[#246E4A] font-semibold block mt-1">
                  Online
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* ======================================================== */}
        {/* 2. MAIN LAYOUT: Clay Sidebar + Clay Content Area         */}
        {/* ======================================================== */}
        <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          
          {/* ================= SIDEBAR ================= */}
          <aside className="clay-card p-5 h-fit lg:sticky lg:top-8 space-y-6">
            {/* User Card Pill inside Sidebar with Vertical Theme Switcher */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#FDF4EF] to-[#FAF5EB] dark:from-[#221A15] dark:to-[#1A1410] border border-white dark:border-white/10 flex items-center justify-between gap-2 shadow-xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-[#C94B1A] text-white font-bold text-sm flex items-center justify-center shadow-md flex-shrink-0 overflow-hidden">
                  {getAdminPhoto(user?.foto) ? (
                    <img src={getAdminPhoto(user?.foto)!} alt={user?.nama || "Admin"} className="w-full h-full object-cover" />
                  ) : (
                    <span>{user?.nama ? user.nama.charAt(0).toUpperCase() : "A"}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#1A110B] dark:text-[#FAF7F2] truncate">{user?.nama || "Administrator"}</p>
                  <p className="text-[11px] text-[#C94B1A] truncate font-medium">{user?.email || "admin@pasarnusa.id"}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-white/90 dark:bg-black/40 text-[#8A5912] dark:text-[#E09F3E] border border-[#B8872A]/20">
                    Master Admin
                  </span>
                </div>
              </div>

              {/* Vertical Theme Switcher (Dashboard V14 TikTok Style) */}
              <ThemeToggle mode="vertical" />
            </div>

            {/* Navigation Menu Links */}
            <nav className="space-y-1.5 text-xs font-bold">
              {[
                { id: "dashboard", label: "Dashboard", count: null, icon: LayoutDashboard },
                { id: "orders", label: "Pesanan & Deals", count: ordersList.length, icon: ShoppingCart },
                { id: "products", label: "Katalog Produk", count: productsList.length, icon: Package },
                { id: "users", label: "Pengguna Akun", count: usersList.length, icon: Users },
              ].map((item) => {
                const IconComp = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <motion.button
                    whileHover={{ scale: 1.02, x: 2 }}
                    whileTap={{ scale: 0.98 }}
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id as typeof activeTab)}
                    className={`w-full h-11 px-4 rounded-2xl flex items-center justify-between transition-all duration-200 ${
                      isActive
                        ? "clay-pill-active"
                        : "text-[#6B5E52] hover:bg-[#FDF4EF] hover:text-[#C94B1A]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <IconComp className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.count !== null && (
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          isActive ? "bg-white/30 text-white" : "bg-[#FDF4EF] text-[#C94B1A]"
                        }`}
                      >
                        {item.count}
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </nav>

            {/* Quick Action Button in Sidebar */}
            <div className="pt-2 border-t border-[#EAE4DC] space-y-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => setAddProductModal(true)}
                className="clay-btn-primary w-full h-11 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold"
              >
                <Plus className="w-4 h-4" />
                <span>+ Produk Kriya Baru</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => logout()}
                className="w-full h-10 px-4 rounded-2xl flex items-center gap-2 text-xs font-bold text-[#A82A2A] hover:bg-[#FBEAEA] transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar Akun</span>
              </motion.button>
            </div>
          </aside>

          {/* ================= CONTENT AREA ================= */}
          <div className="space-y-6">
            
            {/* ======================================================== */}
            {/* HERO WELCOME CARD: 3D Clay Banner (Frame 00:01 Style)   */}
            {/* ======================================================== */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="clay-card p-6 sm:p-8 relative overflow-visible bg-gradient-to-r from-[#FDF4EF] via-[#FAF5EB] to-[#FFFFFF] dark:from-[#201814] dark:via-[#1A130F] dark:to-[#16100D] border border-white/80 dark:border-white/10"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
                {/* Left Column: Greeting, Stats & Actions */}
                <div className="max-w-xl space-y-3">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#C94B1A]">
                    Sentra Kurasi &amp; Operasional · PasarNusa Studio
                  </p>
                  <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A110B] dark:text-[#FAF7F2] leading-snug">
                    Selamat Bekerja, Administrator
                  </h1>
                  <p className="text-xs sm:text-sm text-[#5C4F44] dark:text-[#C5B8AA] leading-relaxed">
                    Ada <strong className="text-[#1A110B] dark:text-[#FAF7F2]">{pendingOrdersCount} transaksi</strong> yang perlu segera diproses dan <strong className="text-[#1A110B] dark:text-[#FAF7F2]">{productsList.length} karya kriya</strong> aktif di etalase belanja nusantara.
                  </p>
                  <div className="flex flex-wrap gap-2.5 pt-2">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      type="button"
                      onClick={() => setActiveTab("orders")}
                      className="clay-btn-primary h-10 px-5 rounded-xl text-xs font-bold flex items-center gap-2"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>Periksa Pesanan Masuk</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      type="button"
                      onClick={() => setAddProductModal(true)}
                      className="clay-card-flat h-10 px-5 rounded-xl text-xs font-bold text-[#1A110B] hover:text-[#C94B1A] flex items-center gap-2"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Produk Baru</span>
                    </motion.button>
                  </div>
                </div>

                {/* Right Column: 3D Animated Floating Batik Cloth */}
                <div className="relative flex items-center justify-center lg:justify-end flex-shrink-0 pt-4 lg:pt-0 [perspective:1200px]">
                  {/* Ambient Warm Radial Aura */}
                  <div className="absolute w-48 h-48 sm:w-60 sm:h-60 rounded-full bg-gradient-to-tr from-[#C94B1A]/20 via-[#B8872A]/25 to-transparent blur-2xl pointer-events-none" />

                  {/* 3D Floating Fabric Card */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.4, rotate: 20, x: 80, y: 40 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      x: 0,
                      y: [0, -12, 0],
                      rotate: [4, 7, 3, 5, 4],
                      rotateX: [6, 12, 4, 6],
                      rotateY: [-8, 2, -6, -8],
                    }}
                    transition={{
                      opacity: { duration: 0.6, ease: "easeOut" },
                      scale: { type: "spring", stiffness: 220, damping: 16, delay: 0.2 },
                      x: { type: "spring", stiffness: 220, damping: 16, delay: 0.2 },
                      y: { duration: 5.5, repeat: Infinity, ease: "easeInOut" },
                      rotate: { duration: 7, repeat: Infinity, ease: "easeInOut" },
                      rotateX: { duration: 8, repeat: Infinity, ease: "easeInOut" },
                      rotateY: { duration: 9, repeat: Infinity, ease: "easeInOut" },
                    }}
                    whileHover={{
                      scale: 1.08,
                      rotate: 0,
                      rotateX: 0,
                      rotateY: 0,
                      y: -18,
                      transition: { type: "spring", stiffness: 350, damping: 20 },
                    }}
                    className="relative cursor-pointer group select-none"
                    title="Kain Batik Parang Tulis Asli Nusantara (Klik untuk pratinjau)"
                  >
                    {/* Clay Card Shell with Realistic Bevel and Shadow */}
                    <div className="p-2.5 sm:p-3 rounded-[30px] bg-gradient-to-b from-white/95 to-[#FAF5EB]/90 backdrop-blur-md border border-white/90 shadow-[0_24px_50px_rgba(201,75,26,0.22),0_10px_22px_rgba(26,17,11,0.08),inset_0_2px_4px_rgba(255,255,255,1)] transition-all">
                      <div className="relative overflow-hidden rounded-[22px] w-36 h-36 sm:w-44 sm:h-44 md:w-48 md:h-48 shadow-[inset_0_2px_8px_rgba(0,0,0,0.18)]">
                        <img
                          src="/batik-banner.webp"
                          alt="Kain Batik Parang Rusak Klasik Nusantara"
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                        />
                        {/* Dynamic Soft Light Sheen */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/20 pointer-events-none" />
                      </div>
                    </div>

                    {/* Floating Pill Badge 1: Top-Left (Counter Wave Motion) */}
                    <motion.div
                      animate={{
                        y: [0, 7, 0],
                        x: [0, -3, 0],
                        rotate: [-2, 2, -2],
                      }}
                      transition={{
                        duration: 4.8,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="absolute -top-3 -left-3 sm:-top-4 sm:-left-4 clay-card-flat px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-[#C94B1A] border border-[#C94B1A]/20 bg-white/95 dark:bg-[#1A1411]/95 backdrop-blur-md shadow-md pointer-events-none"
                    >
                      <span>Batik Parang Asli</span>
                    </motion.div>

                    {/* Floating Pill Badge 2: Bottom-Right (Counter Wave Motion) */}
                    <motion.div
                      animate={{
                        y: [0, -6, 0],
                        x: [0, 3, 0],
                        rotate: [2, -2, 2],
                      }}
                      transition={{
                        duration: 5.4,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.6,
                      }}
                      className="absolute -bottom-3 -right-3 sm:-bottom-4 sm:-right-4 clay-card-flat px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-[#8A5912] border border-[#B8872A]/25 bg-white/95 dark:bg-[#1A1411]/95 backdrop-blur-md shadow-md pointer-events-none"
                    >
                      <span>100% Tulis Asli Nusantara</span>
                    </motion.div>
                  </motion.div>
                </div>
              </div>

              {/* Decorative 3D Warm Background Glow */}
              <div className="absolute right-0 top-0 bottom-0 w-80 opacity-20 lg:opacity-30 pointer-events-none bg-gradient-to-l from-[#C94B1A] via-[#B8872A] to-transparent rounded-r-3xl" />
            </motion.div>

            {/* ======================================================== */}
            {/* 4 3D CLAY STATS CARDS (TikTok whileHover={{ y: -5 }})    */}
            {/* ======================================================== */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              
              {/* Card 1: Revenue */}
              <motion.div
                whileHover={{ y: -6, scale: 1.01 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className="clay-card p-5 sm:p-6 space-y-3 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-[#FDF4EF] text-[#C94B1A] flex items-center justify-center shadow-xs">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#EAF4EE] text-[#246E4A]">
                    <ArrowUpRight className="w-3 h-3" /> +14.2%
                  </span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#8C7E72]">Total Omzet Penjualan</p>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1A110B] mt-1">
                    Rp {totalRevenue.toLocaleString("id-ID")}
                  </h3>
                  <p className="text-[10px] text-[#6B5E52] mt-0.5">Dari transaksi lunas/selesai</p>
                </div>
              </motion.div>

              {/* Card 2: Orders */}
              <motion.div
                whileHover={{ y: -6, scale: 1.01 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className="clay-card p-5 sm:p-6 space-y-3 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-[#FAF5EB] text-[#8A5912] flex items-center justify-center shadow-xs">
                    <ShoppingCart className="w-5 h-5" />
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#FDF4EF] text-[#C94B1A]">
                    <Clock className="w-3 h-3" /> {pendingOrdersCount} Baru
                  </span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#8C7E72]">Total Transaksi Masuk</p>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1A110B] mt-1">
                    {ordersList.length} Pesanan
                  </h3>
                  <p className="text-[10px] text-[#6B5E52] mt-0.5">Seluruh pesanan pelanggan</p>
                </div>
              </motion.div>

              {/* Card 3: Products */}
              <motion.div
                whileHover={{ y: -6, scale: 1.01 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className="clay-card p-5 sm:p-6 space-y-3 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-[#FDF4EF] text-[#C94B1A] flex items-center justify-center shadow-xs">
                    <Package className="w-5 h-5" />
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      outOfStockCount > 0 ? "bg-[#FBEAEA] text-[#A82A2A]" : "bg-[#EAF4EE] text-[#246E4A]"
                    }`}
                  >
                    {outOfStockCount > 0 ? `${outOfStockCount} Habis` : "Stok Siap"}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#8C7E72]">Katalog Produk Kriya</p>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1A110B] mt-1">
                    {productsList.length} Karya
                  </h3>
                  <p className="text-[10px] text-[#6B5E52] mt-0.5">Dari mitra sentra pengrajin</p>
                </div>
              </motion.div>

              {/* Card 4: Users */}
              <motion.div
                whileHover={{ y: -6, scale: 1.01 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className="clay-card p-5 sm:p-6 space-y-3 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-[#EAF4EE] text-[#246E4A] flex items-center justify-center shadow-xs">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#FAF5EB] text-[#8A5912]">
                    <CheckCircle2 className="w-3 h-3" /> Terverifikasi
                  </span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#8C7E72]">Pengguna Terdaftar</p>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1A110B] mt-1">
                    {usersList.length} Akun
                  </h3>
                  <p className="text-[10px] text-[#6B5E52] mt-0.5">{nonAdminCount} pembeli &amp; penjual</p>
                </div>
              </motion.div>

            </div>

            {/* ======================================================== */}
            {/* TAB CONTENT SECTIONS (Animated with AnimatePresence)     */}
            {/* ======================================================== */}
            <AnimatePresence mode="wait">
              
              {/* TAB 1: DASHBOARD OVERVIEW */}
              {activeTab === "dashboard" && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="space-y-6"
                >
                  {/* Deals Pipeline Kanban Bar (Frame 00:02 in TikTok) */}
                  <div className="clay-card p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-serif text-lg font-bold text-[#1A110B]">Alur Proses Transaksi (Order Pipeline)</h3>
                        <p className="text-xs text-[#6B5E52]">Status real-time setiap transaksi yang masuk ke PasarNusa.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab("orders")}
                        className="text-xs font-bold text-[#C94B1A] hover:underline"
                      >
                        Buka Rincian ({ordersList.length})
                      </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 pt-2">
                      {[
                        { status: "pending", label: "Menunggu Bayar", count: ordersList.filter(o => o.status === "pending").length, color: "bg-[#FAF5EB] text-[#8A5912]" },
                        { status: "diproses", label: "Sedang Diproses", count: ordersList.filter(o => o.status === "diproses").length, color: "bg-[#FDF4EF] text-[#C94B1A]" },
                        { status: "dikirim", label: "Dalam Pengiriman", count: ordersList.filter(o => o.status === "dikirim").length, color: "bg-[#EAF4EE] text-[#246E4A]" },
                        { status: "paid", label: "Lunas / Selesai", count: ordersList.filter(o => o.status === "paid" || o.status === "selesai").length, color: "bg-[#EAF4EE] text-[#246E4A]" },
                      ].map((step) => (
                        <motion.div
                          whileHover={{ y: -3 }}
                          key={step.status}
                          className="p-4 rounded-2xl bg-white border border-[#EAE4DC] space-y-2 shadow-2xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${step.color}`}>
                              {step.label}
                            </span>
                            <span className="text-sm font-extrabold text-[#1A110B]">{step.count}</span>
                          </div>
                          <p className="text-[11px] text-[#8C7E72]">
                            {step.count > 0 ? `${step.count} transaksi aktif` : "Tidak ada antrean"}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Invoices / Transactions Table (Frame 00:05 in TikTok) */}
                  <div className="clay-card p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-serif text-lg font-bold text-[#1A110B]">Transaksi &amp; Invoice Terbaru</h3>
                        <p className="text-xs text-[#6B5E52]">Daftar pesanan masuk dari pembeli di seluruh Indonesia.</p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        type="button"
                        onClick={() => setActiveTab("orders")}
                        className="clay-card-flat px-3.5 py-1.5 text-xs font-bold text-[#C94B1A] hover:text-[#B33F14]"
                      >
                        Lihat Semua
                      </motion.button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-[#EAE4DC] text-[#8C7E72] uppercase font-bold text-[10px] tracking-wider">
                            <th className="py-3 px-3">No. Invoice</th>
                            <th className="py-3 px-3">Penerima</th>
                            <th className="py-3 px-3">Kurir</th>
                            <th className="py-3 px-3">Total Bayar</th>
                            <th className="py-3 px-3">Status</th>
                            <th className="py-3 px-3 text-right">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EAE4DC]/60">
                          {ordersList.slice(0, 5).map((ord) => {
                            const badge = orderStatusBadges[ord.status] || orderStatusBadges.pending;
                            return (
                              <tr key={ord.id} className="hover:bg-[#FDF4EF]/40 transition-colors">
                                <td className="py-3.5 px-3 font-mono font-bold text-[#C94B1A]">
                                  {ord.order_number}
                                </td>
                                <td className="py-3.5 px-3">
                                  <p className="font-bold text-[#1A110B]">{ord.nama_penerima}</p>
                                  <p className="text-[11px] text-[#8C7E72]">{ord.kota}, {ord.provinsi}</p>
                                </td>
                                <td className="py-3.5 px-3 text-[#6B5E52]">{ord.kurir}</td>
                                <td className="py-3.5 px-3 font-serif font-bold text-sm text-[#1A110B]">
                                  Rp {ord.total_bayar.toLocaleString("id-ID")}
                                </td>
                                <td className="py-3.5 px-3">
                                  <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${badge.bg} ${badge.color}`}>
                                    {badge.label}
                                  </span>
                                </td>
                                <td className="py-3.5 px-3 text-right">
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    type="button"
                                    onClick={() => {
                                      setEditOrderModal(ord);
                                      setEditStatus(ord.status);
                                      setEditRecipient(ord.nama_penerima);
                                      setEditPhone(ord.no_hp);
                                      setEditAddress(ord.alamat);
                                    }}
                                    className="clay-card-flat px-3 py-1 text-[11px] font-bold text-[#C94B1A] hover:text-[#B33F14]"
                                  >
                                    Kelola
                                  </motion.button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </motion.div>
              )}

              {/* TAB 2: ORDERS MANAGEMENT */}
              {activeTab === "orders" && (
                <motion.div
                  key="orders"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="clay-card p-6 space-y-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="font-serif text-xl font-bold text-[#1A110B]">Pengelolaan Pesanan &amp; Transaksi ({ordersList.length})</h2>
                      <p className="text-xs text-[#6B5E52]">Pantau status pembayaran, data pengiriman kurir, dan konfirmasi pesanan.</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {ordersList.map((ord) => {
                      const badge = orderStatusBadges[ord.status] || orderStatusBadges.pending;
                      return (
                        <motion.div
                          whileHover={{ y: -2 }}
                          key={ord.id}
                          className="p-5 rounded-2xl bg-white border border-[#EAE4DC] shadow-xs space-y-3"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-[#EAE4DC] pb-3">
                            <div className="flex items-center gap-2.5">
                              <span className="font-mono font-bold text-sm text-[#C94B1A]">#{ord.order_number}</span>
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg} ${badge.color}`}>
                                {badge.label}
                              </span>
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              type="button"
                              onClick={() => {
                                setEditOrderModal(ord);
                                setEditStatus(ord.status);
                                setEditRecipient(ord.nama_penerima);
                                setEditPhone(ord.no_hp);
                                setEditAddress(ord.alamat);
                              }}
                              className="clay-btn-primary px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Ubah Status / Alamat</span>
                            </motion.button>
                          </div>

                          <div className="grid sm:grid-cols-2 gap-3 text-xs">
                            <div>
                              <p className="text-[#8C7E72] font-semibold">Penerima &amp; Alamat:</p>
                              <p className="font-bold text-[#1A110B] mt-0.5">{ord.nama_penerima} ({ord.no_hp})</p>
                              <p className="text-[#6B5E52] mt-0.5">{ord.alamat}, {ord.kota}, {ord.provinsi} {ord.kode_pos}</p>
                            </div>
                            <div>
                              <p className="text-[#8C7E72] font-semibold">Daftar Produk Pesanan:</p>
                              <div className="mt-1 space-y-1">
                                {ord.items?.map((it) => (
                                  <p key={it.id} className="text-[#1A110B] font-medium">
                                    • {it.nama_produk} <span className="text-[#8C7E72]">({it.qty}x)</span> = Rp {it.subtotal.toLocaleString("id-ID")}
                                  </p>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-[#EAE4DC] flex flex-wrap justify-between items-center text-xs">
                            <span className="text-[#6B5E52]">Kurir: <strong className="text-[#1A110B]">{ord.kurir}</strong> | Pembayaran: <strong className="text-[#1A110B] uppercase">{ord.metode_pembayaran}</strong></span>
                            <span className="font-serif font-bold text-base text-[#C94B1A]">
                              Total Bayar: Rp {ord.total_bayar.toLocaleString("id-ID")}
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* TAB 3: PRODUCTS MANAGEMENT */}
              {activeTab === "products" && (
                <motion.div
                  key="products"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="clay-card p-6 space-y-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="font-serif text-xl font-bold text-[#1A110B]">Katalog Karya Kriya ({productsList.length})</h2>
                      <p className="text-xs text-[#6B5E52]">Moderasi produk, update harga, stok langsung, dan kelola etalase.</p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      type="button"
                      onClick={() => setAddProductModal(true)}
                      className="clay-btn-primary h-10 px-5 rounded-full text-xs font-bold flex items-center gap-2 self-start sm:self-auto"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Tambah Produk Kriya</span>
                    </motion.button>
                  </div>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {productsList.map((p) => (
                      <motion.div
                        whileHover={{ y: -4 }}
                        key={p.id}
                        className="p-4 rounded-2xl bg-white border border-[#EAE4DC] space-y-3 shadow-xs"
                      >
                        <div className="flex gap-3">
                          <img
                            src={`/uploads/produk/${p.foto_produk}`}
                            alt={p.nama_produk}
                            className="w-16 h-16 rounded-xl object-cover bg-[#E8DFD5] flex-shrink-0"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/pasar.jpg"; }}
                          />
                          <div className="min-w-0 flex-1">
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-[#FDF4EF] text-[#C94B1A]">
                              {p.kategori}
                            </span>
                            <h4 className="font-bold text-xs text-[#1A110B] truncate mt-1">{p.nama_produk}</h4>
                            <p className="font-serif font-bold text-sm text-[#C94B1A] mt-0.5">
                              Rp {p.harga.toLocaleString("id-ID")}
                            </p>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-[#EAE4DC] flex items-center justify-between text-xs">
                          <span className="text-[#6B5E52]">
                            Stok: <strong className={p.stok <= 0 ? "text-[#A82A2A]" : "text-[#246E4A]"}>{p.stok} unit</strong>
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1.5 text-[#A82A2A] hover:bg-[#FBEAEA] rounded-lg transition"
                            title="Hapus Produk"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* TAB 4: USERS MANAGEMENT */}
              {activeTab === "users" && (
                <motion.div
                  key="users"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="clay-card p-6 space-y-6"
                >
                  <div>
                    <h2 className="font-serif text-xl font-bold text-[#1A110B]">Manajemen Akun Pengguna ({usersList.length})</h2>
                    <p className="text-xs text-[#6B5E52]">Kelola peran pengguna (Admin, Penjual, Pembeli) dan reset kata sandi.</p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-[#EAE4DC] text-[#8C7E72] uppercase font-bold text-[10px]">
                          <th className="py-3 px-3">Nama Pengguna</th>
                          <th className="py-3 px-3">Email</th>
                          <th className="py-3 px-3">Peran / Hak Akses</th>
                          <th className="py-3 px-3">No. HP</th>
                          <th className="py-3 px-3">Kota</th>
                          <th className="py-3 px-3 text-right">Reset Sandi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EAE4DC]/60">
                        {usersList.map((u) => (
                          <tr key={u.id} className="hover:bg-[#FDF4EF]/40 transition-colors">
                            <td className="py-3 px-3 font-bold text-[#1A110B]">{u.nama}</td>
                            <td className="py-3 px-3 text-[#6B5E52] font-mono">{u.email}</td>
                            <td className="py-3 px-3">
                              {u.id === user.id ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FDF4EF] text-[#C94B1A]">
                                  Akun Utama Anda
                                </span>
                              ) : (
                                <select
                                  value={u.role}
                                  onChange={(e) => handleChangeRole(u.id, e.target.value)}
                                  className="clay-input h-8 px-2.5 text-xs font-bold text-[#1A110B]"
                                >
                                  <option value="pembeli">Pembeli</option>
                                  <option value="penjual">Penjual</option>
                                  <option value="admin">Admin</option>
                                </select>
                              )}
                            </td>
                            <td className="py-3 px-3 text-[#6B5E52]">{u.no_hp || "-"}</td>
                            <td className="py-3 px-3 text-[#6B5E52]">{u.kota || "-"}</td>
                            <td className="py-3 px-3 text-right">
                              {u.id !== user.id && (
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  type="button"
                                  onClick={() => handleResetPassword(u.id)}
                                  className="clay-card-flat px-2.5 py-1 text-[11px] font-bold text-[#C94B1A] hover:text-[#B33F14]"
                                >
                                  Reset Sandi
                                </motion.button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>

          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* MODAL 1: EDIT ORDER MODAL (with Framer Motion Animation)  */}
      {/* ======================================================== */}
      <AnimatePresence>
        {editOrderModal && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setEditOrderModal(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 15 }}
              transition={{ type: "spring", duration: 0.35 }}
              onClick={(e) => e.stopPropagation()}
              className="clay-card p-6 sm:p-8 max-w-md w-full bg-white space-y-5"
            >
              <div className="flex items-center justify-between border-b border-[#EAE4DC] pb-3">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#1A110B]">Edit Pesanan #{editOrderModal.order_number}</h3>
                  <p className="text-xs text-[#6B5E52]">Ubah status atau alamat pengiriman pesanan.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditOrderModal(null)}
                  className="clay-card-flat h-8 w-8 flex items-center justify-center text-[#8C7E72] hover:text-[#1A110B]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveOrderEdit} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-[#1A110B] block mb-1">Status Pesanan</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="clay-input w-full h-10 px-3 font-bold text-xs text-[#1A110B]"
                  >
                    <option value="pending">Menunggu Pembayaran (pending)</option>
                    <option value="paid">Lunas (paid)</option>
                    <option value="diproses">Sedang Diproses (diproses)</option>
                    <option value="dikirim">Dalam Pengiriman (dikirim)</option>
                    <option value="selesai">Selesai Diterima (selesai)</option>
                    <option value="dibatalkan">Dibatalkan (dibatalkan)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#1A110B] block mb-1">Nama Penerima</label>
                  <input
                    type="text"
                    value={editRecipient}
                    onChange={(e) => setEditRecipient(e.target.value)}
                    className="clay-input w-full h-10 px-3 text-xs text-[#1A110B]"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-[#1A110B] block mb-1">No. WhatsApp / HP</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="clay-input w-full h-10 px-3 text-xs text-[#1A110B]"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-[#1A110B] block mb-1">Alamat Tujuan Pengiriman</label>
                  <textarea
                    rows={3}
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD5] text-xs text-[#1A110B] focus:bg-white focus:outline-none"
                    required
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setEditOrderModal(null)}
                    className="clay-card-flat flex-1 h-10 rounded-full font-bold text-xs text-[#6B5E52]"
                  >
                    Batal
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="clay-btn-primary flex-1 h-10 rounded-full font-bold text-xs"
                  >
                    Simpan Perubahan
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* MODAL 2: ADD PRODUCT MODAL (with Framer Motion Animation) */}
      {/* ======================================================== */}
      <AnimatePresence>
        {addProductModal && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setAddProductModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 15 }}
              transition={{ type: "spring", duration: 0.35 }}
              onClick={(e) => e.stopPropagation()}
              className="clay-card p-6 sm:p-8 max-w-lg w-full bg-white space-y-5 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-[#EAE4DC] pb-3">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#1A110B]">Tambah Produk Kriya Baru</h3>
                  <p className="text-xs text-[#6B5E52]">Masukkan karya pengrajin ke dalam katalog PasarNusa.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setAddProductModal(false)}
                  className="clay-card-flat h-8 w-8 flex items-center justify-center text-[#8C7E72] hover:text-[#1A110B]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-[#1A110B] block mb-1">Nama Produk Kriya</label>
                  <input
                    type="text"
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    placeholder="Contoh: Vas Bunga Gerabah Kasongan"
                    className="clay-input w-full h-10 px-3 text-xs text-[#1A110B]"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-[#1A110B] block mb-1">Kategori</label>
                    <select
                      value={newProdCategory}
                      onChange={(e) => setNewProdCategory(e.target.value as Product["kategori"])}
                      className="clay-input w-full h-10 px-3 font-bold text-xs text-[#1A110B]"
                    >
                      <option value="Kerajinan">Kerajinan</option>
                      <option value="Fashion">Fashion (Wastra)</option>
                      <option value="Kuliner">Kuliner &amp; Rempah</option>
                      <option value="Kecantikan">Perawatan Alami</option>
                      <option value="Lainnya">Lainnya (Anyaman)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-[#1A110B] block mb-1">Harga (Rp)</label>
                    <input
                      type="number"
                      value={newProdPrice}
                      onChange={(e) => setNewProdPrice(e.target.value)}
                      placeholder="Contoh: 125000"
                      className="clay-input w-full h-10 px-3 text-xs text-[#1A110B]"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-[#1A110B] block mb-1">Stok Awal</label>
                    <input
                      type="number"
                      value={newProdStock}
                      onChange={(e) => setNewProdStock(e.target.value)}
                      className="clay-input w-full h-10 px-3 text-xs text-[#1A110B]"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#1A110B] block mb-1">Asal Daerah Sentra</label>
                    <input
                      type="text"
                      value={newProdRegion}
                      onChange={(e) => setNewProdRegion(e.target.value)}
                      placeholder="Contoh: Bantul, DI Yogyakarta"
                      className="clay-input w-full h-10 px-3 text-xs text-[#1A110B]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-[#1A110B] block mb-1">Foto Sampel Produk</label>
                  <select
                    value={newProdImage}
                    onChange={(e) => setNewProdImage(e.target.value)}
                    className="clay-input w-full h-10 px-3 text-xs text-[#1A110B]"
                  >
                    <option value="gerabah_kasongan_asli.jpg">Gerabah Tanah Liat Kasongan</option>
                    <option value="batik_pekalongan.jpg">Batik Cap Pekalongan</option>
                    <option value="tenun_sumba.jpg">Tenun Ikat Tradisional Sumba</option>
                    <option value="kopi_ijen.jpg">Kopi Robusta Lereng Ijen</option>
                    <option value="tas_rotan_lombok.jpg">Tas Anyaman Rotan Sasak</option>
                    <option value="dupa_atsiri.jpg">Aromaterapi Atsiri Gianyar</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#1A110B] block mb-1">Deskripsi Kerajinan &amp; Nilai Budaya</label>
                  <textarea
                    rows={3}
                    value={newProdDesc}
                    onChange={(e) => setNewProdDesc(e.target.value)}
                    placeholder="Ceritakan bahan alami, teknik pembuatan tangan, dan keistimewaan karya..."
                    className="w-full p-3 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD5] text-xs text-[#1A110B] focus:bg-white focus:outline-none"
                    required
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setAddProductModal(false)}
                    className="clay-card-flat flex-1 h-10 rounded-full font-bold text-xs text-[#6B5E52]"
                  >
                    Batal
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={submittingProduct}
                    className="clay-btn-primary flex-1 h-10 rounded-full font-bold text-xs"
                  >
                    {submittingProduct ? "Menyimpan..." : "Publikasikan Produk"}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
