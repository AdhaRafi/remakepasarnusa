import React from "react";
import Link from "next/link";
import { ShieldCheck, MapPin, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#F3ECE2] dark:bg-[#110D09] text-[#1A110B] dark:text-[#FAF7F2] border-t border-[#E2D6C6] dark:border-[#261B12] transition-colors duration-300">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-7 lg:px-10 py-16">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <img
                src="/logo-jake.png"
                alt="Logo PasarNusa"
                className="h-8 w-auto object-contain transition-transform duration-300 group-hover:scale-105 select-none"
              />
              <span className="font-serif text-3xl font-bold tracking-tight text-[#1A110B] dark:text-white leading-none">
                Pasar<span className="text-[#C94B1A]">Nusa.</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-[#6B5C4E] dark:text-[#B3A494] max-w-sm">
              Platform kurasi mahakarya kriya, wastra, dan produk unggulan UMKM nusantara. Menghubungkan langsung perajin tradisional dengan pencinta seni budaya Indonesia.
            </p>
            <div className="flex items-center gap-2 pt-2 text-xs text-[#827161] dark:text-[#8A7969]">
              <MapPin className="w-3.5 h-3.5 text-[#C94B1A] flex-shrink-0" />
              <span>Gedung Sarinah Lt. 5, Jl. M.H. Thamrin, Jakarta Pusat</span>
            </div>
          </div>

          {/* Column 1: Kategori */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-[#A83B14] dark:text-[#E06334]">
              Kategori Kriya
            </h4>
            <ul className="space-y-2.5 text-xs text-[#6B5C4E] dark:text-[#B3A494]">
              <li>
                <Link href="/?kategori=Kerajinan#katalog" className="hover:text-[#C94B1A] dark:hover:text-white transition-colors">
                  Tembikar &amp; Gerabah Kasongan
                </Link>
              </li>
              <li>
                <Link href="/?kategori=Fashion#katalog" className="hover:text-[#C94B1A] dark:hover:text-white transition-colors">
                  Batik Tulis &amp; Tenun Sumba
                </Link>
              </li>
              <li>
                <Link href="/?kategori=Kuliner#katalog" className="hover:text-[#C94B1A] dark:hover:text-white transition-colors">
                  Kopi Robusta Lereng Ijen
                </Link>
              </li>
              <li>
                <Link href="/?kategori=Kecantikan#katalog" className="hover:text-[#C94B1A] dark:hover:text-white transition-colors">
                  Aromaterapi &amp; Dupa Herbal Bali
                </Link>
              </li>
              <li>
                <Link href="/?kategori=Lainnya#katalog" className="hover:text-[#C94B1A] dark:hover:text-white transition-colors">
                  Anyaman Serat Bambu &amp; Rotan
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Perusahaan */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-[#A83B14] dark:text-[#E06334]">
              PasarNusa
            </h4>
            <ul className="space-y-2.5 text-xs text-[#6B5C4E] dark:text-[#B3A494]">
              <li>
                <Link href="/tentang-kami" className="hover:text-[#C94B1A] dark:hover:text-white transition-colors">
                  Tentang Kami &amp; Misi
                </Link>
              </li>
              <li>
                <Link href="/tentang-kami" className="hover:text-[#C94B1A] dark:hover:text-white transition-colors">
                  Mitra Pengrajin Desa
                </Link>
              </li>
              <li>
                <Link href="/masuk" className="hover:text-[#C94B1A] dark:hover:text-white transition-colors">
                  Masuk ke Akun
                </Link>
              </li>
              <li>
                <Link href="/daftar" className="hover:text-[#C94B1A] dark:hover:text-white transition-colors">
                  Daftar Pembeli / Penjual
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Dukungan & Jaminan */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-[#A83B14] dark:text-[#E06334]">
              Jaminan Pelanggan
            </h4>
            <div className="space-y-3 text-xs text-[#6B5C4E] dark:text-[#B3A494]">
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-[#246E4A] dark:text-[#389E6B] flex-shrink-0 mt-0.5" />
                <span>Karya pengrajin yang dikurasi langsung dari sentra produksi</span>
              </div>
              <div className="flex items-start gap-2">
                <Heart className="w-4 h-4 text-[#C94B1A] flex-shrink-0 mt-0.5" />
                <span>Seluruh Transaksi Memberdayakan Ekonomi Kreatif Daerah</span>
              </div>
              <p className="pt-2 text-[11px] text-[#827161] dark:text-[#8A7969]">
                Bantuan &amp; Konsultasi:<br />
                <span className="font-semibold text-[#1A110B] dark:text-white">halo@pasarnusa.id</span>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-[#E2D6C6] dark:border-[#261B12] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs text-[#827161] dark:text-[#8A7969]">
          <p>&copy; {new Date().getFullYear()} PasarNusa. Hak cipta dilindungi undang-undang.</p>
          <p className="flex items-center gap-1.5">
            <span>Didedikasikan untuk Pelestarian Kriya Nusantara</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
