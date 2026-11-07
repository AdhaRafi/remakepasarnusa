import { authService } from "@/backend/services";
import { apiSuccess, apiError, handleApiError } from "@/backend/lib/api-response";
import { checkRateLimit, getClientIp } from "@/backend/lib/rate-limit";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const { email, password } = await req.json();

    if (!email || !password) {
      return apiError("Email dan password wajib diisi.", 400);
    }

    const trimmedEmail = String(email).trim().toLowerCase();

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      return apiError("Format email tidak valid.", 400);
    }

    // Rate limit: max 5 login attempts per minute per IP + email
    const rateLimit = checkRateLimit(`login:${ip}:${trimmedEmail}`, {
      limit: 5,
      windowMs: 60 * 1000,
    });

    if (!rateLimit.allowed) {
      return apiError(
        `Terlalu banyak percobaan login. Silakan coba lagi dalam ${rateLimit.retryAfterSec} detik.`,
        429
      );
    }

    const { user } = await authService.login(trimmedEmail, String(password));
    return apiSuccess({ success: true, user });
  } catch (err: unknown) {
    const error = err as Error;
    if (error?.message === "Email atau kata sandi tidak sesuai.") {
      return apiError(error.message, 401);
    }
    return handleApiError(err, "Terjadi gangguan server. Coba lagi beberapa saat.");
  }
}
