import { userService } from "@/services";
import { getSession } from "@/lib/auth";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return apiError("Sesi berakhir. Silakan masuk kembali.", 401);
    }

    const user = await userService.getUserProfile(session.id);
    if (!user) {
      return apiError("Pengguna tidak ditemukan.", 404);
    }

    return apiSuccess({ user });
  } catch (err) {
    return handleApiError(err, "Gagal mengambil profil akun.");
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return apiError("Sesi berakhir. Silakan masuk kembali.", 401);
    }

    const body = await req.json();
    const { nama, no_hp, alamat, kota, provinsi, kode_pos, foto } = body;

    if (!nama) {
      return apiError("Nama lengkap wajib diisi.", 400);
    }

    await userService.updateUserProfile(session.id, {
      nama,
      no_hp,
      alamat,
      kota,
      provinsi,
      kode_pos,
      foto,
    });

    return apiSuccess({ success: true, message: "Profil Anda berhasil diperbarui." });
  } catch (err) {
    return handleApiError(err, "Gagal menyimpan perubahan profil.");
  }
}
