"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/frontend/components/Navbar";
import Footer from "@/frontend/components/Footer";
import { useAuth } from "@/frontend/context/AuthContext";
import { Product, Order } from "@/shared/db";
import { resolveProductImage } from "@/shared/media";
import {
  Store,
  Plus,
  Package,
  Edit2,
  Trash2,
  Upload,
  Search,
  AlertCircle,
  X,
} from "lucide-react";

export default function PenjualPage() {
  const { user, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<"produk" | "pesanan">("produk");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [namaProduk, setNamaProduk] = useState("");
  const [kategori, setKategori] = useState<"Kerajinan" | "Fashion" | "Kuliner" | "Kecantikan" | "Lainnya">("Kerajinan");
  const [harga, setHarga] = useState(0);
  const [stok, setStok] = useState(0);
  const [deskripsi, setDeskripsi] = useState("");
  const [fotoProduk, setFotoProduk] = useState("");
  const [asalDaerah, setAsalDaerah] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    setLoadError(null);
    try {
      const [pRes, oRes] = await Promise.all([
        fetch(`/api/products?seller_id=${user.id}`),
        fetch("/api/orders"),
      ]);
      if (!pRes.ok || !oRes.ok) throw new Error("Data toko tidak dapat dimuat.");
      const [pData, oData] = await Promise.all([pRes.json(), oRes.json()]);
      setProducts(pData.products || []);
      setOrders(oData.orders || []);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Data toko tidak dapat dimuat.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  const openAddModal = () => {
    setEditingProduct(null);
    setNamaProduk("");
    setKategori("Kerajinan");
    setHarga(0);
    setStok(0);
    setDeskripsi("");
    setFotoProduk("");
    setAsalDaerah("");
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setNamaProduk(p.nama_produk);
    setKategori(p.kategori);
    setHarga(p.harga);
    setStok(p.stok);
    setDeskripsi(p.deskripsi);
    setFotoProduk(p.foto_produk);
    setAsalDaerah(p.asal_daerah);
    setFormError(null);
    setModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "produk");

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok && (data.url || data.fileName)) {
        setFotoProduk(data.url || data.fileName);
        setFormError(null);
      } else {
        setFormError(data.error || "Gagal mengunggah foto.");
      }
    } catch {
      setFormError("Terjadi kesalahan saat mengunggah foto.");
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      const payload = {
        nama_produk: namaProduk,
        kategori,
        harga,
        stok,
        deskripsi,
        foto_produk: fotoProduk || "/pasar.jpg",
        asal_daerah: asalDaerah,
      };

      const url = editingProduct ? `/api/products/${editingProduct.id}` : "/api/products";
      const method = editingProduct ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan produk.");

      setModalOpen(false);
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan.";
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm("Hapus produk ini dari katalog toko Anda?")) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        loadData();
      }
    } catch {
      alert("Gagal menghapus produk.");
    }
  };

  const handleQuickStock = async (id: number, newStock: number) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quick_stock: newStock }),
      });
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, stok: newStock } : p))
        );
      }
    } catch {
      alert("Gagal memperbarui stok.");
    }
  };

  const handleUpdateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        loadData();
      }
    } catch {
      alert("Gagal memperbarui status order.");
    }
  };

  if (authLoading) {
    return <main className="flex min-h-[60vh] items-center justify-center bg-[#F7F3EC] px-5 text-base text-[#33271D]" role="status">Memeriksa akses toko…</main>;
  }

  if (!user || (user.role !== "penjual" && user.role !== "admin")) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF7F2] dark:bg-[#120F0D] text-[#1A110B] dark:text-[#FAF7F2] transition-colors">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="bg-white dark:bg-[#181310] p-8 rounded-2xl border border-[#E7DFD4] dark:border-[#2C211A] text-center max-w-md space-y-4">
            <div className="w-14 h-14 rounded-xl bg-[#FDF2EC] dark:bg-[#251710] text-[#C94B1A] flex items-center justify-center mx-auto border border-[#C94B1A]/20">
              <Store className="w-7 h-7" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#1A110B] dark:text-[#FAF7F2]">Akses Dikhususkan Untuk Penjual</h2>
            <p className="text-sm text-[#5C4F44] dark:text-[#C5B8AA] leading-relaxed">
              Halaman studio ini hanya dapat diakses oleh akun Penjual terverifikasi atau Administrator.
            </p>
            <div className="pt-2">
              <Link
                href="/masuk"
                className="inline-flex h-11 items-center justify-center px-6 rounded-xl bg-[#C94B1A] hover:bg-[#B33F14] text-white text-sm font-bold w-full transition-colors"
              >
                Masuk sebagai Penjual
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const filteredProducts = products.filter((p) =>
    p.nama_produk.toLowerCase().includes(search.toLowerCase()) ||
    p.kategori.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] dark:bg-[#120F0D] text-[#1A110B] dark:text-[#FAF7F2] transition-colors">
      <Navbar />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Studio Header */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DFD7CA] shadow-artisan flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <p className="text-sm font-medium text-[#493D31]">PasarNusa / Penjual</p>
              <h1 className="mt-1 font-serif text-3xl font-semibold leading-tight text-[#1A1008] sm:text-4xl">
                {user?.nama}
              </h1>
              <p className="mt-2 text-base text-[#493D31]">
                Kelola produk, stok, dan status pesanan.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="flex bg-[#F7F3EC] p-1.5 rounded-2xl border border-[#DFD7CA] flex-1 md:flex-none">
                <button
                  type="button"
                  onClick={() => setActiveTab("produk")}
                  className={`flex-1 md:flex-none px-5 py-2.5 rounded-xl text-xs font-bold transition ${
                    activeTab === "produk"
                      ? "bg-[#C94B1A] text-white"
                      : "text-[#6E6254] hover:text-[#1A1008]"
                  }`}
                >
                  Katalog Produk ({products.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("pesanan")}
                  className={`flex-1 md:flex-none px-5 py-2.5 rounded-xl text-xs font-bold transition ${
                    activeTab === "pesanan"
                      ? "bg-[#C94B1A] text-white"
                      : "text-[#6E6254] hover:text-[#1A1008]"
                  }`}
                >
                  Pesanan Masuk ({orders.length})
                </button>
              </div>

              {activeTab === "produk" && (
                <button
                  type="button"
                  onClick={openAddModal}
                  className="min-h-[44px] px-5 py-2.5 bg-[#C94B1A] hover:bg-[#B33F14] text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 flex-shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  Tambah Produk
                </button>
              )}
            </div>
          </div>

          {loadError && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 bg-[#FBEAEA] px-5 py-4 text-[#681D1D]"><p>{loadError}</p><button type="button" onClick={loadData} className="min-h-11 font-semibold underline underline-offset-4">Coba muat ulang</button></div>}
          {loading && <p role="status" className="bg-white px-5 py-4 text-base text-[#33271D]">Memuat data toko…</p>}

          {/* TAB 1: PRODUCT MANAGEMENT */}
          {!loading && !loadError && activeTab === "produk" && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DFD7CA] shadow-artisan space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-[#DFD7CA]">
                <div className="relative w-full sm:w-72">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari karya kriya toko..."
                    className="w-full bg-[#F7F3EC] border border-[#DFD7CA] rounded-xl pl-9 pr-4 py-2 text-xs text-[#1A1008] focus:border-[#C94B1A] focus:outline-none"
                  />
                  <Search className="w-3.5 h-3.5 text-[#6E6254] absolute left-3 top-2.5 pointer-events-none" />
                </div>
                <span className="text-xs text-[#6E6254]">
                  Menampilkan {filteredProducts.length} dari {products.length} produk
                </span>
              </div>

              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-[#F7F3EC] rounded-2xl animate-pulse"></div>
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="py-12 text-center max-w-sm mx-auto space-y-3">
                  <Package className="w-10 h-10 text-[#B8872A] mx-auto opacity-70" />
                  <h3 className="font-serif text-xl font-semibold text-[#1A1008]">{search ? "Tidak ada produk yang cocok" : "Katalog tokomu masih kosong"}</h3>
                  <p className="text-base text-[#493D31]">
                    {search ? "Coba kata pencarian lain." : "Tambahkan produk agar tercantum di katalog PasarNusa."}
                  </p>
                  {!search && <button
                    type="button"
                    onClick={openAddModal}
                    className="inline-flex min-h-11 items-center gap-1.5 bg-[#C94B1A] px-4 text-sm font-semibold text-white"
                  >
                    <Plus className="h-4 w-4" />
                    Tambah produk
                  </button>}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#DFD7CA] text-[#6E6254] font-bold">
                        <th className="py-3 px-3">Produk</th>
                        <th className="py-3 px-3">Kategori</th>
                        <th className="py-3 px-3">Harga</th>
                        <th className="py-3 px-3">Ketersediaan Stok</th>
                        <th className="py-3 px-3">Asal Daerah</th>
                        <th className="py-3 px-3 text-right">Tindakan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#DFD7CA]/60">
                      {filteredProducts.map((p) => (
                        <tr key={p.id} className="hover:bg-[#FAF5EB]/50 transition">
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-lg bg-[#EFE8DC] overflow-hidden flex-shrink-0 border border-[#DFD7CA]">
                                <img
                                  src={resolveProductImage(p.foto_produk)}
                                  alt={p.nama_produk}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).src = "/pasar.jpg";
                                  }}
                                />
                              </div>
                              <span className="font-bold text-[#1A1008] text-sm max-w-[200px] truncate block">
                                {p.nama_produk}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-3">
                            <span className="px-2.5 py-0.5 rounded-full bg-[#EFE8DC] text-[#1A1008] font-medium">
                              {p.kategori}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 font-bold text-[#1A1008]">
                            Rp {p.harga.toLocaleString("id-ID")}
                          </td>
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleQuickStock(p.id, Math.max(0, p.stok - 1))}
                                className="min-w-[36px] min-h-[36px] rounded-lg bg-[#F7F3EC] hover:bg-[#EFE8DC] font-bold text-xs flex items-center justify-center transition"
                                aria-label="Kurang satu stok"
                              >
                                -
                              </button>
                              <span className={`font-bold px-2 py-1 rounded text-xs ${p.stok <= 0 ? "bg-[#FBEAEA] text-[#A82A2A]" : "bg-[#EAF4EE] text-[#246E4A]"}`}>
                                {p.stok} unit
                              </span>
                              <button
                                type="button"
                                onClick={() => handleQuickStock(p.id, p.stok + 1)}
                                className="min-w-[36px] min-h-[36px] rounded-lg bg-[#F7F3EC] hover:bg-[#EFE8DC] font-bold text-xs flex items-center justify-center transition"
                                aria-label="Tambah satu stok"
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="py-3.5 px-3 text-[#6E6254]">
                            {p.asal_daerah || "Nusantara"}
                          </td>
                          <td className="py-3.5 px-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => openEditModal(p)}
                                className="min-h-[40px] min-w-[40px] p-2.5 text-[#8A5912] hover:bg-[#FAF5EB] rounded-xl transition flex items-center justify-center"
                                title="Edit Produk"
                                aria-label={`Ubah ${p.nama_produk}`}
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteProduct(p.id)}
                                className="min-h-[40px] min-w-[40px] p-2.5 text-[#A82A2A] hover:bg-[#FBEAEA] rounded-xl transition flex items-center justify-center"
                                title="Hapus Produk"
                                aria-label={`Hapus ${p.nama_produk}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: INCOMING ORDERS */}
          {!loading && !loadError && activeTab === "pesanan" && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DFD7CA] shadow-artisan space-y-6">
              <h2 className="font-serif text-xl font-bold text-[#1A1008] pb-4 border-b border-[#DFD7CA]">
                Pesanan Masuk Produk Toko Anda
              </h2>

              {orders.length === 0 ? (
                <div className="py-12 text-center max-w-sm mx-auto space-y-3">
                  <Package className="w-10 h-10 text-[#B8872A] mx-auto opacity-70" />
                  <h3 className="font-bold text-base text-[#1A1008]">Belum Ada Pesanan Masuk</h3>
                  <p className="text-xs text-[#6E6254]">
                    Pesanan dari pelanggan yang membeli produk Anda akan muncul di sini.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-5 rounded-2xl border border-[#DFD7CA] space-y-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-[#DFD7CA]/60 pb-3">
                        <div>
                          <span className="tabular-nums font-bold text-[#1A1008]">#{ord.order_number}</span>
                          <span className="text-[#6E6254] ml-2">Penerima: <strong>{ord.nama_penerima}</strong> ({ord.kota}, {ord.provinsi})</span>
                        </div>
                        <span className="px-3 py-1 bg-[#FAF5EB] text-[#B8872A] font-bold rounded-full capitalize">
                          Status: {ord.status}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs">
                        {ord.items?.map((it) => (
                          <div key={it.id} className="flex justify-between">
                            <span>{it.nama_produk} × {it.qty}</span>
                            <span className="font-bold">Rp {it.subtotal.toLocaleString("id-ID")}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#DFD7CA]/60 text-xs">
                        <span className="text-[#6E6254]">
                          Kurir Pengiriman: <strong>{ord.kurir}</strong>
                        </span>

                        <div className="flex items-center gap-2">
                          {ord.status === "pending" || ord.status === "paid" ? (
                            <button
                              type="button"
                              onClick={() => handleUpdateOrderStatus(ord.id, "diproses")}
                              className="px-3 py-1.5 bg-[#B8872A] hover:bg-[#9E7220] text-white font-bold rounded-lg transition"
                            >
                              Proses & Kemas
                            </button>
                          ) : null}

                          {ord.status === "diproses" && (
                            <button
                              type="button"
                              onClick={() => handleUpdateOrderStatus(ord.id, "dikirim")}
                              className="px-3 py-1.5 bg-[#C94B1A] hover:bg-[#B33F14] text-white font-bold rounded-lg transition"
                            >
                              Kirim ke Kurir
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* MODAL TAMBAH / EDIT PRODUK */}
      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1008]/70"
        >
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto border border-[#DFD7CA] space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#DFD7CA]">
              <h2 className="font-serif text-xl font-bold text-[#1A1008]">
                {editingProduct ? "Edit Karya Kriya" : "Tambah Karya Kriya Baru"}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-2 text-[#6E6254] hover:text-[#1A1008] rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-[#FBEAEA] text-[#A82A2A] text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#6E6254] mb-1.5">
                  Nama Produk Kriya *
                </label>
                <input
                  type="text"
                  required
                  value={namaProduk}
                  onChange={(e) => setNamaProduk(e.target.value)}
                  placeholder="Contoh: Tenun Ikat Motif Pa'teddong"
                  className="w-full bg-[#F7F3EC] border border-[#DFD7CA] rounded-xl px-4 py-2.5 text-sm text-[#1A1008] focus:border-[#C94B1A] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#6E6254] mb-1.5">
                    Rumpun Kategori *
                  </label>
                  <select
                    value={kategori}
                    onChange={(e) => setKategori(e.target.value as "Kerajinan" | "Fashion" | "Kuliner" | "Kecantikan" | "Lainnya")}
                    className="w-full bg-[#F7F3EC] border border-[#DFD7CA] rounded-xl px-4 py-2.5 text-sm text-[#1A1008] focus:border-[#C94B1A] focus:outline-none"
                  >
                    <option value="Kerajinan">Kerajinan Tangan</option>
                    <option value="Fashion">Wastra & Fashion</option>
                    <option value="Kuliner">Kuliner & Camilan</option>
                    <option value="Kecantikan">Perawatan Alami</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#6E6254] mb-1.5">
                    Asal Daerah / Sentra *
                  </label>
                  <input
                    type="text"
                    required
                    value={asalDaerah}
                    onChange={(e) => setAsalDaerah(e.target.value)}
                    placeholder="Contoh: Kasongan, Yogyakarta"
                    className="w-full bg-[#F7F3EC] border border-[#DFD7CA] rounded-xl px-4 py-2.5 text-sm text-[#1A1008] focus:border-[#C94B1A] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#6E6254] mb-1.5">
                    Harga (Rp) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1000}
                    value={harga}
                    onChange={(e) => setHarga(Number(e.target.value))}
                    className="w-full bg-[#F7F3EC] border border-[#DFD7CA] rounded-xl px-4 py-2.5 text-sm text-[#1A1008] focus:border-[#C94B1A] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#6E6254] mb-1.5">
                    Jumlah Stok Siap Kirim *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={stok}
                    onChange={(e) => setStok(Number(e.target.value))}
                    className="w-full bg-[#F7F3EC] border border-[#DFD7CA] rounded-xl px-4 py-2.5 text-sm text-[#1A1008] focus:border-[#C94B1A] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#6E6254] mb-1.5">
                  Foto Produk Kriya
                </label>
                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-[#F7F3EC] hover:bg-[#EFE8DC] border border-[#DFD7CA] rounded-xl text-xs font-bold cursor-pointer transition">
                    <Upload className="w-4 h-4 text-[#C94B1A]" />
                    Pilih File Foto
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                  <span className="text-xs text-[#6E6254] truncate max-w-xs">
                    {fotoProduk ? fotoProduk : "Belum ada file dipilih"}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#6E6254] mb-1.5">
                  Deskripsi & Cerita Produk *
                </label>
                <textarea
                  required
                  rows={4}
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  placeholder="Jelaskan bahan alami yang digunakan, filosofi motif, atau cara perawatannya..."
                  className="w-full bg-[#F7F3EC] border border-[#DFD7CA] rounded-xl px-4 py-2.5 text-sm text-[#1A1008] focus:border-[#C94B1A] focus:outline-none"
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-3 border border-[#DFD7CA] rounded-xl text-xs font-bold text-[#6E6254] hover:bg-[#F7F3EC]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-[#C94B1A] hover:bg-[#B33F14] disabled:opacity-50 text-white rounded-xl text-xs font-bold"
                >
                  {submitting ? "Menyimpan..." : "Simpan Produk"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
