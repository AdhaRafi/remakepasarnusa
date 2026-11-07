"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/frontend/context/AuthContext";
import { LogIn, AlertCircle, Eye, EyeOff, ArrowRight } from "lucide-react";

export default function MasukPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal masuk ke akun.");
      }

      await refreshUser();

      if (data.user.role === "admin") {
        router.push("/admin");
      } else if (data.user.role === "penjual") {
        router.push("/penjual");
      } else {
        router.push("/");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat masuk.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] dark:bg-[#120F0D] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 rounded-2xl overflow-hidden border border-[#E7DFD4] dark:border-[#2C211A] bg-white dark:bg-[#181310]">
        
        {/* Left Side: Brand & Visual Accent */}
        <div className="hidden md:flex md:col-span-5 bg-[#1A110B] text-[#EDE6D9] p-10 flex-col justify-between relative overflow-hidden">
          <div className="space-y-6 z-10">
            <Link href="/" className="inline-block">
              <span className="font-serif text-3xl font-bold tracking-tight text-white">
                Pasar<span className="text-[#C94B1A]">Nusa.</span>
              </span>
            </Link>

            <div className="space-y-2">
              <h2 className="font-serif text-3xl font-bold leading-tight text-white">
                Masuk ke PasarNusa
              </h2>
              <p className="pt-2 text-sm leading-relaxed text-[#D6C7B7]">
                Lihat katalog, kelola pesanan, atau buka etalase tokomu.
              </p>
            </div>
          </div>

          <p className="border-t border-white/10 pt-5 text-xs text-[#A89887]">Kriya, wastra, kuliner, dan produk perawatan lokal.</p>
        </div>

        {/* Right Side: Login Form */}
        <div className="md:col-span-7 p-8 sm:p-12 flex flex-col justify-center space-y-6">
          <div className="space-y-2">
            <div className="md:hidden mb-4">
              <Link href="/" className="inline-block">
                <span className="font-serif text-2xl font-bold tracking-tight text-[#1A110B] dark:text-[#FAF7F2]">
                  Pasar<span className="text-[#C94B1A]">Nusa.</span>
                </span>
              </Link>
            </div>
            <h1 className="font-serif text-3xl font-bold text-[#1A110B] dark:text-[#FAF7F2]">
              Masuk akun
            </h1>
            <p className="text-sm text-[#5C4F44] dark:text-[#C5B8AA]">
              Gunakan email dan kata sandi akun Anda.
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-[#FBEAEA] dark:bg-[#381A1A] border border-[#A82A2A]/30 text-[#A82A2A] dark:text-[#FF8080] text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="mb-1.5 block text-xs font-bold text-[#5C4F44] dark:text-[#C5B8AA]">
                Alamat email
              </label>
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="h-12 w-full rounded-xl border border-[#D8CEBF] dark:border-[#2C211A] bg-[#FAF7F2] dark:bg-[#201814] px-4 text-sm text-[#1A110B] dark:text-[#FAF7F2] placeholder-[#8C7E72] dark:placeholder-[#A89887] transition focus:border-[#C94B1A] focus:ring-1 focus:ring-[#C94B1A] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="login-password" className="mb-1.5 block text-xs font-bold text-[#5C4F44] dark:text-[#C5B8AA]">
                Kata sandi
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
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
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#C94B1A] hover:bg-[#B33F14] px-4 text-sm font-bold text-white hover:shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? "Memverifikasi..." : "Masuk ke Akun"}</span>
            </button>
          </form>

          <div className="pt-1 text-center text-xs text-[#8C7E72] dark:text-[#9C9084]">
            Belum memiliki akun?{" "}
            <Link href="/daftar" className="font-bold text-[#C94B1A] hover:underline inline-flex items-center gap-1">
              Daftar akun baru PasarNusa <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
