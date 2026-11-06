"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { Order } from "@/lib/db";
import {
  User,
  Package,
  Save,
  Upload,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  AlertCircle,
} from "lucide-react";

export default function ProfilPage() {
  const { user, refreshUser } = useAuth();

  const [activeTab, setActiveTab] = useState<"profil" | "pesanan">("pesanan");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Profile form state
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [photo, setPhoto] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Fetch profile details
  useEffect(() => {
    fetch("/api/profile")
      .then((r) => {
        if (!r.ok) throw new Error("Profil tidak dapat dimuat.");
        return r.json();
      })
      .then((data) => {
        if (data.user) {
          setNama(data.user.nama || "");
          setEmail(data.user.email || "");
          setPhone(data.user.no_hp || "");
          setAddress(data.user.alamat || "");
          setCity(data.user.kota || "");
          setProvince(data.user.provinsi || "");
          setPostalCode(data.user.kode_pos || "");
          setPhoto(data.user.foto || "");
        }
      })
      .catch((error: unknown) => setProfileError(error instanceof Error ? error.message : "Profil tidak dapat dimuat."));
  }, []);

  // Fetch orders
  const loadOrders = async () => {
    setLoadingOrders(true);
    setOrdersError(null);
    try {
      const res = await fetch("/api/orders");
      if (!res.ok) throw new Error("Riwayat pesanan tidak dapat dimuat.");
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (error) {
      setOrdersError(error instanceof Error ? error.message : "Riwayat pesanan tidak dapat dimuat.");
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg(null);

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama,
          no_hp: phone,
          alamat: address,
          kota: city,
          provinsi: province,
          kode_pos: postalCode,
          foto: photo,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memperbarui profil.");

      await refreshUser();
      setProfileMsg({ type: "success", text: "Profil berhasil diperbarui." });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan.";
      setProfileMsg({ type: "error", text: msg });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "profil");

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.fileName) {
        setPhoto(data.fileName);
        // Otomatis simpan ke profil dan sinkronkan dengan sesi pengguna
        await fetch("/api/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nama,
            no_hp: phone,
            alamat: address,
            kota: city,
            provinsi: province,
            kode_pos: postalCode,
            foto: data.fileName,
          }),
        });
        await refreshUser();
        setProfileMsg({ type: "success", text: "Foto profil berhasil diperbarui dan tersimpan." });
      }
    } catch {
      alert("Gagal mengunggah foto profil.");
    }
  };

  const handleConfirmReceived = async (orderId: number) => {
    if (!confirm("Konfirmasi bahwa Anda telah menerima pesanan ini dengan baik?")) return;

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "selesai" }),
      });
      if (res.ok) {
        loadOrders();
      }
    } catch {
      alert("Gagal mengonfirmasi pesanan.");
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#EAF4EE] text-[#246E4A] rounded-full text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Lunas
          </span>
        );
      case "diproses":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#FAF5EB] text-[#B8872A] rounded-full text-xs font-bold">
            <Clock className="w-3.5 h-3.5" />
            Sedang Dipersiapkan
          </span>
        );
      case "dikirim":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#FDF4EF] text-[#C94B1A] rounded-full text-xs font-bold">
            <Truck className="w-3.5 h-3.5" />
            Dalam Pengiriman
          </span>
        );
      case "selesai":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#EAF4EE] text-[#246E4A] rounded-full text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Selesai
          </span>
        );
      case "dibatalkan":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#FBEAEA] text-[#A82A2A] rounded-full text-xs font-bold">
            <XCircle className="w-3.5 h-3.5" />
            Dibatalkan
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#FAF5EB] text-[#B8872A] rounded-full text-xs font-bold">
            <Clock className="w-3.5 h-3.5" />
            Menunggu Pembayaran
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F3EC]">
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-8">
          
          {/* Header Info */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DFD7CA] shadow-artisan flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-[#FAF5EB] border-2 border-[#C94B1A] overflow-hidden flex items-center justify-center flex-shrink-0 text-2xl font-bold text-[#C94B1A]">
                {photo ? (
                  <img src={`/uploads/profil/${photo}`} alt={nama} className="w-full h-full object-cover" />
                ) : (
                  nama.charAt(0).toUpperCase() || "U"
                )}
              </div>
              <div>
                <h1 className="font-serif text-2xl font-bold text-[#1A1008]">{nama || "Pengguna PasarNusa"}</h1>
                <p className="text-xs text-[#6E6254] mt-0.5">{email}</p>
                <span className="inline-block mt-2 text-[11px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full bg-[#FAF5EB] text-[#8A5912] border border-[#8A5912]/30">
                  Peran: {user?.role || "Pembeli"}
                </span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex bg-[#F7F3EC] p-1.5 rounded-2xl border border-[#DFD7CA] w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setActiveTab("pesanan")}
                className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 ${
                  activeTab === "pesanan"
                    ? "bg-[#C94B1A] text-white shadow-sm"
                    : "text-[#6E6254] hover:text-[#1A1008]"
                }`}
              >
                <Package className="w-4 h-4" />
                Riwayat Pesanan
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("profil")}
                className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 ${
                  activeTab === "profil"
                    ? "bg-[#C94B1A] text-white shadow-sm"
                    : "text-[#6E6254] hover:text-[#1A1008]"
                }`}
              >
                <User className="w-4 h-4" />
                Pengaturan Akun
              </button>
            </div>
          </div>

          {/* TAB 1: ORDER HISTORY */}
          {activeTab === "pesanan" && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DFD7CA] shadow-artisan space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#DFD7CA]">
                <h2 className="font-serif text-xl font-bold text-[#1A1008]">
                  Daftar Transaksi Saya
                </h2>
                <span className="text-xs text-[#6E6254] font-medium">
                  {orders.length} pesanan tercatat
                </span>
              </div>

              {loadingOrders ? (
                <p role="status" className="py-8 text-center text-base text-[#493D31]">Memuat riwayat pesanan…</p>
              ) : ordersError ? (
                <div role="alert" className="flex flex-col items-center gap-3 py-8 text-center">
                  <p className="text-base text-[#681D1D]">{ordersError}</p>
                  <button type="button" onClick={loadOrders} className="min-h-11 px-4 font-semibold text-[#A83B14] underline underline-offset-4">Coba lagi</button>
                </div>
              ) : orders.length === 0 ? (
                <div className="py-12 text-center max-w-sm mx-auto space-y-3">
                  <Package className="w-10 h-10 text-[#B8872A] mx-auto opacity-70" />
                  <h3 className="font-bold text-base text-[#1A1008]">Belum Ada Pesanan</h3>
                  <p className="text-xs text-[#6E6254]">
                    Anda belum pernah melakukan pemesanan karya kriya.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-5 rounded-2xl border border-[#DFD7CA] hover:border-[#C94B1A]/40 transition space-y-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-[#DFD7CA]/60 pb-3">
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-[#1A1008]">#{ord.order_number}</span>
                          <span className="text-[#6E6254]">
                            {new Date(ord.created_at).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        {renderStatusBadge(ord.status)}
                      </div>

                      {/* Item list preview */}
                      <div className="space-y-2">
                        {ord.items?.map((it) => (
                          <div key={it.id} className="flex justify-between items-center text-xs text-[#3D2B1A]">
                            <span className="font-medium">
                              {it.nama_produk} <span className="text-[#6E6254]">× {it.qty}</span>
                            </span>
                            <span className="font-semibold text-[#1A1008]">
                              Rp {it.subtotal.toLocaleString("id-ID")}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#DFD7CA]/60">
                        <div className="text-xs text-[#6E6254]">
                          <span>Kurir: <strong>{ord.kurir}</strong></span> |{" "}
                          <span>Metode: <strong className="uppercase">{ord.metode_pembayaran}</strong></span>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <span className="text-[10px] text-[#6E6254] block uppercase">Total Pesanan</span>
                            <span className="text-base font-extrabold text-[#C94B1A]">
                              Rp {ord.total_bayar.toLocaleString("id-ID")}
                            </span>
                          </div>

                          {ord.status === "dikirim" && (
                            <button
                              type="button"
                              onClick={() => handleConfirmReceived(ord.id)}
                              className="px-4 py-2 bg-[#246E4A] hover:bg-[#1E5B3D] text-white text-xs font-bold rounded-xl transition"
                            >
                              Konfirmasi Diterima
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

          {/* TAB 2: PROFILE SETTINGS */}
          {activeTab === "profil" && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DFD7CA] shadow-artisan space-y-6">
              <h2 className="font-serif text-xl font-bold text-[#1A1008] pb-4 border-b border-[#DFD7CA]">
                Perbarui Informasi Akun & Alamat Pengiriman
              </h2>

              {profileError && <p role="alert" className="bg-[#FBEAEA] px-4 py-3 text-sm text-[#681D1D]">{profileError}</p>}
              {profileMsg && (
                <div
                  className={`p-4 rounded-xl text-xs flex items-center gap-2.5 ${
                    profileMsg.type === "success"
                      ? "bg-[#EAF4EE] text-[#246E4A] border border-[#246E4A]/30"
                      : "bg-[#FBEAEA] text-[#A82A2A] border border-[#A82A2A]/30"
                  }`}
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{profileMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleProfileSubmit} className="space-y-5">
                {/* Avatar change */}
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#F7F3EC] border border-[#DFD7CA]">
                  <div className="w-14 h-14 rounded-full bg-[#FAF5EB] border border-[#B8872A] overflow-hidden flex items-center justify-center flex-shrink-0 text-xl font-bold text-[#B8872A]">
                    {photo ? (
                      <img src={`/uploads/profil/${photo}`} alt="Foto Profil" className="w-full h-full object-cover" />
                    ) : (
                      nama.charAt(0).toUpperCase() || "U"
                    )}
                  </div>
                  <div>
                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#DFD7CA] rounded-xl text-xs font-bold text-[#1A1008] hover:border-[#C94B1A] cursor-pointer transition shadow-sm">
                      <Upload className="w-3.5 h-3.5" />
                      Ganti Foto Profil
                      <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                    </label>
                    <p className="text-[11px] text-[#6E6254] mt-1">Maksimal 2MB (JPG, PNG, WEBP)</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#6E6254] mb-1.5">
                      Nama Lengkap *
                    </label>
                    <input
                      type="text"
                      required
                      value={nama}
                      onChange={(e) => setNama(e.target.value)}
                      className="w-full bg-[#F7F3EC] border border-[#DFD7CA] rounded-xl px-4 py-2.5 text-sm text-[#1A1008] focus:border-[#C94B1A] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#6E6254] mb-1.5">
                      Alamat Email (Tetap)
                    </label>
                    <input
                      type="email"
                      disabled
                      value={email}
                      className="w-full bg-[#EFE8DC]/60 border border-[#DFD7CA] rounded-xl px-4 py-2.5 text-sm text-[#6E6254] cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#6E6254] mb-1.5">
                      Nomor HP / WhatsApp
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="08123456789"
                      className="w-full bg-[#F7F3EC] border border-[#DFD7CA] rounded-xl px-4 py-2.5 text-sm text-[#1A1008] focus:border-[#C94B1A] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#6E6254] mb-1.5">
                      Kota / Kabupaten
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Surabaya"
                      className="w-full bg-[#F7F3EC] border border-[#DFD7CA] rounded-xl px-4 py-2.5 text-sm text-[#1A1008] focus:border-[#C94B1A] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#6E6254] mb-1.5">
                      Provinsi
                    </label>
                    <input
                      type="text"
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      placeholder="Jawa Timur"
                      className="w-full bg-[#F7F3EC] border border-[#DFD7CA] rounded-xl px-4 py-2.5 text-sm text-[#1A1008] focus:border-[#C94B1A] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#6E6254] mb-1.5">
                      Kode Pos
                    </label>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="60231"
                      className="w-full bg-[#F7F3EC] border border-[#DFD7CA] rounded-xl px-4 py-2.5 text-sm text-[#1A1008] focus:border-[#C94B1A] focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#6E6254] mb-1.5">
                      Alamat Pengiriman Default
                    </label>
                    <textarea
                      rows={3}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Jalan, nomor rumah, RT/RW, kecamatan..."
                      className="w-full bg-[#F7F3EC] border border-[#DFD7CA] rounded-xl px-4 py-2.5 text-sm text-[#1A1008] focus:border-[#C94B1A] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="min-h-[44px] px-6 py-2.5 bg-[#C94B1A] hover:bg-[#B33F14] disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition flex items-center gap-2 shadow-sm"
                  >
                    <Save className="w-4 h-4" />
                    {savingProfile ? "Menyimpan..." : "Simpan Perubahan"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
