import { orderService } from "@/services";
import { getSession } from "@/lib/auth";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";
import { OrderStatus } from "@/types";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) {
      return apiError("Akses ditolak.", 401);
    }

    const { id } = await params;
    const body = await req.json();

    const validStatuses: OrderStatus[] = ["pending", "paid", "diproses", "dikirim", "selesai", "dibatalkan"];
    if (body.status !== undefined && !validStatuses.includes(body.status)) {
      return apiError("Status pesanan tidak valid.", 400);
    }

    const result = await orderService.updateOrderStatus(Number(id), session, body);
    return apiSuccess({ success: true, message: result.message });
  } catch (err: unknown) {
    const error = err as Error;
    if (error?.message === "Pesanan tidak ditemukan.") {
      return apiError(error.message, 404);
    }
    if (error?.message?.includes("tidak memuat produk") || error?.message?.includes("tidak diizinkan")) {
      return apiError(error.message, 403);
    }
    return handleApiError(err, "Gagal memperbarui status pesanan.");
  }
}
