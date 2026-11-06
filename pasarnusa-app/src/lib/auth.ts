import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "./supabase";

const JWT_SECRET = process.env.JWT_SECRET || "pasarnusa-nusantara-artisan-secret-key-2026";
const COOKIE_NAME = "pasarnusa_session";

export interface SessionUser {
  id: number;
  nama: string;
  email: string;
  role: "pembeli" | "penjual" | "admin";
  foto?: string | null;
}

export async function hashPassword(plainText: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainText, salt);
}

export async function verifyPassword(plainText: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plainText, hashed);
}

export async function createSession(user: { id: number; nama: string; email: string; role: "pembeli" | "penjual" | "admin"; foto?: string | null }) {
  const payload: SessionUser = {
    id: user.id,
    nama: user.nama,
    email: user.email,
    role: user.role,
    foto: user.foto || null,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return token;
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET) as SessionUser;

    // Refresh user fresh data from Supabase
    const { data: userRow, error } = await supabaseAdmin
      .from("users")
      .select("id, nama, email, role, foto")
      .eq("id", decoded.id)
      .single();

    if (error || !userRow) return null;

    return {
      id: userRow.id,
      nama: userRow.nama,
      email: userRow.email,
      role: userRow.role,
      foto: userRow.foto,
    };
  } catch {
    return null;
  }
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
