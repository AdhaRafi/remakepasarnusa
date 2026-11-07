import path from "path";
import { getSession } from "@/backend/lib/auth";
import { storageService } from "@/backend/services";
import { apiSuccess, apiError, handleApiError } from "@/backend/lib/api-response";
import { checkRateLimit } from "@/backend/lib/rate-limit";

function isValidImageBuffer(buffer: Buffer, ext: string): boolean {
  if (buffer.length < 12) return false;

  // JPEG magic bytes: FF D8 FF
  if (ext === ".jpg" || ext === ".jpeg") {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }

  // PNG magic bytes: 89 50 4E 47
  if (ext === ".png") {
    return (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47
    );
  }

  // WEBP: starts with "RIFF" and has "WEBP" at byte offset 8
  if (ext === ".webp") {
    const riff = buffer.toString("ascii", 0, 4);
    const webp = buffer.toString("ascii", 8, 12);
    return riff === "RIFF" && webp === "WEBP";
  }

  return false;
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return apiError("Silakan masuk untuk mengunggah berkas.", 401);
    }

    // Rate limit: max 15 uploads per minute per user
    const rateLimit = checkRateLimit(`upload:${session.id}`, {
      limit: 15,
      windowMs: 60 * 1000,
    });

    if (!rateLimit.allowed) {
      return apiError(`Terlalu banyak permintaan unggah. Coba lagi dalam ${rateLimit.retryAfterSec} detik.`, 429);
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folderType = ((formData.get("type") as string) || "produk") as "produk" | "profil";

    if (!file) {
      return apiError("Tidak ada file yang dipilih.", 400);
    }

    const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];
    const ext = path.extname(file.name).toLowerCase();

    if (!allowedExtensions.includes(ext)) {
      return apiError("Format gambar hanya boleh JPG, JPEG, PNG, atau WEBP.", 400);
    }

    if (file.size > 5 * 1024 * 1024) {
      return apiError("Ukuran file maksimal 5MB.", 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Validate binary signature (magic bytes) to prevent disguised executable payloads
    if (!isValidImageBuffer(buffer, ext)) {
      return apiError("Isi file tidak sesuai dengan format gambar yang valid.", 400);
    }

    const result = await storageService.uploadFile(
      folderType,
      buffer,
      file.name,
      file.type || (ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg")
    );

    return apiSuccess({
      success: true,
      fileName: result.fileName,
      url: result.publicUrl,
    });
  } catch (err) {
    return handleApiError(err, "Gagal mengunggah gambar.");
  }
}
