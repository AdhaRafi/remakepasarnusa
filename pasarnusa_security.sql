-- ============================================================
-- PasarNusa: Keamanan & Row Level Security (RLS) Supabase
-- Menutup celah kebocoran data PostgREST dari akses publik (anon)
-- ============================================================

-- 1. Aktifkan Row Level Security (RLS) di semua tabel inti
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produk ENABLE ROW LEVEL SECURITY;

-- 2. Bersihkan kebijakan lama (jika ada) untuk mencegah konflik
DROP POLICY IF EXISTS "Publik dapat melihat katalog produk" ON public.produk;

-- 3. Kebijakan Tabel Produk:
-- Pengunjung publik (anon) HANYA diizinkan membaca (SELECT) katalog produk
CREATE POLICY "Publik dapat melihat katalog produk"
ON public.produk
FOR SELECT
TO anon, authenticated
USING (true);

-- 4. Sinkronisasi urutan sequence ID otomatis di database
SELECT setval(pg_get_serial_sequence('users', 'id'), COALESCE(max(id), 1)) FROM users;
SELECT setval(pg_get_serial_sequence('produk', 'id'), COALESCE(max(id), 1)) FROM produk;
SELECT setval(pg_get_serial_sequence('orders', 'id'), COALESCE(max(id), 1)) FROM orders;
SELECT setval(pg_get_serial_sequence('order_items', 'id'), COALESCE(max(id), 1)) FROM order_items;
