export type UserRole = "pembeli" | "penjual" | "admin";

export type ProductCategory = "Kerajinan" | "Fashion" | "Kuliner" | "Kecantikan" | "Lainnya";

export type OrderStatus = "pending" | "paid" | "diproses" | "dikirim" | "selesai" | "dibatalkan";

export type PaymentMethod = "midtrans" | "cod" | "transfer";

export interface User {
  id: number;
  nama: string;
  email: string;
  password?: string;
  role: UserRole;
  no_hp: string | null;
  alamat: string | null;
  kota: string | null;
  provinsi: string | null;
  kode_pos: string | null;
  foto: string | null;
  created_at: string;
}

export interface SessionUser {
  id: number;
  nama: string;
  email: string;
  role: UserRole;
  foto?: string | null;
}

export interface Product {
  id: number;
  id_penjual: number;
  nama_produk: string;
  slug: string;
  kategori: ProductCategory;
  harga: number;
  stok: number;
  deskripsi: string;
  foto_produk: string;
  asal_daerah: string;
  nama_toko?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  id_produk: number | null;
  nama_produk: string;
  harga: number;
  qty: number;
  subtotal: number;
}

export interface Order {
  id: number;
  order_number: string;
  id_pembeli: number | null;
  nama_penerima: string;
  no_hp: string;
  alamat: string;
  kota: string;
  provinsi: string;
  kode_pos: string;
  catatan: string | null;
  kurir: string;
  metode_pembayaran: PaymentMethod;
  subtotal: number;
  ongkir: number;
  diskon: number;
  total_bayar: number;
  status: OrderStatus;
  snap_token: string | null;
  created_at: string;
  items?: OrderItem[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  details?: unknown;
}
