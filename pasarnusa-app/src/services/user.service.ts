import { supabaseAdmin } from "@/lib/supabase";
import { User, UserRole } from "@/types";

function sanitizeClean(input?: string | null): string | null {
  if (!input) return null;
  const cleaned = input.replace(/<[^>]*>/g, "").trim();
  return cleaned.length > 0 ? cleaned : null;
}

export const userService = {
  async getUserProfile(userId: number): Promise<User | null> {
    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("id, nama, email, role, no_hp, alamat, kota, provinsi, kode_pos, foto, created_at")
      .eq("id", userId)
      .maybeSingle();

    if (error || !user) return null;
    return user as User;
  },

  async updateUserProfile(
    userId: number,
    data: {
      nama: string;
      no_hp?: string | null;
      alamat?: string | null;
      kota?: string | null;
      provinsi?: string | null;
      kode_pos?: string | null;
      foto?: string | null;
    }
  ): Promise<void> {
    const safeNama = sanitizeClean(data.nama);
    if (!safeNama || safeNama.length < 2) {
      throw new Error("Nama lengkap minimal 2 karakter.");
    }

    const payload: Record<string, unknown> = {
      nama: safeNama,
      no_hp: sanitizeClean(data.no_hp),
      alamat: sanitizeClean(data.alamat),
      kota: sanitizeClean(data.kota),
      provinsi: sanitizeClean(data.provinsi),
      kode_pos: sanitizeClean(data.kode_pos),
    };

    if (data.foto !== undefined && data.foto !== null) {
      payload.foto = data.foto;
    }

    const { error } = await supabaseAdmin
      .from("users")
      .update(payload)
      .eq("id", userId);

    if (error) throw error;
  },

  async getAdminUsersList(): Promise<User[]> {
    const { data, error } = await supabaseAdmin
      .from("users")
      .select("id, nama, email, role, no_hp, alamat, kota, provinsi, kode_pos, foto, created_at")
      .order("id", { ascending: false });

    if (error) throw error;
    return (data || []) as User[];
  },

  async updateUserRole(targetUserId: number, newRole: UserRole, currentAdminId: number): Promise<void> {
    if (targetUserId === currentAdminId) {
      throw new Error("Anda tidak dapat mengubah peran akun Anda sendiri.");
    }

    const { data, error } = await supabaseAdmin
      .from("users")
      .update({ role: newRole })
      .eq("id", targetUserId)
      .select("id");

    if (error || !data || data.length === 0) {
      throw new Error("Pengguna tidak ditemukan.");
    }
  },
};
