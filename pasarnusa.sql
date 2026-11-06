-- =========================================================
-- Database Dump: PasarNusa Marketplace
-- Cocok untuk MySQL / MariaDB / phpMyAdmin / PostgreSQL
-- =========================================================

CREATE DATABASE IF NOT EXISTS `pasarnusa` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `pasarnusa`;

DROP TABLE IF EXISTS `order_items`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `produk`;
DROP TABLE IF EXISTS `users`;

-- Table: users
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nama` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('pembeli', 'penjual', 'admin') NOT NULL DEFAULT 'pembeli',
  `no_hp` VARCHAR(50) DEFAULT NULL,
  `alamat` TEXT DEFAULT NULL,
  `kota` VARCHAR(100) DEFAULT NULL,
  `provinsi` VARCHAR(100) DEFAULT NULL,
  `kode_pos` VARCHAR(20) DEFAULT NULL,
  `foto` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `users` (`id`, `nama`, `email`, `password`, `role`, `no_hp`, `alamat`, `kota`, `provinsi`, `kode_pos`, `foto`, `created_at`) VALUES (1, 'Administrator PasarNusa', 'admin@pasarnusa.id', '$2b$10$COr6jArf87pnDgcd4DFEb.ctCooJqKqYFxM1FcJANnlZiyjH76MMm', 'admin', '081234567890', 'Gedung Sarinah Lt. 5, Jl. M.H. Thamrin No. 11', 'Jakarta Pusat', 'DKI Jakarta', '10350', 'admin.png', '2026-10-26 12:42:07');
INSERT INTO `users` (`id`, `nama`, `email`, `password`, `role`, `no_hp`, `alamat`, `kota`, `provinsi`, `kode_pos`, `foto`, `created_at`) VALUES (2, 'Danar Batik Heritage', 'batik.danar@pasarnusa.id', '$2b$10$COr6jArf87pnDgcd4DFEb.cV8gQFz.98J2krNAUZfJ12gDS206kc.', 'penjual', '081298765432', 'Jl. Kauman No. 42', 'Pekalongan', 'Jawa Tengah', '51112', 'seller1.png', '2026-10-26 12:42:07');
INSERT INTO `users` (`id`, `nama`, `email`, `password`, `role`, `no_hp`, `alamat`, `kota`, `provinsi`, `kode_pos`, `foto`, `created_at`) VALUES (3, 'Kriya Kasongan & Rempah', 'kriya.nusantara@pasarnusa.id', '$2b$10$COr6jArf87pnDgcd4DFEb.cV8gQFz.98J2krNAUZfJ12gDS206kc.', 'penjual', '081387654321', 'Desa Wisata Kasongan RT 03', 'Bantul', 'DI Yogyakarta', '55184', 'seller2.png', '2026-10-26 12:42:07');
INSERT INTO `users` (`id`, `nama`, `email`, `password`, `role`, `no_hp`, `alamat`, `kota`, `provinsi`, `kode_pos`, `foto`, `created_at`) VALUES (4, 'Budi Santoso', 'budi.santoso@gmail.com', '$2b$10$COr6jArf87pnDgcd4DFEb.cV8gQFz.98J2krNAUZfJ12gDS206kc.', 'pembeli', '081122334455', 'Jl. Cemara Hijau No. 18', 'Surabaya', 'Jawa Timur', '60231', 'buyer.png', '2026-10-26 12:42:07');

-- Table: produk
CREATE TABLE `produk` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `id_penjual` INT NOT NULL,
  `nama_produk` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `kategori` ENUM('Kerajinan', 'Fashion', 'Kuliner', 'Kecantikan', 'Lainnya') NOT NULL,
  `harga` INT NOT NULL,
  `stok` INT NOT NULL DEFAULT 0,
  `deskripsi` TEXT NOT NULL,
  `foto_produk` VARCHAR(255) NOT NULL,
  `asal_daerah` VARCHAR(100) NOT NULL DEFAULT 'Nusantara',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`id_penjual`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `produk` (`id`, `id_penjual`, `nama_produk`, `slug`, `kategori`, `harga`, `stok`, `deskripsi`, `foto_produk`, `asal_daerah`, `created_at`) VALUES (1, 2, 'Blouse Batik Kancing Kerah Sanghai Wanita', 'blouse-batik-kancing-kerah-sanghai-wanita', 'Fashion', 185000, 12, 'Blouse batik cap motif Parang modern dengan kombinasi kancing kerah Sanghai. Dibuat menggunakan kain katun primissima yang adem dan nyaman untuk kerja maupun acara resmi.', '1779686515_Blouse_Batik_Kancing_Kerah_Sanghay_Wanita.jpg', 'Pekalongan, Jawa Tengah', '2026-10-26 12:42:07');
INSERT INTO `produk` (`id`, `id_penjual`, `nama_produk`, `slug`, `kategori`, `harga`, `stok`, `deskripsi`, `foto_produk`, `asal_daerah`, `created_at`) VALUES (2, 3, 'Kain Tenun Ikat Tradisional Toraja', 'kain-tenun-ikat-tradisional-toraja', 'Fashion', 340000, 8, 'Tenun ikat pakan bermotif Pa''teddong asli Tana Toraja. Dipintal menggunakan benang katun alam dengan pewarnaan alami ramah lingkungan.', 'tenun_ikat_sumba.jpg', 'Tana Toraja, Sulawesi Selatan', '2026-10-26 12:42:07');
INSERT INTO `produk` (`id`, `id_penjual`, `nama_produk`, `slug`, `kategori`, `harga`, `stok`, `deskripsi`, `foto_produk`, `asal_daerah`, `created_at`) VALUES (3, 3, 'Dupa Aromaterapi & Pengusir Serangga Alami', 'dupa-aromaterapi-pengusir-serangga-alami', 'Kecantikan', 45000, 25, 'Formula tradisional minyak serai wangi, lavender, dan cengkeh murni. Melindungi ruangan dari serangga sekaligus menghadirkan ketenangan meditasi alami.', 'dupa_atsiri.jpg', 'Gianyar, Bali', '2026-10-26 12:42:07');
INSERT INTO `produk` (`id`, `id_penjual`, `nama_produk`, `slug`, `kategori`, `harga`, `stok`, `deskripsi`, `foto_produk`, `asal_daerah`, `created_at`) VALUES (4, 3, 'Set Cangkir Gerabah Tanah Liat Kasongan', 'set-cangkir-gerabah-tanah-liat-kasongan', 'Kerajinan', 120000, 10, 'Sepasang cangkir dan lepek tanah liat merah alami khas sentra gerabah Kasongan Yogyakarta. Dipanggang dengan teknik tungku kayu tradisional, menghasilkan aroma tanah yang khas saat menikmati seduhan teh tubruk.', 'gerabah_kasongan_asli.jpg', 'Bantul, DI Yogyakarta', '2026-10-26 12:42:07');
INSERT INTO `produk` (`id`, `id_penjual`, `nama_produk`, `slug`, `kategori`, `harga`, `stok`, `deskripsi`, `foto_produk`, `asal_daerah`, `created_at`) VALUES (5, 2, 'Kopi Robusta Lereng Gunung Ijen 250g', 'kopi-robusta-lereng-gunung-ijen-250g', 'Kuliner', 65000, 18, 'Biji kopi robusta pilihan dari perkebunan rakyat lereng Gunung Ijen. Karakter rasa cokelat pekat, body tebal, dan aroma rempah yang memikat para penikmat kopi tubruk.', 'kopi_ijen.jpg', 'Banyuwangi, Jawa Timur', '2026-10-26 12:42:07');
INSERT INTO `produk` (`id`, `id_penjual`, `nama_produk`, `slug`, `kategori`, `harga`, `stok`, `deskripsi`, `foto_produk`, `asal_daerah`, `created_at`) VALUES (6, 3, 'Kotak Anyaman Bambu Motif Sasak', 'kotak-anyaman-bambu-motif-sasak', 'Kerajinan', 95000, 12, 'Tempat penyimpanan serbaguna dari bambu apus yang diserut halus dan dianyam rapat oleh kelompok pengrajin perempuan Lombok. Kuat, ramah lingkungan, dan bernilai artistik tinggi.', 'tas_rotan_lombok.jpg', 'Lombok Barat, NTB', '2026-10-26 12:42:07');

-- Table: orders
CREATE TABLE `orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_number` VARCHAR(100) NOT NULL UNIQUE,
  `id_pembeli` INT NULL,
  `nama_penerima` VARCHAR(255) NOT NULL,
  `no_hp` VARCHAR(50) NOT NULL,
  `alamat` TEXT NOT NULL,
  `kota` VARCHAR(100) NOT NULL,
  `provinsi` VARCHAR(100) NOT NULL,
  `kode_pos` VARCHAR(20) NOT NULL,
  `catatan` TEXT DEFAULT NULL,
  `kurir` VARCHAR(100) NOT NULL,
  `metode_pembayaran` VARCHAR(50) NOT NULL DEFAULT 'cod',
  `subtotal` INT NOT NULL,
  `ongkir` INT NOT NULL,
  `diskon` INT NOT NULL DEFAULT 0,
  `total_bayar` INT NOT NULL,
  `status` ENUM('pending', 'paid', 'diproses', 'dikirim', 'selesai', 'dibatalkan') NOT NULL DEFAULT 'pending',
  `snap_token` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`id_pembeli`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `orders` (`id`, `order_number`, `id_pembeli`, `nama_penerima`, `no_hp`, `alamat`, `kota`, `provinsi`, `kode_pos`, `catatan`, `kurir`, `metode_pembayaran`, `subtotal`, `ongkir`, `diskon`, `total_bayar`, `status`, `snap_token`, `created_at`) VALUES (1, 'PN-20261026-9766', NULL, 'Budi Santoso', '081122334455', 'Jl. Cemara Hijau No. 18', 'Surabaya', 'Jawa Timur', '60231', 'Uji coba order', 'JNE Reguler (1-2 hari)', 'cod', 185000, 18000, 0, 203000, 'diproses', NULL, '2026-10-26 12:45:01');
INSERT INTO `orders` (`id`, `order_number`, `id_pembeli`, `nama_penerima`, `no_hp`, `alamat`, `kota`, `provinsi`, `kode_pos`, `catatan`, `kurir`, `metode_pembayaran`, `subtotal`, `ongkir`, `diskon`, `total_bayar`, `status`, `snap_token`, `created_at`) VALUES (2, 'PN-20261026-2816', 4, 'Budi Santoso', '081122334455', 'Jl. Cemara Hijau No. 18', 'Surabaya', 'Jawa Timur', '60231', 'Uji coba order', 'JNE Reguler (1-2 hari)', 'cod', 185000, 18000, 0, 203000, 'paid', NULL, '2026-10-26 12:46:32');

-- Table: order_items
CREATE TABLE `order_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL,
  `id_produk` INT NULL,
  `nama_produk` VARCHAR(255) NOT NULL,
  `harga` INT NOT NULL,
  `qty` INT NOT NULL,
  `subtotal` INT NOT NULL,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`id_produk`) REFERENCES `produk`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `order_items` (`id`, `order_id`, `id_produk`, `nama_produk`, `harga`, `qty`, `subtotal`) VALUES (1, 1, 1, 'Blouse Batik Kancing Kerah Sanghai Wanita', 185000, 1, 185000);
INSERT INTO `order_items` (`id`, `order_id`, `id_produk`, `nama_produk`, `harga`, `qty`, `subtotal`) VALUES (2, 2, 1, 'Blouse Batik Kancing Kerah Sanghai Wanita', 185000, 1, 185000);
