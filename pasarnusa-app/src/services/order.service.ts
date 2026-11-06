import { supabaseAdmin, getNextId } from "@/lib/supabase";
import { Order, OrderStatus, SessionUser, Product } from "@/types";
import { createMidtransTransaction, MIDTRANS_CLIENT_KEY, MIDTRANS_SERVER_KEY } from "@/lib/midtrans";

export interface CheckoutPayloadItem {
  id: number;
  qty: number;
}

export interface CheckoutPayload {
  items: CheckoutPayloadItem[];
  nama_penerima: string;
  no_hp: string;
  alamat: string;
  kota: string;
  provinsi: string;
  kode_pos: string;
  catatan?: string | null;
  kurir?: string;
  metode_pembayaran?: string;
}

interface CustomErrorWithDetails extends Error {
  details?: string[];
}

export const orderService = {
  async getOrders(session: SessionUser, statusFilter?: string | null): Promise<Order[]> {
    if (session.role === "admin") {
      let query = supabaseAdmin
        .from("orders")
        .select("*, items:order_items(*)")
        .order("id", { ascending: false });

      if (statusFilter && statusFilter !== "semua") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as Order[];
    }

    if (session.role === "penjual") {
      // Find orders that contain this seller's products
      const { data: sellerProds, error: pErr } = await supabaseAdmin
        .from("produk")
        .select("id")
        .eq("id_penjual", session.id);

      if (pErr) throw pErr;
      const prodIds = (sellerProds || []).map((p: { id: number }) => p.id);
      if (prodIds.length === 0) return [];

      const { data: orderItems, error: oiErr } = await supabaseAdmin
        .from("order_items")
        .select("order_id")
        .in("id_produk", prodIds);

      if (oiErr) throw oiErr;
      const orderIds = Array.from(new Set((orderItems || []).map((oi: { order_id: number }) => oi.order_id)));
      if (orderIds.length === 0) return [];

      let query = supabaseAdmin
        .from("orders")
        .select("*, items:order_items(*)")
        .in("id", orderIds)
        .order("id", { ascending: false });

      if (statusFilter && statusFilter !== "semua") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as Order[];
    }

    // Buyer's orders
    let query = supabaseAdmin
      .from("orders")
      .select("*, items:order_items(*)")
      .eq("id_pembeli", session.id)
      .order("id", { ascending: false });

    if (statusFilter && statusFilter !== "semua") {
      query = query.eq("status", statusFilter);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as Order[];
  },

  async getOrderById(id: number): Promise<Order | null> {
    const { data, error } = await supabaseAdmin
      .from("orders")
      .select("*, items:order_items(*)")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) return null;
    return data as Order;
  },

  async updateOrderStatus(
    orderId: number,
    session: SessionUser,
    payload: {
      status?: OrderStatus;
      nama_penerima?: string;
      no_hp?: string;
      alamat?: string;
      kota?: string;
      provinsi?: string;
      kurir?: string;
    }
  ): Promise<{ message: string }> {
    const existing = await this.getOrderById(orderId);
    if (!existing) {
      throw new Error("Pesanan tidak ditemukan.");
    }

    const { status, nama_penerima, no_hp, alamat, kota, provinsi, kurir } = payload;

    if (session.role === "admin") {
      const updateData: Record<string, unknown> = {};
      if (status !== undefined) updateData.status = status;
      if (nama_penerima !== undefined) updateData.nama_penerima = nama_penerima;
      if (no_hp !== undefined) updateData.no_hp = no_hp;
      if (alamat !== undefined) updateData.alamat = alamat;
      if (kota !== undefined) updateData.kota = kota;
      if (provinsi !== undefined) updateData.provinsi = provinsi;
      if (kurir !== undefined) updateData.kurir = kurir;

      const { error } = await supabaseAdmin
        .from("orders")
        .update(updateData)
        .eq("id", orderId);

      if (error) throw error;
      return { message: "Pesanan berhasil diperbarui oleh Admin." };
    }

    if (session.role === "penjual") {
      // Verify seller has products in this order
      const { data: sellerProds } = await supabaseAdmin
        .from("produk")
        .select("id")
        .eq("id_penjual", session.id);

      const prodIds = (sellerProds || []).map((p: { id: number }) => p.id);
      let hasProduct = false;
      if (prodIds.length > 0) {
        const { data: matchedItems } = await supabaseAdmin
          .from("order_items")
          .select("id")
          .eq("order_id", orderId)
          .in("id_produk", prodIds)
          .limit(1);

        hasProduct = (matchedItems || []).length > 0;
      }

      if (!hasProduct) {
        throw new Error("Pesanan ini tidak memuat produk toko Anda.");
      }

      const allowedStatus: OrderStatus[] = ["diproses", "dikirim"];
      if (!status || !allowedStatus.includes(status)) {
        throw new Error("Penjual hanya dapat memperbarui status ke Diproses atau Dikirim.");
      }

      const { error } = await supabaseAdmin
        .from("orders")
        .update({ status })
        .eq("id", orderId);

      if (error) throw error;
      return { message: `Status pesanan diubah menjadi ${status}.` };
    }

    if (session.role === "pembeli" && existing.id_pembeli === session.id) {
      if (status === "selesai" && existing.status === "dikirim") {
        const { error } = await supabaseAdmin
          .from("orders")
          .update({ status: "selesai" })
          .eq("id", orderId);

        if (error) throw error;
        return { message: "Terima kasih telah mengonfirmasi pesanan diterima." };
      }
    }

    throw new Error("Operasi tidak diizinkan.");
  },

  async processCheckout(session: SessionUser | null, payload: CheckoutPayload) {
    const {
      items,
      nama_penerima,
      no_hp,
      alamat,
      kota,
      provinsi,
      kode_pos,
      catatan,
      kurir,
    } = payload;

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error("Keranjang belanja kosong.");
    }

    if (
      items.some((item) => !Number.isSafeInteger(item?.id) || !Number.isSafeInteger(item?.qty) || item.qty < 1) ||
      new Set(items.map((item) => item.id)).size !== items.length
    ) {
      throw new Error("Daftar produk atau jumlah pesanan tidak valid.");
    }

    if (!MIDTRANS_SERVER_KEY || !MIDTRANS_CLIENT_KEY) {
      throw new Error("Pembayaran online belum dikonfigurasi. Silakan hubungi admin.");
    }

    if (!nama_penerima || !no_hp || !alamat || !kota || !provinsi || !kode_pos) {
      throw new Error("Data alamat dan kontak penerima wajib diisi lengkap.");
    }

    // Verify stock and compute subtotal using fresh database values
    const stockErrors: string[] = [];
    const validatedItems: Array<{ product: Product; qty: number; subtotal: number }> = [];
    let calculatedSubtotal = 0;

    for (const item of items) {
      const { data: product, error } = await supabaseAdmin
        .from("produk")
        .select("*")
        .eq("id", item.id)
        .maybeSingle();

      if (error || !product) {
        stockErrors.push(`Produk dengan ID #${item.id} tidak lagi tersedia.`);
        continue;
      }

      if (product.stok < item.qty) {
        stockErrors.push(`Stok "${product.nama_produk}" tidak mencukupi (Tersedia: ${product.stok}, dipesan: ${item.qty}).`);
        continue;
      }

      const itemSubtotal = product.harga * item.qty;
      calculatedSubtotal += itemSubtotal;
      validatedItems.push({
        product: product as Product,
        qty: item.qty,
        subtotal: itemSubtotal,
      });
    }

    if (stockErrors.length > 0) {
      const err: CustomErrorWithDetails = new Error("Kendala stok produk.");
      err.details = stockErrors;
      throw err;
    }

    const totalAmount = calculatedSubtotal;
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
    const randSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `PN-${dateStr}-${randSuffix}`;

    const safeNama = nama_penerima.replace(/<[^>]*>/g, "").trim();
    const safeHp = no_hp.replace(/[^0-9+\s-]/g, "").trim();
    const safeAlamat = alamat.replace(/<[^>]*>/g, "").trim();
    const safeKota = kota.replace(/<[^>]*>/g, "").trim();
    const safeProvinsi = provinsi.replace(/<[^>]*>/g, "").trim();
    const safeKodePos = kode_pos.replace(/[^0-9]/g, "").trim();
    const safeCatatan = catatan ? catatan.replace(/<[^>]*>/g, "").trim() : null;
    const safeKurir = kurir ? kurir.replace(/<[^>]*>/g, "").trim() : "Belum ditentukan";

    const snapResult = await createMidtransTransaction({
      orderId: orderNumber,
      grossAmount: totalAmount,
      customerDetails: {
        firstName: safeNama,
        phone: safeHp,
        address: safeAlamat,
        city: safeKota,
        postalCode: safeKodePos,
      },
      itemDetails: validatedItems.map((vi) => ({
        id: String(vi.product.id),
        name: vi.product.nama_produk,
        price: vi.product.harga,
        quantity: vi.qty,
      })),
    });

    const snapToken = snapResult.token;
    const redirectUrl = snapResult.redirectUrl;

    // Deduct stock
    for (const item of validatedItems) {
      const newStock = Math.max(0, item.product.stok - item.qty);
      await supabaseAdmin
        .from("produk")
        .update({ stok: newStock, updated_at: new Date().toISOString() })
        .eq("id", item.product.id);
    }

    const nextOrderId = await getNextId("orders");

    // Insert order
    const { data: orderData, error: orderErr } = await supabaseAdmin
      .from("orders")
      .insert({
        id: nextOrderId,
        order_number: orderNumber,
        id_pembeli: session ? session.id : null,
        nama_penerima: safeNama,
        no_hp: safeHp,
        alamat: safeAlamat,
        kota: safeKota,
        provinsi: safeProvinsi,
        kode_pos: safeKodePos,
        catatan: safeCatatan,
        kurir: safeKurir,
        metode_pembayaran: "midtrans",
        subtotal: calculatedSubtotal,
        ongkir: 0,
        diskon: 0,
        total_bayar: totalAmount,
        status: "pending",
        snap_token: snapToken,
      })
      .select("id")
      .single();

    if (orderErr || !orderData) {
      throw orderErr || new Error("Gagal membuat pesanan.");
    }

    const orderId = orderData.id;
    const startItemId = await getNextId("order_items");

    // Insert order items
    const itemsToInsert = validatedItems.map((item, idx) => ({
      id: startItemId + idx,
      order_id: orderId,
      id_produk: item.product.id,
      nama_produk: item.product.nama_produk,
      harga: item.product.harga,
      qty: item.qty,
      subtotal: item.subtotal,
    }));

    const { error: itemsErr } = await supabaseAdmin
      .from("order_items")
      .insert(itemsToInsert);

    if (itemsErr) console.error("Error inserting order items:", itemsErr);

    return {
      orderId,
      orderNumber,
      totalAmount,
      paymentMethod: "midtrans",
      snapToken,
      redirectUrl,
      message: "Pesanan berhasil dibuat.",
    };
  },
};
