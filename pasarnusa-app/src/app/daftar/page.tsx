"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { UserPlus, AlertCircle, ShoppingBag, Store, Eye, EyeOff, ArrowRight } from "lucide-react";

export default function DaftarPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();

  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"pembeli" | "penjual">("pembeli");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama, email, password, role }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal membuat akun.");
      }

      await refreshUser();

      if (role === "penjual") {
        router.push("/penjual");
      } else {
        router.push("/");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat pendaftaran.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] dark:bg-[#120F0D] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 rounded-2xl overflow-hidden border border-[#E7DFD4] dark:border-[#2C211A] shadow-xl bg-white dark:bg-[#181310]">
        
        {/* Left Side: Brand Story */}
        <div className="hidden md:flex md:col-span-5 bg-[#1A110B] text-[#EDE6D9] p-10 flex-col justify-between relative overflow-hidden">
          <div className="space-y-6 z-10">
            <Link href="/" className="inline-block">
              <span className="font-serif text-3xl font-bold tracking-tight text-white">
                Pasar<span className="text-[#C94B1A]">Nusa.</span>
              </span>
            </Link>

            <div className="space-y-2">
              <h2 className="font-serif text-3xl font-bold leading-tight text-white">
                Buat akun PasarNusa
              </h2>
              <p className="pt-2 text-sm leading-relaxed text-[#D6C7B7]">
                Pilih akun pembeli atau penjual sesuai kebutuhan Anda.
              </p>
            </div>
          </div>

          <p className="border-t border-white/10 pt-5 text-xs text-[#A89887]">Katalog produk lokal dari berbagai kategori kriya nusantara.</p>
        </div>

        {/* Right Side: Registration Form */}
        <div className="md:col-span-7 p-8 sm:p-12 flex flex-col justify-center space-y-6">
          <div className="space-y-1">
            <div className="md:hidden mb-4">
              <Link href="/" className="inline-block">
                <span className="font-serif text-2xl font-bold tracking-tight text-[#1A110B] dark:text-[#FAF7F2]">
                  Pasar<span className="text-[#C94B1A]">Nusa.</span>
                </span>
              </Link>
            </div>
            <h1 className="font-serif text-3xl font-bold text-[#1A110B] dark:text-[#FAF7F2]">
              Buat akun
            </h1>
            <p className="text-sm text-[#5C4F44] dark:text-[#C5B8AA]">
              Pilih peran dan lengkapi data profil akun Anda.
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-[#FBEAEA] dark:bg-[#381A1A] border border-[#A82A2A]/30 text-[#A82A2A] dark:text-[#FF8080] text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Pilihan Peran */}
            <div>
              <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#5C4F44] dark:text-[#C5B8AA]">Daftar sebagai</span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  aria-pressed={role === "pembeli"}
                  onClick={() => setRole("pembeli")}
                  className={`min-h-14 px-3.5 text-left flex items-center gap-3 rounded-xl border transition-all ${
                    role === "pembeli"
                      ? "bg-[#FAF2E6] dark:bg-[#251B14] border-[#B8872A]/40 dark:border-[#B8872A]/30 text-[#1A110B] dark:text-[#FAF7F2] shadow-xs"
                      : "bg-[#FAF7F2] dark:bg-[#201814] border-[#E7DFD4] dark:border-[#2C211A] text-[#5C4F44] dark:text-[#C5B8AA] hover:bg-[#EAE3D8]"
                  }`}
                >
                  <div className={`p-2 rounded-lg ${role === "pembeli" ? "bg-[#C94B1A] text-white" : "bg-white dark:bg-[#181310] text-[#6E6254]"}`}>
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold block">Pembeli</span>
                    <span className="text-[11px] opacity-80">Koleksi kriya</span>
                  </div>
                </button>

                <button
                  type="button"
                  aria-pressed={role === "penjual"}
                  onClick={() => setRole("penjual")}
                  className={`min-h-14 px-3.5 text-left flex items-center gap-3 rounded-xl border transition-all ${
                    role === "penjual"
                      ? "bg-[#FDF2EC] dark:bg-[#251710] border-[#C94B1A]/40 dark:border-[#C94B1A]/30 text-[#1A110B] dark:text-[#FAF7F2] shadow-xs"
                      : "bg-[#FAF7F2] dark:bg-[#201814] border-[#E7DFD4] dark:border-[#2C211A] text-[#5C4F44] dark:text-[#C5B8AA] hover:bg-[#EAE3D8]"
                  }`}
                >
                  <div className={`p-2 rounded-lg ${role === "penjual" ? "bg-[#C94B1A] text-white" : "bg-white dark:bg-[#181310] text-[#6E6254]"}`}>
                    <Store className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold block">Penjual</span>
                    <span className="text-[11px] opacity-80">Buka toko kriya</span>
                  </div>
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="register-name" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#5C4F44] dark:text-[#C5B8AA]">
                {role === "penjual" ? "Nama toko" : "Nama lengkap"}
              </label>
              <input
                id="register-name"
                type="text"
                required
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder={role === "penjual" ? "Nama toko" : "Nama lengkap"}
                className="h-12 w-full rounded-xl border border-[#D8CEBF] dark:border-[#2C211A] bg-[#FAF7F2] dark:bg-[#201814] px-4 text-sm text-[#1A110B] dark:text-[#FAF7F2] placeholder-[#8C7E72] dark:placeholder-[#A89887] transition focus:border-[#C94B1A] focus:ring-1 focus:ring-[#C94B1A] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="register-email" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#5C4F44] dark:text-[#C5B8AA]">
                Alamat email
              </label>
              <input
                id="register-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="h-12 w-full rounded-xl border border-[#D8CEBF] dark:border-[#2C211A] bg-[#FAF7F2] dark:bg-[#201814] px-4 text-sm text-[#1A110B] dark:text-[#FAF7F2] placeholder-[#8C7E72] dark:placeholder-[#A89887] transition focus:border-[#C94B1A] focus:ring-1 focus:ring-[#C94B1A] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="register-password" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#5C4F44] dark:text-[#C5B8AA]">
                Kata sandi
              </label>
              <div className="relative">
                <input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="h-12 w-full rounded-xl border border-[#D8CEBF] dark:border-[#2C211A] bg-[#FAF7F2] dark:bg-[#201814] px-4 pr-12 text-sm text-[#1A110B] dark:text-[#FAF7F2] placeholder-[#8C7E72] dark:placeholder-[#A89887] transition focus:border-[#C94B1A] focus:ring-1 focus:ring-[#C94B1A] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-1 top-1 flex h-10 w-10 items-center justify-center text-[#8C7E72] hover:text-[#1A110B] dark:hover:text-white"
                  aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#C94B1A] hover:bg-[#B33F14] px-4 text-sm font-bold text-white shadow-xs hover:shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              <span>{loading ? "Mendaftarkan Akun..." : "Daftar Akun PasarNusa"}</span>
            </button>
          </form>

          <div className="pt-1 text-center text-xs text-[#8C7E72] dark:text-[#9C9084]">
            Sudah memiliki akun?{" "}
            <Link href="/masuk" className="font-bold text-[#C94B1A] hover:underline inline-flex items-center gap-1">
              Masuk di sini <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
