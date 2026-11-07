import { orderService } from "@/backend/services";
import { getSession } from "@/backend/lib/auth";
import { apiSuccess, apiError, handleApiError } from "@/backend/lib/api-response";
import { checkRateLimit, getClientIp } from "@/backend/lib/rate-limit";

interface DetailedError extends Error {
  details?: unknown;
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const rateKey = session ? `checkout:user:${session.id}` : `checkout:ip:${getClientIp(req)}`;
    const rateLimit = checkRateLimit(rateKey, { limit: 10, windowMs: 60 * 1000 });

    if (!rateLimit.allowed) {
      return apiError(
        `Terlalu banyak percobaan checkout. Coba lagi dalam ${rateLimit.retryAfterSec} detik.`,
        429
      );
    }

    const body = await req.json();

    const result = await orderService.processCheckout(session, body);
    return apiSuccess({
      success: true,
      ...result,
    });
  } catch (err: unknown) {
    const error = err as DetailedError;
    if (error?.details) {
      return apiError(error.message, 409, error.details);
    }
    if (
      error?.message?.includes("wajib diisi") ||
      error?.message?.includes("kosong") ||
      error?.message?.includes("tidak valid")
    ) {
      return apiError(error.message, 400);
    }
    if (error?.message?.includes("belum dikonfigurasi")) {
      return apiError(error.message, 503);
    }
    return handleApiError(err, "Gagal memproses pesanan. Periksa kembali data Anda.");
  }
}
