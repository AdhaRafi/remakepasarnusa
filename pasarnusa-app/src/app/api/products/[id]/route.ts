import { productService } from "@/backend/services";
import { getSession } from "@/backend/lib/auth";
import { apiSuccess, apiError, handleApiError } from "@/backend/lib/api-response";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const product = await productService.getProductById(Number(id));

    if (!product) {
      return apiError("Produk tidak ditemukan.", 404);
    }

    return apiSuccess({ product });
  } catch (err) {
    return handleApiError(err, "Gagal mengambil data produk.");
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "penjual" && session.role !== "admin")) {
      return apiError("Akses ditolak.", 403);
    }

    const { id } = await params;
    const productId = Number(id);
    const existing = await productService.getProductById(productId);

    if (!existing) {
      return apiError("Produk tidak ditemukan.", 404);
    }

    if (session.role !== "admin" && existing.id_penjual !== session.id) {
      return apiError("Kamu tidak berhak mengedit produk milik penjual lain.", 403);
    }

    const body = await req.json();

    // Quick stock update mode
    if (body.quick_stock !== undefined) {
      const newStock = await productService.updateStock(productId, Number(body.quick_stock));
      return apiSuccess({ success: true, message: `Stok produk diperbarui menjadi ${newStock}.` });
    }

    const { nama_produk, kategori, harga, stok, deskripsi, foto_produk, asal_daerah } = body;

    await productService.updateProduct(productId, {
      nama_produk: nama_produk || existing.nama_produk,
      kategori: kategori || existing.kategori,
      harga: harga !== undefined ? Number(harga) : existing.harga,
      stok: stok !== undefined ? Number(stok) : existing.stok,
      deskripsi: deskripsi || existing.deskripsi,
      foto_produk: foto_produk || existing.foto_produk,
      asal_daerah: asal_daerah || existing.asal_daerah,
    });

    return apiSuccess({ success: true, message: "Produk berhasil diperbarui." });
  } catch (err) {
    return handleApiError(err, "Gagal memperbarui produk.");
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "penjual" && session.role !== "admin")) {
      return apiError("Akses ditolak.", 403);
    }

    const { id } = await params;
    const productId = Number(id);
    const existing = await productService.getProductById(productId);

    if (!existing) {
      return apiError("Produk tidak ditemukan.", 404);
    }

    if (session.role !== "admin" && existing.id_penjual !== session.id) {
      return apiError("Kamu tidak berhak menghapus produk toko lain.", 403);
    }

    await productService.deleteProduct(productId);
    return apiSuccess({ success: true, message: "Produk berhasil dihapus." });
  } catch (err) {
    return handleApiError(err, "Gagal menghapus produk.");
  }
}
