-- =============================================
-- PASARNUSA SUPABASE SCHEMA & SEED DATA
-- Run this in the Supabase SQL Editor
-- =============================================


-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id BIGSERIAL PRIMARY KEY,
  nama TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'pembeli' CHECK (role IN ('pembeli', 'penjual', 'admin')),
  no_hp TEXT,
  alamat TEXT,
  kota TEXT,
  provinsi TEXT,
  kode_pos TEXT,
  foto TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PRODUK TABLE
CREATE TABLE IF NOT EXISTS public.produk (
  id BIGSERIAL PRIMARY KEY,
  id_penjual BIGINT REFERENCES public.users(id) ON DELETE CASCADE,
  nama_produk TEXT NOT NULL,
  slug TEXT NOT NULL,
  kategori TEXT NOT NULL CHECK (kategori IN ('Kerajinan', 'Fashion', 'Kuliner', 'Kecantikan', 'Lainnya')),
  harga BIGINT NOT NULL,
  stok INTEGER NOT NULL DEFAULT 0,
  deskripsi TEXT NOT NULL,
  foto_produk TEXT NOT NULL,
  asal_daerah TEXT NOT NULL DEFAULT 'Nusantara',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  id BIGSERIAL PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  id_pembeli BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
  nama_penerima TEXT NOT NULL,
  no_hp TEXT NOT NULL,
  alamat TEXT NOT NULL,
  kota TEXT NOT NULL,
  provinsi TEXT NOT NULL,
  kode_pos TEXT NOT NULL,
  catatan TEXT,
  kurir TEXT NOT NULL,
  metode_pembayaran TEXT NOT NULL DEFAULT 'cod',
  subtotal BIGINT NOT NULL,
  ongkir BIGINT NOT NULL,
  diskon BIGINT NOT NULL DEFAULT 0,
  total_bayar BIGINT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'diproses', 'dikirim', 'selesai', 'dibatalkan')),
  snap_token TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ORDER_ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT REFERENCES public.orders(id) ON DELETE CASCADE,
  id_produk BIGINT REFERENCES public.produk(id) ON DELETE SET NULL,
  nama_produk TEXT NOT NULL,
  harga BIGINT NOT NULL,
  qty INTEGER NOT NULL,
  subtotal BIGINT NOT NULL
);


-- SEED DATA: users
INSERT INTO public.users (id, nama, email, password, role, no_hp, alamat, kota, provinsi, kode_pos, foto, created_at) VALUES (1, 'Administrator PasarNusa', 'admin@pasarnusa.id', '$2b$10$COr6jArf87pnDgcd4DFEb.ctCooJqKqYFxM1FcJANnlZiyjH76MMm', 'admin', '081234567890', 'Gedung Sarinah Lt. 5, Jl. M.H. Thamrin No. 11', 'Jakarta Pusat', 'DKI Jakarta', '10350', '1793931342560_GALERY_FOTO_IWAN_FALS_JADUL.jpg', '2026-10-26 12:42:07') ON CONFLICT DO NOTHING;
INSERT INTO public.users (id, nama, email, password, role, no_hp, alamat, kota, provinsi, kode_pos, foto, created_at) VALUES (2, 'Danar Batik Heritage', 'batik.danar@pasarnusa.id', '$2b$10$COr6jArf87pnDgcd4DFEb.cV8gQFz.98J2krNAUZfJ12gDS206kc.', 'penjual', '081298765432', 'Jl. Kauman No. 42', 'Pekalongan', 'Jawa Tengah', '51112', 'seller1.png', '2026-10-26 12:42:07') ON CONFLICT DO NOTHING;
INSERT INTO public.users (id, nama, email, password, role, no_hp, alamat, kota, provinsi, kode_pos, foto, created_at) VALUES (3, 'Kriya Kasongan & Rempah', 'kriya.nusantara@pasarnusa.id', '$2b$10$COr6jArf87pnDgcd4DFEb.cV8gQFz.98J2krNAUZfJ12gDS206kc.', 'penjual', '081387654321', 'Desa Wisata Kasongan RT 03', 'Bantul', 'DI Yogyakarta', '55184', 'seller2.png', '2026-10-26 12:42:07') ON CONFLICT DO NOTHING;
INSERT INTO public.users (id, nama, email, password, role, no_hp, alamat, kota, provinsi, kode_pos, foto, created_at) VALUES (4, 'Budi Santoso', 'budi.santoso@gmail.com', '$2b$10$COr6jArf87pnDgcd4DFEb.cV8gQFz.98J2krNAUZfJ12gDS206kc.', 'pembeli', '081122334455', 'Jl. Cemara Hijau No. 18', 'Surabaya', 'Jawa Timur', '60231', 'buyer.png', '2026-10-26 12:42:07') ON CONFLICT DO NOTHING;

-- SEED DATA: produk
INSERT INTO public.produk (id, id_penjual, nama_produk, slug, kategori, harga, stok, deskripsi, foto_produk, asal_daerah, created_at, updated_at) VALUES (1, 2, 'Blouse Batik Kancing Kerah Sanghai Wanita', 'blouse-batik-kancing-kerah-sanghai-wanita', 'Fashion', 185000, 12, 'Blouse batik cap motif Parang modern dengan kombinasi kancing kerah Sanghai. Dibuat menggunakan kain katun primissima yang adem dan nyaman untuk kerja maupun acara resmi.', '1779686515_Blouse_Batik_Kancing_Kerah_Sanghay_Wanita.jpg', 'Pekalongan, Jawa Tengah', '2026-10-26 12:42:07', '2026-10-26 12:42:07') ON CONFLICT DO NOTHING;
INSERT INTO public.produk (id, id_penjual, nama_produk, slug, kategori, harga, stok, deskripsi, foto_produk, asal_daerah, created_at, updated_at) VALUES (2, 3, 'Kain Tenun Ikat Tradisional Toraja', 'kain-tenun-ikat-tradisional-toraja', 'Fashion', 340000, 8, 'Tenun ikat pakan bermotif Pa''teddong asli Tana Toraja. Dipintal menggunakan benang katun alam dengan pewarnaan alami ramah lingkungan.', 'tenun_ikat_sumba.jpg', 'Tana Toraja, Sulawesi Selatan', '2026-10-26 12:42:07', '2026-10-26 12:42:07') ON CONFLICT DO NOTHING;
INSERT INTO public.produk (id, id_penjual, nama_produk, slug, kategori, harga, stok, deskripsi, foto_produk, asal_daerah, created_at, updated_at) VALUES (3, 3, 'Dupa Aromaterapi & Pengusir Serangga Alami', 'dupa-aromaterapi-pengusir-serangga-alami', 'Kecantikan', 45000, 25, 'Formula tradisional minyak serai wangi, lavender, dan cengkeh murni. Melindungi ruangan dari serangga sekaligus menghadirkan ketenangan meditasi alami.', 'dupa_atsiri.jpg', 'Gianyar, Bali', '2026-10-26 12:42:07', '2026-10-26 12:42:07') ON CONFLICT DO NOTHING;
INSERT INTO public.produk (id, id_penjual, nama_produk, slug, kategori, harga, stok, deskripsi, foto_produk, asal_daerah, created_at, updated_at) VALUES (4, 3, 'Set Cangkir Gerabah Tanah Liat Kasongan', 'set-cangkir-gerabah-tanah-liat-kasongan', 'Kerajinan', 120000, 10, 'Sepasang cangkir dan lepek tanah liat merah alami khas sentra gerabah Kasongan Yogyakarta. Dipanggang dengan teknik tungku kayu tradisional, menghasilkan aroma tanah yang khas saat menikmati seduhan teh tubruk.', 'gerabah_kasongan_asli.jpg', 'Bantul, DI Yogyakarta', '2026-10-26 12:42:07', '2026-10-26 12:42:07') ON CONFLICT DO NOTHING;
INSERT INTO public.produk (id, id_penjual, nama_produk, slug, kategori, harga, stok, deskripsi, foto_produk, asal_daerah, created_at, updated_at) VALUES (5, 2, 'Kopi Robusta Lereng Gunung Ijen 250g', 'kopi-robusta-lereng-gunung-ijen-250g', 'Kuliner', 65000, 18, 'Biji kopi robusta pilihan dari perkebunan rakyat lereng Gunung Ijen. Karakter rasa cokelat pekat, body tebal, dan aroma rempah yang memikat para penikmat kopi tubruk.', 'kopi_ijen.jpg', 'Banyuwangi, Jawa Timur', '2026-10-26 12:42:07', '2026-10-26 12:42:07') ON CONFLICT DO NOTHING;

-- SEED DATA: orders
INSERT INTO public.orders (id, order_number, id_pembeli, nama_penerima, no_hp, alamat, kota, provinsi, kode_pos, catatan, kurir, metode_pembayaran, subtotal, ongkir, diskon, total_bayar, status, snap_token, created_at) VALUES (1, 'PN-20261026-9766', NULL, 'Budi Santoso', '081122334455', 'Jl. Cemara Hijau No. 18', 'Surabaya', 'Jawa Timur', '60231', 'Uji coba order', 'JNE Reguler (1-2 hari)', 'cod', 185000, 18000, 0, 203000, 'diproses', NULL, '2026-10-26 12:45:01') ON CONFLICT DO NOTHING;
INSERT INTO public.orders (id, order_number, id_pembeli, nama_penerima, no_hp, alamat, kota, provinsi, kode_pos, catatan, kurir, metode_pembayaran, subtotal, ongkir, diskon, total_bayar, status, snap_token, created_at) VALUES (2, 'PN-20261026-2816', 4, 'Budi Santoso', '081122334455', 'Jl. Cemara Hijau No. 18', 'Surabaya', 'Jawa Timur', '60231', 'Uji coba order', 'JNE Reguler (1-2 hari)', 'cod', 185000, 18000, 0, 203000, 'paid', NULL, '2026-10-26 12:46:32') ON CONFLICT DO NOTHING;

-- SEED DATA: order_items
INSERT INTO public.order_items (id, order_id, id_produk, nama_produk, harga, qty, subtotal) VALUES (1, 1, 1, 'Blouse Batik Kancing Kerah Sanghai Wanita', 185000, 1, 185000) ON CONFLICT DO NOTHING;
INSERT INTO public.order_items (id, order_id, id_produk, nama_produk, harga, qty, subtotal) VALUES (2, 2, 1, 'Blouse Batik Kancing Kerah Sanghai Wanita', 185000, 1, 185000) ON CONFLICT DO NOTHING;
-- =============================================
-- 5. INTEGRITY FIXES (indexes, sequences, RLS)
-- =============================================

-- Seed rows insert explicit ids, so advance every BIGSERIAL sequence.
-- Without this the next INSERT tries id = 1 and fails with a duplicate key.
SELECT setval(pg_get_serial_sequence('public.users', 'id'), COALESCE((SELECT MAX(id) FROM public.users), 1));
SELECT setval(pg_get_serial_sequence('public.produk', 'id'), COALESCE((SELECT MAX(id) FROM public.produk), 1));
SELECT setval(pg_get_serial_sequence('public.orders', 'id'), COALESCE((SELECT MAX(id) FROM public.orders), 1));
SELECT setval(pg_get_serial_sequence('public.order_items', 'id'), COALESCE((SELECT MAX(id) FROM public.order_items), 1));

CREATE INDEX IF NOT EXISTS idx_produk_penjual ON public.produk(id_penjual);
CREATE INDEX IF NOT EXISTS idx_orders_pembeli ON public.orders(id_pembeli);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_produk ON public.order_items(id_produk);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_produk_updated_at ON public.produk;
CREATE TRIGGER trg_produk_updated_at
BEFORE UPDATE ON public.produk
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- All reads and writes go through the server service role, so anon access is denied.
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produk ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;