import { authService } from "@/backend/services";
import { apiSuccess, apiError, handleApiError } from "@/backend/lib/api-response";
import { checkRateLimit, getClientIp } from "@/backend/lib/rate-limit";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);

    // Rate limit: max 5 registrations per 10 minutes per IP
    const rateLimit = checkRateLimit(`register:${ip}`, {
      limit: 5,
      windowMs: 10 * 60 * 1000,
    });

    if (!rateLimit.allowed) {
      return apiError(
        `Terlalu banyak permintaan pendaftaran. Coba lagi dalam ${rateLimit.retryAfterSec} detik.`,
        429
      );
    }

    const { nama, email, password, role } = await req.json();
    if (!nama || !email || !password) {
      return apiError("Nama, email, dan kata sandi wajib diisi.", 400);
    }

    const trimmedNama = String(nama).trim().replace(/<[^>]*>/g, ""); // Strip potential HTML tags
    const trimmedEmail = String(email).trim().toLowerCase();
    const strPassword = String(password);

    if (trimmedNama.length < 2 || trimmedNama.length > 80) {
      return apiError("Nama harus terdiri dari 2 hingga 80 karakter.", 400);
    }

    if (!EMAIL_REGEX.test(trimmedEmail) || trimmedEmail.length > 100) {
      return apiError("Format alamat email tidak valid.", 400);
    }

    if (strPassword.length < 6) {
      return apiError("Kata sandi minimal 6 karakter demi keamanan akun Anda.", 400);
    }

    const { user } = await authService.register({
      nama: trimmedNama,
      email: trimmedEmail,
      password: strPassword,
      role,
    });

    return apiSuccess({ success: true, user });
  } catch (err: unknown) {
    const error = err as Error;
    if (error?.message?.includes("sudah terdaftar")) {
      return apiError(error.message, 409);
    }
    return handleApiError(err, "Gagal mendaftarkan akun. Silakan coba kembali.");
  }
}
