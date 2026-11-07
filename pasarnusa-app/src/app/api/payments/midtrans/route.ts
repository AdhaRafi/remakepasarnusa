import crypto from "node:crypto";
import { supabaseAdmin } from "@/backend/lib/supabase";
import { orderService } from "@/backend/services";
import { apiSuccess, apiError, handleApiError } from "@/backend/lib/api-response";
import { MIDTRANS_SERVER_KEY } from "@/shared/midtrans";

interface MidtransNotification {
  order_id?: string;
  status_code?: string;
  gross_amount?: string;
  signature_key?: string;
  transaction_status?: string;
  fraud_status?: string;
}

export async function POST(req: Request) {
  try {
    if (!MIDTRANS_SERVER_KEY) {
      return apiError("Midtrans belum dikonfigurasi.", 503);
    }

    const body = (await req.json()) as MidtransNotification;
    const { order_id, status_code, gross_amount, signature_key, transaction_status, fraud_status } = body;

    if (!order_id || !status_code || !gross_amount || !signature_key) {
      return apiError("Payload notifikasi tidak lengkap.", 400);
    }

    const expectedSignature = crypto
      .createHash("sha512")
      .update(`${order_id}${status_code}${gross_amount}${MIDTRANS_SERVER_KEY}`)
      .digest("hex");

    if (expectedSignature !== signature_key) {
      return apiError("Signature notifikasi tidak valid.", 401);
    }

    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select("id, status")
      .eq("order_number", order_id)
      .maybeSingle();

    if (error || !order) {
      return apiError("Pesanan tidak ditemukan.", 404);
    }

    let nextStatus: string | null = null;

    if (transaction_status === "capture" || transaction_status === "settlement") {
      if (fraud_status === "accept" || !fraud_status) nextStatus = "paid";
    } else if (transaction_status === "pending") {
      nextStatus = "pending";
    } else if (["deny", "cancel", "expire", "failure"].includes(transaction_status || "")) {
      nextStatus = "dibatalkan";
    }

    if (!nextStatus) {
      return apiSuccess({ ok: true, ignored: true });
    }

    const { error: updateError } = await supabaseAdmin
      .from("orders")
      .update({ status: nextStatus })
      .eq("id", order.id);

    if (updateError) throw updateError;

    if (nextStatus === "dibatalkan" && order.status !== "dibatalkan") {
      await orderService.restoreStock(order.id);
    }

    return apiSuccess({ ok: true, status: nextStatus });
  } catch (err) {
    return handleApiError(err, "Gagal memproses notifikasi pembayaran.");
  }
}
