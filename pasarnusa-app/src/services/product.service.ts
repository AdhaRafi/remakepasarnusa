import { supabaseAdmin, getNextId } from "@/lib/supabase";
import { Product, ProductCategory } from "@/types";

export interface GetProductsFilter {
  search?: string;
  kategori?: string;
  sellerId?: string | number | null;
}

type ProductDbRow = Product & {
  users?: { nama: string } | null;
};

function sanitizeText(input: string): string {
  return input.replace(/<[^>]*>/g, "").trim();
}

function sanitizeDescription(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/onerror=/gi, "")
    .replace(/onload=/gi, "")
    .trim();
}

export const productService = {
  async getProducts(filters: GetProductsFilter = {}) {
    const { search = "", kategori = "", sellerId = null } = filters;

    let query = supabaseAdmin
      .from("produk")
      .select("*, users:id_penjual(nama)")
      .order("id", { ascending: false });

    if (search.trim()) {
      const term = sanitizeText(search);
      query = query.or(`nama_produk.ilike.%${term}%,deskripsi.ilike.%${term}%,asal_daerah.ilike.%${term}%`);
    }

    if (kategori && kategori !== "semua") {
      query = query.eq("kategori", kategori);
    }

    if (sellerId) {
      query = query.eq("id_penjual", Number(sellerId));
    }

    const { data: rawProducts, error } = await query;
    if (error) throw error;

    const products: Product[] = ((rawProducts || []) as ProductDbRow[]).map((p) => ({
      ...p,
      nama_toko: p.users?.nama || "Toko Kriya Nusantara",
    }));

    // Dynamic category counts directly from Supabase
    const { data: allProds } = await supabaseAdmin.from("produk").select("kategori");

    const categoryCounts: Record<ProductCategory, number> = {
      Kerajinan: 0,
      Fashion: 0,
      Kuliner: 0,
      Kecantikan: 0,
      Lainnya: 0,
    };

    if (allProds) {
      for (const item of allProds) {
        if (categoryCounts[item.kategori as ProductCategory] !== undefined) {
          categoryCounts[item.kategori as ProductCategory] += 1;
        }
      }
    }

    return {
      products,
      categoryCounts,
      totalCount: products.length,
    };
  },

  async getProductById(id: number): Promise<Product | null> {
    const { data: raw, error } = await supabaseAdmin
      .from("produk")
      .select("*, users:id_penjual(nama)")
      .eq("id", id)
      .maybeSingle();

    if (error || !raw) return null;
    const typedRaw = raw as ProductDbRow;

    return {
      ...typedRaw,
      nama_toko: typedRaw.users?.nama || "Toko Kriya Nusantara",
    };
  },

  async createProduct(data: {
    id_penjual: number;
    nama_produk: string;
    kategori: ProductCategory;
    harga: number;
    stok: number;
    deskripsi: string;
    foto_produk: string;
    asal_daerah?: string;
  }): Promise<Product> {
    const safeNama = sanitizeText(data.nama_produk);
    const safeDeskripsi = sanitizeDescription(data.deskripsi);
    const safeAsal = sanitizeText(data.asal_daerah || "Nusantara");
    const safeHarga = Math.max(0, Math.floor(Number(data.harga)));
    const safeStok = Math.max(0, Math.floor(Number(data.stok)));

    const slug = safeNama
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "") + `-${Date.now().toString().slice(-4)}`;

    const nextId = await getNextId("produk");

    const { data: newProd, error } = await supabaseAdmin
      .from("produk")
      .insert({
        id: nextId,
        id_penjual: data.id_penjual,
        nama_produk: safeNama,
        slug,
        kategori: data.kategori,
        harga: safeHarga,
        stok: safeStok,
        deskripsi: safeDeskripsi,
        foto_produk: data.foto_produk || "pasar.jpg",
        asal_daerah: safeAsal,
      })
      .select()
      .single();

    if (error || !newProd) throw error || new Error("Gagal menyimpan produk baru.");
    return newProd;
  },

  async updateProduct(id: number, updates: Partial<Product>): Promise<void> {
    const safeUpdates: Partial<Product> = {};

    if (updates.nama_produk !== undefined) safeUpdates.nama_produk = sanitizeText(updates.nama_produk);
    if (updates.kategori !== undefined) safeUpdates.kategori = updates.kategori;
    if (updates.harga !== undefined) safeUpdates.harga = Math.max(0, Math.floor(Number(updates.harga)));
    if (updates.stok !== undefined) safeUpdates.stok = Math.max(0, Math.floor(Number(updates.stok)));
    if (updates.deskripsi !== undefined) safeUpdates.deskripsi = sanitizeDescription(updates.deskripsi);
    if (updates.foto_produk !== undefined) safeUpdates.foto_produk = updates.foto_produk;
    if (updates.asal_daerah !== undefined) safeUpdates.asal_daerah = sanitizeText(updates.asal_daerah);

    const { error } = await supabaseAdmin
      .from("produk")
      .update({
        ...safeUpdates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw error;
  },

  async updateStock(id: number, newStock: number): Promise<number> {
    const sanitizedStock = Math.max(0, Math.floor(Number(newStock)));
    const { error } = await supabaseAdmin
      .from("produk")
      .update({
        stok: sanitizedStock,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw error;
    return sanitizedStock;
  },

  async deleteProduct(id: number): Promise<void> {
    const { error } = await supabaseAdmin
      .from("produk")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },
};
