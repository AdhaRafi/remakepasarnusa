import { authService } from "@/services";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export async function POST() {
  try {
    await authService.logout();
    return apiSuccess({ success: true, message: "Berhasil keluar dari akun." });
  } catch (err) {
    return handleApiError(err, "Gagal keluar dari sesi.");
  }
}
