import React from "react";
import Link from "next/link";
import Navbar from "@/frontend/components/Navbar";
import Footer from "@/frontend/components/Footer";
import { MapPin, ShoppingBag } from "lucide-react";

export default function TentangKamiPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F3EC]">
      <Navbar />

      <main className="flex-1 py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1200px] space-y-16">
          <section className="grid gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-end">
            <h1 className="max-w-xl font-serif text-5xl font-bold leading-[1.02] tracking-tight text-[#1A1008] sm:text-6xl">Tentang PasarNusa</h1>
            <p className="max-w-xl text-lg leading-relaxed text-[#493D31]">
              PasarNusa adalah katalog daring untuk produk kriya, wastra, kuliner, dan perawatan dari berbagai daerah di Indonesia.
            </p>
          </section>

          <section className="grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-center">
            <img src="/Pasar_1.jpg" alt="Suasana pasar tradisional Indonesia" className="aspect-[4/3] w-full object-cover" />
            <div className="space-y-5 md:pl-6">
              <h2 className="font-serif text-3xl font-semibold leading-tight text-[#1A1008]">Satu tempat untuk melihat katalog lokal</h2>
              <p className="text-base leading-relaxed text-[#493D31]">Setiap produk menampilkan informasi yang tersedia di katalog, seperti nama, kategori, harga, stok, dan daerah asal.</p>
              <Link href="/#katalog" className="inline-flex min-h-11 items-center font-semibold text-[#A83B14] underline underline-offset-4">Lihat katalog</Link>
            </div>
          </section>

          <section className="grid gap-x-12 gap-y-8 border-y border-[#CFC4B5] py-8 md:grid-cols-2">
            <div>
              <div className="flex items-center gap-3">
                <ShoppingBag className="h-5 w-5 text-[#A83B14]" />
                <h2 className="font-serif text-2xl font-semibold text-[#1A1008]">Belanja produk</h2>
              </div>
              <p className="mt-3 text-base leading-relaxed text-[#493D31]">Pilih produk dari katalog, lihat rincian yang dicantumkan penjual, lalu masukkan ke keranjang.</p>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-[#A83B14]" />
                <h2 className="font-serif text-2xl font-semibold text-[#1A1008]">Asal produk</h2>
              </div>
              <p className="mt-3 text-base leading-relaxed text-[#493D31]">Daerah asal ditampilkan berdasarkan keterangan pada produk. Hubungi toko untuk pertanyaan tentang bahan, proses, atau pengiriman.</p>
            </div>
          </section>

          {/* Regional Hubs Banner */}
          <div className="bg-[#1A1008] rounded-3xl p-8 sm:p-12 text-[#EDE6D9] flex flex-col md:flex-row items-center justify-between gap-8 shadow-artisan-lg">
            <div className="max-w-xl space-y-3">
              <h2 className="font-serif text-2xl font-semibold text-white sm:text-3xl">Punya produk untuk dicantumkan?</h2>
              <p className="text-base leading-relaxed text-[#E3D9CC]">Buat akun penjual untuk menambahkan produk dan mengelola stok toko.</p>
            </div>

            <Link
              href="/daftar"
              className="inline-flex min-h-11 shrink-0 items-center rounded-xl bg-[#C94B1A] hover:bg-[#B33F14] px-6 text-sm font-bold text-white hover:shadow-md transition-all active:scale-[0.98]"
            >
              Daftar Sebagai Penjual
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
