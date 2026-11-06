const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'pasarnusa.db');
const db = new Database(dbPath);

let sql = '';
sql += '-- =========================================================\n';
sql += '-- Database Dump: PasarNusa Marketplace\n';
sql += '-- Cocok untuk MySQL / MariaDB / phpMyAdmin / PostgreSQL\n';
sql += '-- =========================================================\n\n';

sql += 'CREATE DATABASE IF NOT EXISTS `pasarnusa` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\n';
sql += 'USE `pasarnusa`;\n\n';

sql += 'DROP TABLE IF EXISTS `order_items`;\n';
sql += 'DROP TABLE IF EXISTS `orders`;\n';
sql += 'DROP TABLE IF EXISTS `produk`;\n';
sql += 'DROP TABLE IF EXISTS `users`;\n\n';

// Users Table
sql += '-- Table: users\n';
sql += 'CREATE TABLE `users` (\n';
sql += '  `id` INT AUTO_INCREMENT PRIMARY KEY,\n';
sql += '  `nama` VARCHAR(255) NOT NULL,\n';
sql += '  `email` VARCHAR(255) NOT NULL UNIQUE,\n';
sql += '  `password` VARCHAR(255) NOT NULL,\n';
sql += "  `role` ENUM('pembeli', 'penjual', 'admin') NOT NULL DEFAULT 'pembeli',\n";
sql += '  `no_hp` VARCHAR(50) DEFAULT NULL,\n';
sql += '  `alamat` TEXT DEFAULT NULL,\n';
sql += '  `kota` VARCHAR(100) DEFAULT NULL,\n';
sql += '  `provinsi` VARCHAR(100) DEFAULT NULL,\n';
sql += '  `kode_pos` VARCHAR(20) DEFAULT NULL,\n';
sql += '  `foto` VARCHAR(255) DEFAULT NULL,\n';
sql += '  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n';
sql += ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n\n';

const escapeSql = (str) => {
  if (str === null || str === undefined) return 'NULL';
  return `'${String(str).replace(/'/g, "''").replace(/\\/g, '\\\\')}'`;
};

const users = db.prepare('SELECT * FROM users').all();
for (const u of users) {
  sql += 'INSERT INTO `users` (`id`, `nama`, `email`, `password`, `role`, `no_hp`, `alamat`, `kota`, `provinsi`, `kode_pos`, `foto`, `created_at`) VALUES (' +
    [u.id, escapeSql(u.nama), escapeSql(u.email), escapeSql(u.password), escapeSql(u.role), escapeSql(u.no_hp), escapeSql(u.alamat), escapeSql(u.kota), escapeSql(u.provinsi), escapeSql(u.kode_pos), escapeSql(u.foto), escapeSql(u.created_at)].join(', ') + ');\n';
}
sql += '\n';

// Produk Table
sql += '-- Table: produk\n';
sql += 'CREATE TABLE `produk` (\n';
sql += '  `id` INT AUTO_INCREMENT PRIMARY KEY,\n';
sql += '  `id_penjual` INT NOT NULL,\n';
sql += '  `nama_produk` VARCHAR(255) NOT NULL,\n';
sql += '  `slug` VARCHAR(255) NOT NULL,\n';
sql += "  `kategori` ENUM('Kerajinan', 'Fashion', 'Kuliner', 'Kecantikan', 'Lainnya') NOT NULL,\n";
sql += '  `harga` INT NOT NULL,\n';
sql += '  `stok` INT NOT NULL DEFAULT 0,\n';
sql += '  `deskripsi` TEXT NOT NULL,\n';
sql += '  `foto_produk` VARCHAR(255) NOT NULL,\n';
sql += "  `asal_daerah` VARCHAR(100) NOT NULL DEFAULT 'Nusantara',\n";
sql += '  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n';
sql += '  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n';
sql += '  FOREIGN KEY (`id_penjual`) REFERENCES `users`(`id`) ON DELETE CASCADE\n';
sql += ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n\n';

const prods = db.prepare('SELECT * FROM produk').all();
for (const p of prods) {
  sql += 'INSERT INTO `produk` (`id`, `id_penjual`, `nama_produk`, `slug`, `kategori`, `harga`, `stok`, `deskripsi`, `foto_produk`, `asal_daerah`, `created_at`) VALUES (' +
    [p.id, p.id_penjual, escapeSql(p.nama_produk), escapeSql(p.slug), escapeSql(p.kategori), p.harga, p.stok, escapeSql(p.deskripsi), escapeSql(p.foto_produk), escapeSql(p.asal_daerah), escapeSql(p.created_at)].join(', ') + ');\n';
}
sql += '\n';

// Orders Table
sql += '-- Table: orders\n';
sql += 'CREATE TABLE `orders` (\n';
sql += '  `id` INT AUTO_INCREMENT PRIMARY KEY,\n';
sql += '  `order_number` VARCHAR(100) NOT NULL UNIQUE,\n';
sql += '  `id_pembeli` INT NULL,\n';
sql += '  `nama_penerima` VARCHAR(255) NOT NULL,\n';
sql += '  `no_hp` VARCHAR(50) NOT NULL,\n';
sql += '  `alamat` TEXT NOT NULL,\n';
sql += '  `kota` VARCHAR(100) NOT NULL,\n';
sql += '  `provinsi` VARCHAR(100) NOT NULL,\n';
sql += '  `kode_pos` VARCHAR(20) NOT NULL,\n';
sql += '  `catatan` TEXT DEFAULT NULL,\n';
sql += '  `kurir` VARCHAR(100) NOT NULL,\n';
sql += "  `metode_pembayaran` VARCHAR(50) NOT NULL DEFAULT 'cod',\n";
sql += '  `subtotal` INT NOT NULL,\n';
sql += '  `ongkir` INT NOT NULL,\n';
sql += '  `diskon` INT NOT NULL DEFAULT 0,\n';
sql += '  `total_bayar` INT NOT NULL,\n';
sql += "  `status` ENUM('pending', 'paid', 'diproses', 'dikirim', 'selesai', 'dibatalkan') NOT NULL DEFAULT 'pending',\n";
sql += '  `snap_token` VARCHAR(255) NULL,\n';
sql += '  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n';
sql += '  FOREIGN KEY (`id_pembeli`) REFERENCES `users`(`id`) ON DELETE SET NULL\n';
sql += ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n\n';

const orders = db.prepare('SELECT * FROM orders').all();
for (const o of orders) {
  sql += 'INSERT INTO `orders` (`id`, `order_number`, `id_pembeli`, `nama_penerima`, `no_hp`, `alamat`, `kota`, `provinsi`, `kode_pos`, `catatan`, `kurir`, `metode_pembayaran`, `subtotal`, `ongkir`, `diskon`, `total_bayar`, `status`, `snap_token`, `created_at`) VALUES (' +
    [o.id, escapeSql(o.order_number), o.id_pembeli || 'NULL', escapeSql(o.nama_penerima), escapeSql(o.no_hp), escapeSql(o.alamat), escapeSql(o.kota), escapeSql(o.provinsi), escapeSql(o.kode_pos), escapeSql(o.catatan), escapeSql(o.kurir), escapeSql(o.metode_pembayaran), o.subtotal, o.ongkir, o.diskon, o.total_bayar, escapeSql(o.status), escapeSql(o.snap_token), escapeSql(o.created_at)].join(', ') + ');\n';
}
sql += '\n';

// Order items Table
sql += '-- Table: order_items\n';
sql += 'CREATE TABLE `order_items` (\n';
sql += '  `id` INT AUTO_INCREMENT PRIMARY KEY,\n';
sql += '  `order_id` INT NOT NULL,\n';
sql += '  `id_produk` INT NULL,\n';
sql += '  `nama_produk` VARCHAR(255) NOT NULL,\n';
sql += '  `harga` INT NOT NULL,\n';
sql += '  `qty` INT NOT NULL,\n';
sql += '  `subtotal` INT NOT NULL,\n';
sql += '  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,\n';
sql += '  FOREIGN KEY (`id_produk`) REFERENCES `produk`(`id`) ON DELETE SET NULL\n';
sql += ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n\n';

const items = db.prepare('SELECT * FROM order_items').all();
for (const it of items) {
  sql += 'INSERT INTO `order_items` (`id`, `order_id`, `id_produk`, `nama_produk`, `harga`, `qty`, `subtotal`) VALUES (' +
    [it.id, it.order_id, it.id_produk || 'NULL', escapeSql(it.nama_produk), it.harga, it.qty, it.subtotal].join(', ') + ');\n';
}

const outputPath = path.join(__dirname, '..', '..', 'pasarnusa.sql');
fs.writeFileSync(outputPath, sql);
console.log('Exported pasarnusa.sql successfully to:', outputPath);
