import { supabaseAdmin } from "@/backend/lib/supabase";
import { hashPassword, verifyPassword, createSession, clearSession } from "@/backend/lib/auth";
import { UserRole, SessionUser } from "@/shared/types";

export const authService = {
  async login(email: string, password: string): Promise<{ user: SessionUser; token: string }> {
    const trimmedEmail = email.trim().toLowerCase();

    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("*")
      .ilike("email", trimmedEmail)
      .single();

    if (error || !user || !user.password) {
      throw new Error("Email atau kata sandi tidak sesuai.");
    }

    let isValid = false;
    if (user.password.startsWith("$2a$") || user.password.startsWith("$2b$") || user.password.startsWith("$2y$")) {
      isValid = await verifyPassword(password, user.password);
    } else if (user.password === password) {
      // Migrate plain text password to bcrypt hash on first login
      isValid = true;
      const newHash = await hashPassword(password);
      await supabaseAdmin.from("users").update({ password: newHash }).eq("id", user.id);
    }

    if (!isValid) {
      throw new Error("Email atau kata sandi tidak sesuai.");
    }

    const sessionPayload: SessionUser = {
      id: user.id,
      nama: user.nama,
      email: user.email,
      role: user.role,
      foto: user.foto,
    };

    const token = await createSession(sessionPayload);
    return { user: sessionPayload, token };
  },

  async register(data: {
    nama: string;
    email: string;
    password: string;
    role?: string;
  }): Promise<{ user: SessionUser; token: string }> {
    const trimmedEmail = data.email.trim().toLowerCase();
    const assignedRole: UserRole = data.role === "penjual" ? "penjual" : "pembeli";

    const { data: existing } = await supabaseAdmin
      .from("users")
      .select("id")
      .ilike("email", trimmedEmail)
      .maybeSingle();

    if (existing) {
      throw new Error("Alamat email ini sudah terdaftar. Silakan gunakan email lain atau masuk.");
    }

    const passwordHash = await hashPassword(data.password);

    const { data: newUser, error } = await supabaseAdmin
      .from("users")
      .insert({
        nama: data.nama.trim(),
        email: trimmedEmail,
        password: passwordHash,
        role: assignedRole,
      })
      .select("id, nama, email, role")
      .single();

    if (error || !newUser) {
      throw error || new Error("Gagal membuat akun.");
    }

    const sessionPayload: SessionUser = {
      id: newUser.id,
      nama: newUser.nama,
      email: newUser.email,
      role: newUser.role,
    };

    const token = await createSession(sessionPayload);
    return { user: sessionPayload, token };
  },

  async logout(): Promise<void> {
    await clearSession();
  },
};
