# PasarNusa — Platform Marketplace Kriya & Produk UMKM Nusantara

Selamat datang di versi remake modern dari **PasarNusa**. Proyek ini telah dibangun ulang secara menyeluruh dari basis PHP prosedural lama menjadi arsitektur web modern fullstack dengan performa tinggi, type-safety menyeluruh, struktur database terstandarisasi, dan desain visual otentik Nusantara yang mematuhi pedoman anti-slop.

---

## 1. Tech Stack Modern

- **Frontend & Server Framework**: [Next.js 15 (App Router, Turbopack)](https://nextjs.org/) dengan **TypeScript**.
- **Styling & Design System**: [Tailwind CSS v4](https://tailwindcss.com/) dengan palet kriya nusantara (Terakota, Warm Cream, Antique Gold, Deep Espresso).
- **Tipografi**: `Playfair Display` (editorial serif untuk judul & aksen craftsmanship) dipadukan dengan `Plus Jakarta Sans` (digital UI readability).
- **Database Engine**: [SQLite (via better-sqlite3)](https://github.com/WiseLibs/better-sqlite3) yang tertanam secara lokal dengan mode WAL (Write-Ahead Logging), integritas foreign keys, dan zero-friction deployment.
- **Autentikasi & Keamanan**: Password hashing dengan **bcrypt** dan session token terenkripsi menggunakan **JWT** yang disimpan dalam HTTP-only Cookie.
- **Payment Gateway**: Integrasi **Midtrans Snap Sandbox** (QRIS, GoPay, ShopeePay, Virtual Account Bank) dengan opsi fallback COD (Bayar di Tempat) dan Transfer Bank.

---

## 2. Struktur Proyek

```text
d:\pasarnusa\
├── pasarnusa-app/                # Aplikasi Utama Next.js 15
│   ├── data/                     # Database lokal SQLite (pasarnusa.db)
│   ├── public/
│   │   ├── uploads/produk/       # Aset foto asli produk kriya & wastra
│   │   ├── uploads/profil/       # Aset foto avatar pengguna
│   │   ├── pasar.jpg             # Hero visual pasar tradisional
│   │   └── Pasar_1.jpg           # Aset visual tentang kami
│   ├── src/
│   │   ├── app/
│   │   │   ├── admin/            # Panel Pengendali Administrator
│   │   │   ├── penjual/          # Studio Pengelolaan Toko Mitra Pengrajin
│   │   │   ├── keranjang/        # Checkout flow bertahap & Midtrans Snap
│   │   │   ├── profil/           # Profil akun & riwayat transaksi pesanan
│   │   │   ├── masuk/            # Autentikasi Masuk dengan Quick Demo Switcher
│   │   │   ├── daftar/           # Registrasi Pembeli & Penjual
│   │   │   ├── tentang-kami/     # Kisah dan manifesto nilai PasarNusa
│   │   │   ├── api/              # Route Handlers API (auth, products, orders, checkout, upload, admin)
│   │   │   ├── layout.tsx        # Root Layout & Provider Contexts
│   │   │   └── page.tsx          # Beranda Marketplace Terkurasi
│   │   ├── components/           # Navbar, Footer, ProductCard, ProductDetailModal
│   │   ├── context/              # AuthContext & CartContext (real-time stock guard)
│   │   └── lib/                  # db.ts (SQLite schema & seeders), auth.ts, midtrans.ts
├── legacy/                       # Arsip file proyek PHP legacy lama
├── DESIGN.md                     # Panduan arah identitas visual & antislop dials
└── GEMINI.md                     # Pedoman proyek & pointer antislop
```

---

## 3. Cara Menjalankan Aplikasi

1. Buka terminal di folder `pasarnusa-app`:
   ```bash
   cd pasarnusa-app
   ```
2. Jalankan server development:
   ```bash
   npm run dev
   ```
   Atau untuk versi build produksi berkecepatan tinggi:
   ```bash
   npm run build
   npm start
   ```
3. Buka peramban di `http://localhost:3000`.

---

## 4. Akun Demo untuk Pengujian Cepat

Pada halaman login (`/masuk`), tersedia tombol cepat **Akses Cepat Demo Akun** untuk mempermudah pengujian:

| Peran | Alamat Email | Kata Sandi | Akses Utama |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@pasarnusa.id` | `admin123` | Dashboard Admin (`/admin`), moderasi produk, kelola pengguna, validasi transaksi |
| **Penjual (Artisan)** | `batik.danar@pasarnusa.id` | `pasar123` | Studio Toko (`/penjual`), tambah & edit produk, ubah stok cepat, proses pesanan masuk |
| **Pembeli** | `budi.santoso@gmail.com` | `pasar123` | Belanja katalog (`/`), keranjang & checkout (`/keranjang`), riwayat transaksi (`/profil`) |

---

## 5. Kepatuhan Standar Antislop

- **R-02 (Copywriting)**: Bebas total dari karakter em dash di seluruh antarmuka. Bahasa Indonesia ditulis secara alami, ramah, dan membumi.
- **R-03 (Responsivitas)**: Semua tombol memiliki area sentuh minimum 44px, grid responsif reflow dari ponsel cerdas hingga monitor lebar tanpa overflow horizontal.
- **R-17 & R-18 (Data Nyata)**: Tidak ada statistik palsu atau ulasan fiktif dengan avatar AI. Seluruh metrik berasal langsung dari database aktif.
- **R-24 & R-26 (Navigasi & Interaktivitas Nyata)**: Seluruh tombol, filter, tab, form, dan modal memiliki tujuan nyata dan telah terverifikasi secara end-to-end.
- **R-27 (Kelengkapan Status)**: Setiap tampilan data dilengkapi penanganan status Kosong (Empty State), Memuat (Loading State), dan Galat (Error State).
- **R-35 (Verifikasi)**: Seluruh alur mulai dari registrasi, login, penambahan produk, pemesanan checkout, hingga perubahan status order telah diuji dan berjalan sukses.
