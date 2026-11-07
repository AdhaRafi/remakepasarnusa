import { authService } from "@/backend/services";
import { apiSuccess, handleApiError } from "@/backend/lib/api-response";

export async function POST() {
  try {
    await authService.logout();
    return apiSuccess({ success: true, message: "Berhasil keluar dari akun." });
  } catch (err) {
    return handleApiError(err, "Gagal keluar dari sesi.");
  }
}
