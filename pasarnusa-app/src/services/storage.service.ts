import { supabaseAdmin } from "@/lib/supabase";
import fs from "node:fs/promises";
import path from "node:path";

export const storageService = {
  async uploadFile(
    bucket: "produk" | "profil",
    fileBuffer: Buffer,
    fileName: string,
    contentType: string
  ): Promise<{ publicUrl: string; fileName: string }> {
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const uniqueFileName = `${Date.now()}-${cleanFileName}`;

    try {
      const { data, error } = await supabaseAdmin.storage
        .from(bucket)
        .upload(uniqueFileName, fileBuffer, {
          contentType: contentType || "image/jpeg",
          upsert: true,
        });

      if (error) {
        throw error;
      }

      const { data: publicData } = supabaseAdmin.storage
        .from(bucket)
        .getPublicUrl(data.path);

      return {
        publicUrl: publicData.publicUrl,
        fileName: uniqueFileName,
      };
    } catch (supabaseError) {
      console.warn("Supabase Storage upload warning, falling back to local:", supabaseError);

      // Local disk fallback
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await fs.mkdir(uploadDir, { recursive: true });
      const localFilePath = path.join(uploadDir, uniqueFileName);
      await fs.writeFile(localFilePath, fileBuffer);

      return {
        publicUrl: `/uploads/${uniqueFileName}`,
        fileName: uniqueFileName,
      };
    }
  },
};
