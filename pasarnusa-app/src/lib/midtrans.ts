export const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || "";
export const MIDTRANS_CLIENT_KEY = process.env.MIDTRANS_CLIENT_KEY || "";
export const MIDTRANS_IS_PRODUCTION = process.env.MIDTRANS_IS_PRODUCTION === "true";

export interface MidtransSnapParams {
  orderId: string;
  grossAmount: number;
  customerDetails: {
    firstName: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
  };
  itemDetails: Array<{
    id: string;
    price: number;
    quantity: number;
    name: string;
  }>;
}

export async function createMidtransTransaction(params: MidtransSnapParams): Promise<{ token: string; redirectUrl: string }> {
  if (!MIDTRANS_SERVER_KEY) throw new Error("Midtrans belum dikonfigurasi. Tambahkan MIDTRANS_SERVER_KEY pada environment.");
  const authString = Buffer.from(`${MIDTRANS_SERVER_KEY}:`).toString("base64");
  const endpoint = MIDTRANS_IS_PRODUCTION
    ? "https://app.midtrans.com/snap/v1/transactions"
    : "https://app.sandbox.midtrans.com/snap/v1/transactions";

  const payload = {
    transaction_details: {
      order_id: params.orderId,
      gross_amount: Math.round(params.grossAmount),
    },
    customer_details: {
      first_name: params.customerDetails.firstName,
      phone: params.customerDetails.phone,
      billing_address: {
        first_name: params.customerDetails.firstName,
        phone: params.customerDetails.phone,
        address: params.customerDetails.address,
        city: params.customerDetails.city,
        postal_code: params.customerDetails.postalCode,
      },
      shipping_address: {
        first_name: params.customerDetails.firstName,
        phone: params.customerDetails.phone,
        address: params.customerDetails.address,
        city: params.customerDetails.city,
        postal_code: params.customerDetails.postalCode,
      },
    },
    item_details: params.itemDetails.map((it) => ({
      id: String(it.id),
      price: Math.round(it.price),
      quantity: it.quantity,
      name: it.name.slice(0, 50),
    })),
  };

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Basic ${authString}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Midtrans menolak pembuatan transaksi.");
    }

    const data = await response.json();
    return {
      token: data.token,
      redirectUrl: data.redirect_url,
    };
  } catch {
    throw new Error("Tidak dapat terhubung ke Midtrans. Pesanan belum dapat dibayar.");
  }
}
