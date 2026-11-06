import { userService } from "@/services";
import { getSession } from "@/lib/auth";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";
import { UserRole } from "@/types";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return apiError("Hanya Administrator yang memiliki akses ke panel ini.", 403);
    }

    const users = await userService.getAdminUsersList();
    return apiSuccess({ users });
  } catch (err) {
    return handleApiError(err, "Gagal memuat data pengguna.");
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return apiError("Akses ditolak.", 403);
    }

    const body = await req.json();
    const { userId, action, newRole } = body;

    if (!userId) {
      return apiError("User ID diperlukan.", 400);
    }

    const validRoles: UserRole[] = ["pembeli", "penjual", "admin"];
    if (action === "change_role" && validRoles.includes(newRole)) {
      await userService.updateUserRole(Number(userId), newRole, session.id);
      return apiSuccess({ success: true, message: `Peran pengguna #${userId} berhasil diperbarui.` });
    }

    return apiError("Aksi tidak dikenali.", 400);
  } catch (err: unknown) {
    const error = err as Error;
    if (error?.message?.includes("tidak dapat mengubah peran") || error?.message?.includes("tidak ditemukan")) {
      return apiError(error.message, 400);
    }
    return handleApiError(err, "Gagal memproses aksi pengguna.");
  }
}
