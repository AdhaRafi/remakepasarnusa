import { orderService } from "@/services";
import { getSession } from "@/lib/auth";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return apiError("Silakan masuk untuk melihat daftar pesanan.", 401);
    }

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status");

    const orders = await orderService.getOrders(session, statusFilter);
    return apiSuccess({ orders });
  } catch (err) {
    return handleApiError(err, "Gagal memuat daftar transaksi.");
  }
}
