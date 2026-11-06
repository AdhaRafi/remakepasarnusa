"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Script from "next/script";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { MIDTRANS_CLIENT_KEY } from "@/lib/midtrans";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Truck,
  CreditCard,
  ShieldCheck,
} from "lucide-react";

declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        options: {
          onSuccess?: (result: unknown) => void;
          onPending?: (result: unknown) => void;
          onError?: (result: unknown) => void;
          onClose?: () => void;
        }
      ) => void;
    };
  }
}

export default function KeranjangPage() {
  const { user } = useAuth();
  const {
    items,
    updateQty,
    removeFromCart,
    clearCart,
    totalItems,
    subtotal,
    totalAmount,
  } = useCart();

  const [step, setStep] = useState<"keranjang" | "pengiriman" | "konfirmasi" | "menunggu">("keranjang");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successOrder, setSuccessOrder] = useState<{
    orderNumber: string;
    totalAmount: number;
    paymentMethod: string;
  } | null>(null);

  // Shipping Form State
  const [recipientName, setRecipientName] = useState(user?.nama || "");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [notes, setNotes] = useState("");
  const paymentMethod = "midtrans" as const;

  // Load user profile pre-fill if available
  useEffect(() => {
    if (user) {
      fetch("/api/profile")
        .then((r) => {
          if (!r.ok) throw new Error("Profil tidak dapat dimuat.");
          return r.json();
        })
        .then((data) => {
          if (data.user) {
            if (data.user.nama) setRecipientName(data.user.nama);
            if (data.user.no_hp) setPhone(data.user.no_hp);
            if (data.user.alamat) setAddress(data.user.alamat);
            if (data.user.kota) setCity(data.user.kota);
            if (data.user.provinsi) setProvince(data.user.provinsi);
            if (data.user.kode_pos) setPostalCode(data.user.kode_pos);
          }
        })
        .catch(() => setErrorMessage("Alamat tersimpan tidak dapat dimuat. Silakan isi alamat secara manual."));
    }
  }, [user]);

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const payload = {
        items: items.map((i) => ({ id: i.id, qty: i.qty })),
        nama_penerima: recipientName,
        no_hp: phone,
        alamat: address,
        kota: city,
        provinsi: province,
        kode_pos: postalCode,
        catatan: notes,
        kurir: "",
        metode_pembayaran: paymentMethod,
      };

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.details) {
          throw new Error(data.details.join(", "));
        }
        throw new Error(data.error || "Gagal memproses pesanan.");
      }

      // If Midtrans payment
      if (data.snapToken && window.snap) {
        window.snap.pay(data.snapToken, {
          onSuccess: () => {
            setSuccessOrder({
              orderNumber: data.orderNumber,
              totalAmount: data.totalAmount,
              paymentMethod: "Pembayaran diterima oleh Midtrans, menunggu verifikasi server",
            });
            setStep("menunggu");
          },
          onPending: () => {
            setSuccessOrder({
              orderNumber: data.orderNumber,
              totalAmount: data.totalAmount,
              paymentMethod: "Menunggu pembayaran",
            });
            setStep("menunggu");
          },
          onError: () => {
            setSuccessOrder({
              orderNumber: data.orderNumber,
              totalAmount: data.totalAmount,
              paymentMethod: "Pembayaran belum terkonfirmasi. Hubungi admin sebelum mencoba lagi.",
            });
            setStep("menunggu");
          },
          onClose: () => {
            setSuccessOrder({
              orderNumber: data.orderNumber,
              totalAmount: data.totalAmount,
              paymentMethod: "Pembayaran belum selesai",
            });
            setStep("menunggu");
          },
        });
      } else {
        setErrorMessage("Jendela pembayaran belum tersedia. Keranjang tetap tersimpan, coba muat ulang lalu kirim ulang pesanan.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat memproses pesanan.";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F3EC]">
      <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={MIDTRANS_CLIENT_KEY}
        strategy="lazyOnload"
      />

      <Navbar />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Breadcrumb Steps */}
          <nav aria-label="Tahapan Belanja" className="mb-8">
            <ol className="flex items-center justify-center gap-3 text-xs sm:text-sm font-semibold">
              <li className={`flex items-center gap-1.5 ${step === "keranjang" ? "text-[#C94B1A]" : "text-[#6E6254]"}`}>
                <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs">1</span>
                Keranjang Belanja
              </li>
              <li className="text-[#DFD7CA]">›</li>
              <li className={`flex items-center gap-1.5 ${step === "pengiriman" ? "text-[#C94B1A]" : "text-[#6E6254]"}`}>
                <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs">2</span>
                Pengiriman & Pembayaran
              </li>
              <li className="text-[#DFD7CA]">›</li>
              <li className={`flex items-center gap-1.5 ${step === "konfirmasi" || step === "menunggu" ? "text-[#246E4A]" : "text-[#493D31]"}`}>
                <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs">3</span>
                Status Pesanan
              </li>
            </ol>
          </nav>

          {/* STEP 3: ORDER SUCCESS */}
          {(step === "konfirmasi" || step === "menunggu") && successOrder ? (
            <div className="mx-auto max-w-xl space-y-6 bg-white p-8 text-center sm:p-12">
              <div className="mx-auto flex h-14 w-14 items-center justify-center bg-[#EFE8DC] text-[#493D31]">
                {step === "menunggu" ? <AlertCircle className="h-7 w-7" /> : <CheckCircle2 className="h-7 w-7" />}
              </div>

              <div>
                <p className="text-sm font-semibold text-[#493D31]">{step === "menunggu" ? "Pembayaran belum selesai" : "Pesanan dibuat"}</p>
                <h1 className="mt-2 font-serif text-3xl font-semibold text-[#1A1008]">
                  Nomor pesanan {successOrder.orderNumber}
                </h1>
                <p className="mt-3 text-base text-[#493D31]">
                  Status pembayaran: {successOrder.paymentMethod}.
                </p>
              </div>

              <div className="p-5 bg-[#FAF5EB] rounded-2xl border border-[#DFD7CA] text-left space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#493D31]">Nomor pesanan:</span>
                  <span className="font-semibold text-[#1A1008]">{successOrder.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-[#493D31]">Pembayaran:</span>
                  <span className="font-medium text-[#1A1008]">{successOrder.paymentMethod}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[#DFD7CA]">
                  <span className="font-semibold text-[#493D31]">Total:</span>
                  <span className="font-extrabold text-[#C94B1A]">
                    Rp {successOrder.totalAmount.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  href="/"
                  className="flex-1 py-3 text-xs font-bold uppercase tracking-wider text-[#1A1008] bg-[#F7F3EC] hover:bg-[#EFE8DC] border border-[#DFD7CA] rounded-xl transition text-center"
                >
                  Kembali ke Beranda
                </Link>
                <Link
                  href="/profil"
                  className="flex min-h-12 flex-1 items-center justify-center rounded-xl bg-[#C94B1A] hover:bg-[#B33F14] px-4 py-3 text-sm font-bold text-white shadow-xs transition-colors"
                >
                  Lihat Riwayat Pesanan
                </Link>
              </div>
            </div>
          ) : items.length === 0 ? (
            /* EMPTY CART STATE */
            <div className="bg-white rounded-3xl p-12 border border-[#DFD7CA] text-center max-w-lg mx-auto space-y-5 shadow-artisan">
              <div className="w-16 h-16 rounded-full bg-[#FAF5EB] text-[#B8872A] flex items-center justify-center mx-auto text-2xl">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h2 className="font-serif text-2xl font-semibold text-[#1A1008]">
                Keranjang kosong
              </h2>
              <p className="text-base leading-relaxed text-[#493D31]">
                Pilih produk dari katalog untuk mulai membuat pesanan.
              </p>
              <Link
                href="/#katalog"
                className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#C94B1A] hover:bg-[#B33F14] px-6 py-3 text-sm font-bold text-white shadow-xs transition-colors"
              >
                Lihat Katalog Kriya
              </Link>
            </div>
          ) : (
            /* ACTIVE CART / CHECKOUT LAYOUT */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Cart Items (Step 1) OR Shipping Form (Step 2) */}
              <div className="lg:col-span-7 space-y-6">
                
                {errorMessage && (
                  <div className="p-4 rounded-xl bg-[#FBEAEA] border border-[#A82A2A]/30 text-[#A82A2A] text-sm flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-semibold">Perhatian</strong>
                      <span>{errorMessage}</span>
                    </div>
                  </div>
                )}

                {step === "keranjang" ? (
                  /* STEP 1: CART ITEMS LIST */
                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DFD7CA] shadow-artisan space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-[#DFD7CA]">
                      <h1 className="font-serif text-2xl font-bold text-[#1A1008]">
                        Daftar Pesanan ({totalItems} item)
                      </h1>
                      <button
                        type="button"
                        onClick={clearCart}
                        className="text-xs font-semibold text-[#A82A2A] hover:underline"
                      >
                        Kosongkan Keranjang
                      </button>
                    </div>

                    <div className="divide-y divide-[#DFD7CA]">
                      {items.map((item) => (
                        <div key={item.id} className="py-4 flex gap-4 items-center">
                          {/* Thumbnail */}
                          <div className="w-20 h-20 rounded-xl bg-[#EFE8DC] overflow-hidden flex-shrink-0 border border-[#DFD7CA]">
                            <img
                              src={`/uploads/produk/${item.foto_produk}`}
                              alt={item.nama_produk}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = "/pasar.jpg";
                              }}
                            />
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <span className="text-[11px] font-bold text-[#8A5912] uppercase tracking-wider block">
                              {item.kategori}
                            </span>
                            <h3 className="text-sm font-bold text-[#1A1008] truncate">
                              {item.nama_produk}
                            </h3>
                            <p className="text-xs font-semibold text-[#C94B1A] mt-0.5">
                              Rp {item.harga.toLocaleString("id-ID")}
                            </p>
                          </div>

                          {/* Qty controls */}
                          <div className="flex items-center border border-[#DFD7CA] rounded-xl overflow-hidden bg-[#F7F3EC]">
                            <button
                              type="button"
                              onClick={() => updateQty(item.id, item.qty - 1)}
                              className="p-2 text-[#1A1008] hover:bg-[#EFE8DC] transition min-w-[36px] min-h-[36px] flex items-center justify-center"
                              aria-label="Kurang satu"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-3 text-xs font-bold text-[#1A1008]">{item.qty}</span>
                            <button
                              type="button"
                              onClick={() => updateQty(item.id, item.qty + 1)}
                              className="p-2 text-[#1A1008] hover:bg-[#EFE8DC] transition min-w-[36px] min-h-[36px] flex items-center justify-center"
                              aria-label="Tambah satu"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Subtotal & Delete */}
                          <div className="text-right flex flex-col items-end gap-1 min-w-[80px]">
                            <span className="text-xs font-extrabold text-[#1A1008]">
                              Rp {(item.harga * item.qty).toLocaleString("id-ID")}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeFromCart(item.id)}
                              className="min-h-[44px] min-w-[44px] p-2 text-[#6E6254] hover:text-[#A82A2A] rounded-xl transition flex items-center justify-center"
                              title="Hapus Produk"
                              aria-label={`Hapus ${item.nama_produk}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 flex justify-between items-center">
                      <Link
                        href="/#produk"
                        className="text-xs font-bold uppercase tracking-wider text-[#C94B1A] hover:underline"
                      >
                        ← Lanjut Belanja
                      </Link>
                      <button
                        type="button"
                        onClick={() => setStep("pengiriman")}
                        className="min-h-[44px] px-6 py-2.5 bg-[#C94B1A] hover:bg-[#B33F14] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition flex items-center gap-2 shadow-sm"
                      >
                        Lanjut ke Pengiriman
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* STEP 2: SHIPPING & PAYMENT FORM */
                  <form onSubmit={handleCheckoutSubmit} className="space-y-6">
                    {/* Alamat Pengiriman */}
                    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DFD7CA] shadow-artisan space-y-5">
                      <div className="flex items-center justify-between pb-3 border-b border-[#DFD7CA]">
                        <h2 className="font-serif text-xl font-bold text-[#1A1008] flex items-center gap-2">
                          <Truck className="w-5 h-5 text-[#C94B1A]" />
                          Alamat Pengiriman
                        </h2>
                        <button
                          type="button"
                          onClick={() => setStep("keranjang")}
                          className="text-xs font-bold text-[#C94B1A] hover:underline"
                        >
                          Ubah Keranjang
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-[#6E6254] mb-1.5">
                            Nama Penerima *
                          </label>
                          <input
                            type="text"
                            required
                            value={recipientName}
                            onChange={(e) => setRecipientName(e.target.value)}
                            placeholder="Contoh: Budi Santoso"
                            className="w-full bg-[#F7F3EC] border border-[#DFD7CA] rounded-xl px-4 py-2.5 text-sm text-[#1A1008] focus:border-[#C94B1A] focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-[#6E6254] mb-1.5">
                            Nomor WhatsApp / HP *
                          </label>
                          <input
                            type="tel"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Contoh: 08123456789"
                            className="w-full bg-[#F7F3EC] border border-[#DFD7CA] rounded-xl px-4 py-2.5 text-sm text-[#1A1008] focus:border-[#C94B1A] focus:outline-none"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold uppercase tracking-wider text-[#6E6254] mb-1.5">
                            Alamat Lengkap *
                          </label>
                          <textarea
                            required
                            rows={3}
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Nama jalan, nomor rumah, RT/RW, patokan lokasi..."
                            className="w-full bg-[#F7F3EC] border border-[#DFD7CA] rounded-xl px-4 py-2.5 text-sm text-[#1A1008] focus:border-[#C94B1A] focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-[#6E6254] mb-1.5">
                            Kota / Kabupaten *
                          </label>
                          <input
                            type="text"
                            required
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="Jakarta Selatan"
                            className="w-full bg-[#F7F3EC] border border-[#DFD7CA] rounded-xl px-4 py-2.5 text-sm text-[#1A1008] focus:border-[#C94B1A] focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-[#6E6254] mb-1.5">
                            Provinsi *
                          </label>
                          <input
                            type="text"
                            required
                            value={province}
                            onChange={(e) => setProvince(e.target.value)}
                            placeholder="DKI Jakarta"
                            className="w-full bg-[#F7F3EC] border border-[#DFD7CA] rounded-xl px-4 py-2.5 text-sm text-[#1A1008] focus:border-[#C94B1A] focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-[#6E6254] mb-1.5">
                            Kode Pos *
                          </label>
                          <input
                            type="text"
                            required
                            value={postalCode}
                            onChange={(e) => setPostalCode(e.target.value)}
                            placeholder="12150"
                            className="w-full bg-[#F7F3EC] border border-[#DFD7CA] rounded-xl px-4 py-2.5 text-sm text-[#1A1008] focus:border-[#C94B1A] focus:outline-none"
                          />
                        </div>



                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold uppercase tracking-wider text-[#6E6254] mb-1.5">
                            Catatan untuk Penjual (Opsional)
                          </label>
                          <input
                            type="text"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Contoh: Titipkan di pos satpam, bungkus kado..."
                            className="w-full bg-[#F7F3EC] border border-[#DFD7CA] rounded-xl px-4 py-2.5 text-sm text-[#1A1008] focus:border-[#C94B1A] focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Metode Pembayaran */}
                    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DFD7CA] shadow-artisan space-y-4">
                      <h2 className="font-serif text-xl font-bold text-[#1A1008] flex items-center gap-2 pb-3 border-b border-[#DFD7CA]">
                        <CreditCard className="w-5 h-5 text-[#C94B1A]" />
                        Metode Pembayaran
                      </h2>

                      <div className="bg-[#EFE8DC] px-4 py-4 text-base text-[#33271D]">
                        {MIDTRANS_CLIENT_KEY ? "Pembayaran diproses oleh Midtrans. Status lunas mengikuti konfirmasi penyedia pembayaran." : "Pembayaran online belum tersedia. Pengelola toko perlu mengatur Midtrans terlebih dahulu."}
                      </div>

                      <div className="pt-4 space-y-3">
                        <button
                          type="submit"
                          disabled={loading || !MIDTRANS_CLIENT_KEY}
                          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#C94B1A] hover:bg-[#B33F14] px-6 py-3.5 text-sm font-bold text-white shadow-xs hover:shadow-md transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-[#B8AFA3]"
                        >
                          {loading ? (
                            <span>Memproses Pesanan...</span>
                          ) : (
                            <>
                              <ShieldCheck className="w-4 h-4" />
                              Konfirmasi & Bayar (Rp {totalAmount.toLocaleString("id-ID")})
                            </>
                          )}
                        </button>

                        <div className="text-center">
                          <button
                            type="button"
                            onClick={() => setStep("keranjang")}
                            className="min-h-[44px] text-xs font-bold uppercase tracking-wider text-[#6E6254] hover:text-[#1A1008] transition"
                          >
                            ← Kembali ke Daftar Keranjang
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                )}
              </div>

              {/* Right Column: Order Summary */}
              <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-[#DFD7CA] shadow-artisan space-y-6 sticky top-28">
                <h2 className="font-serif text-xl font-bold text-[#1A1008] pb-3 border-b border-[#DFD7CA]">
                  Ringkasan Belanja
                </h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-[#6E6254]">
                    <span>Total Harga ({totalItems} barang)</span>
                    <span className="font-medium text-[#1A1008]">
                      Rp {subtotal.toLocaleString("id-ID")}
                    </span>
                  </div>




                  <div className="pt-4 border-t border-[#DFD7CA] flex justify-between items-baseline">
                    <div>
                      <span className="text-sm font-medium text-[#493D31]">Total produk</span>
                    </div>
                    <span className="text-2xl font-black text-[#C94B1A]">
                      Rp {totalAmount.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
