import { chatService } from "@/backend/services";
import { apiSuccess, apiError, handleApiError } from "@/backend/lib/api-response";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const message = body?.message;
    if (typeof message !== "string" || message.trim().length === 0) {
      return apiError("Pesan tidak boleh kosong.", 400);
    }
    if (message.trim().length > 500) {
      return apiError("Pesan terlalu panjang, maksimal 500 karakter.", 400);
    }

    const intent = await chatService.handleMessage(message);
    return apiSuccess(intent);
  } catch (err) {
    return handleApiError(err, "Gagal memproses pesan.");
  }
}
