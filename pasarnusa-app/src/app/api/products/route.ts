import { productService } from "@/backend/services";
import { getSession } from "@/backend/lib/auth";
import { apiSuccess, apiError, handleApiError } from "@/backend/lib/api-response";
import { ProductCategory } from "@/shared/types";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const kategori = searchParams.get("kategori") || "";
    const sellerId = searchParams.get("seller_id");

    const result = await productService.getProducts({ search, kategori, sellerId });
    return apiSuccess(result);
  } catch (err) {
    return handleApiError(err, "Gagal memuat katalog produk.");
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "penjual" && session.role !== "admin")) {
      return apiError("Hanya penjual dan admin yang dapat menambah produk.", 403);
    }

    const body = await req.json();
    const { nama_produk, kategori, harga, stok, deskripsi, foto_produk, asal_daerah } = body;

    if (!nama_produk || !kategori || !harga || stok === undefined || !deskripsi) {
      return apiError("Semua kolom produk wajib diisi lengkap.", 400);
    }

    const newProduct = await productService.createProduct({
      id_penjual: session.id,
      nama_produk,
      kategori: kategori as ProductCategory,
      harga,
      stok,
      deskripsi,
      foto_produk,
      asal_daerah,
    });

    return apiSuccess({
      success: true,
      productId: newProduct.id,
      message: "Produk berhasil ditambahkan.",
    });
  } catch (err) {
    return handleApiError(err, "Gagal menyimpan produk baru.");
  }
}
