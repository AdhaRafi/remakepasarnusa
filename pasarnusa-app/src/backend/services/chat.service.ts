import { supabaseAdmin } from "@/backend/lib/supabase";
import { Product } from "@/shared/types";
import { resolveProductImage } from "@/shared/media";

export interface ChatProductCard {
  id: number;
  nama_produk: string;
  harga: number;
  stok: number;
  kategori: string;
  asal_daerah: string;
  nama_toko: string;
  foto: string;
}

export interface ChatIntent {
  reply: string;
  products?: ChatProductCard[];
  action?: { label: string; href: string };
  suggestions?: string[];
}

const CATEGORY_HINTS: Record<string, string[]> = {
  Kerajinan: [
    "kerajinan", "gerabah", "tembikar", "ukiran", "ukir", "kayu",
    "anyaman", "bambu", "kasongan", "keramik", "patung", "kriya"
  ],
  Fashion: [
    "batik", "tenun", "ikat", "wastra", "kain", "sarung",
    "busana", "pakaian", "fashion", "sumba", "toraja", "pekalongan", "baju"
  ],
  Kuliner: [
    "kuliner", "kopi", "makanan", "minuman", "rempah", "jamu",
    "madu", "snack", "robusta", "arabika", "ijen", "gula", "garam", "camilan"
  ],
  Kecantikan: [
    "kecantikan", "minyak", "atsiri", "lulur", "dupa", "herbal",
    "aroma", "aromaterapi", "skincare", "sabun", "perawatan"
  ],
  Lainnya: [
    "anyaman", "rotan", "ketak", "sasak", "tas", "topi", "tikar"
  ],
};

const DEFAULT_SUGGESTIONS = [
  "Rekomendasi Tenun & Batik",
  "Kopi Robusta Nusantara",
  "Cara Belanja & Bayar",
  "Cara Buka Toko Pengrajin",
];

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function toCard(p: Product): ChatProductCard {
  return {
    id: p.id,
    nama_produk: p.nama_produk,
    harga: p.harga,
    stok: p.stok,
    kategori: p.kategori,
    asal_daerah: p.asal_daerah || "Nusantara",
    nama_toko: (p as Product & { users?: { nama?: string } }).users?.nama || "Toko Kriya Nusantara",
    foto: resolveProductImage(p.foto_produk),
  };
}

async function searchProducts(term: string, kategori?: string): Promise<Product[]> {
  try {
    // 1. Fetch recent products (up to 25 items for fast in-memory relevance scoring)
    const { data, error } = await supabaseAdmin
      .from("produk")
      .select("*, users:id_penjual(nama)")
      .order("id", { ascending: false })
      .limit(25);

    if (error || !data) return [];

    const allProducts = (data as Product[]).map((p) => ({
      ...p,
      nama_toko: (p as Product & { users?: { nama?: string } }).users?.nama || "Toko Kriya Nusantara",
    }));

    const cleanKeywords = term
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length >= 3 && !["ada", "mau", "dan", "yang", "bisa", "untuk", "dari", "khas", "nusantara"].includes(w));

    // Score products based on keyword match & category
    const scored = allProducts.map((p) => {
      let score = 0;
      const haystack = `${p.nama_produk} ${p.deskripsi || ""} ${p.asal_daerah || ""} ${p.kategori}`.toLowerCase();

      if (kategori && p.kategori.toLowerCase() === kategori.toLowerCase()) {
        score += 5;
      }

      for (const kw of cleanKeywords) {
        if (p.nama_produk.toLowerCase().includes(kw)) score += 10;
        else if (haystack.includes(kw)) score += 3;
      }

      return { product: p, score };
    });

    const filtered = scored
      .filter((item) => (cleanKeywords.length > 0 ? item.score > 0 : (!kategori || item.product.kategori.toLowerCase() === kategori.toLowerCase())))
      .sort((a, b) => b.score - a.score)
      .map((item) => item.product);

    if (filtered.length > 0) {
      return filtered.slice(0, 4);
    }

    // Fallback by category if keywords didn't hit
    if (kategori) {
      const byCat = allProducts.filter((p) => p.kategori.toLowerCase() === kategori.toLowerCase());
      if (byCat.length > 0) return byCat.slice(0, 4);
    }

    return allProducts.slice(0, 4);
  } catch {
    return [];
  }
}

function detectCategory(text: string): string | null {
  for (const [kategori, words] of Object.entries(CATEGORY_HINTS)) {
    if (words.some((w) => text.includes(w))) return kategori;
  }
  return null;
}

// Free Google Gemini API integration (if GEMINI_API_KEY is configured)
async function callGeminiIfAvailable(userMessage: string, contextCatalog: string): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const systemPrompt = `Kamu adalah Nusa, asisten virtual resmi PasarNusa (marketplace kriya, wastra, kuliner, dan produk UMKM pengrajin Nusantara asli Indonesia).
Kepribadian: Ramah, santun, hangat, berpengetahuan luas tentang kekayaan budaya dan kerajinan Nusantara.
Tugas: Membantu calon pembeli menemukan karya terbaik, memahami cara order/pembayaran, dan mendukung pengrajin lokal.
Aturan:
- Gunakan Bahasa Indonesia yang natural dan bersahabat.
- Jawab secara ringkas (1-3 paragraf singkat, jangan bertele-tele).
- Jika ada produk yang relevan di katalog, rekomendasikan nama produk tersebut.
Katalog saat ini:
${contextCatalog}`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: `${systemPrompt}\n\nPertanyaan Pembeli: "${userMessage}"` }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 300,
          },
        }),
      }
    );

    if (!res.ok) return null;
    const json = await res.json();
    const reply = json?.candidates?.[0]?.content?.parts?.[0]?.text;
    return typeof reply === "string" ? reply.trim() : null;
  } catch {
    return null;
  }
}

export const chatService = {
  async handleMessage(rawMessage: string): Promise<ChatIntent> {
    const raw = rawMessage || "";
    const text = normalize(raw);

    if (!text) {
      return {
        reply: "Halo! Saya Nusa, asisten PasarNusa. Ada karya kriya atau wastra Nusantara yang ingin kamu cari hari ini?",
        suggestions: DEFAULT_SUGGESTIONS,
      };
    }

    // 1. Sapaan / Greeting
    if (/^(hai|hi|halo|hallo|hello|pagi|siang|sore|malam|assalamualaikum|permisi|hei)\b/.test(text) && text.length <= 25) {
      return {
        reply: "Halo! Saya Nusa, asisten virtual PasarNusa. Senang bertemu denganmu! Kamu bisa mencari kriya, wastra nusantara, kuliner khas, atau bertanya cara belanja.",
        suggestions: [
          "Lihat koleksi tenun & batik",
          "Kopi robusta lereng Ijen",
          "Cara memesan produk",
          "Cara daftar buka toko",
        ],
      };
    }

    // 2. Pertanyaan Seputar Toko & Buka Usaha UMKM
    if (/\b(buka toko|jual|jualan|penjual|pengrajin|daftar mitra|mitra|umkm|gabung)\b/.test(text)) {
      return {
        reply: "Mendukung pengrajin lokal adalah misi utama kami! Kamu bisa mendaftar gratis sebagai Penjual di PasarNusa untuk memasarkan karya ke seluruh Indonesia.",
        action: { label: "Daftar Jadi Penjual", href: "/daftar" },
        suggestions: ["Syarat pendaftaran", "Metode pencairan dana", "Cari produk kriya"],
      };
    }

    // 3. Pelacakan & Status Pesanan
    if (/\b(status|lacak|pesanan|resi|kiriman|orderan|cek pesanan)\b/.test(text)) {
      return {
        reply: "Untuk mengecek status pesanan atau nomor resi pengiriman, kamu bisa membuka halaman 'Pesanan Saya' setelah masuk ke akunmu.",
        action: { label: "Buka Pesanan Saya", href: "/pesanan" },
        suggestions: ["Ongkir & kurir", "Metode pembayaran", "Belanja kriya lain"],
      };
    }

    // 4. Pembayaran
    if (/\b(bayar|pembayaran|midtrans|qris|gopay|shopeepay|transfer|cod|bank|rekening)\b/.test(text)) {
      return {
        reply: "PasarNusa mendukung berbagai metode pembayaran yang aman: QRIS (GoPay, OVO, ShopeePay), Transfer Virtual Account Bank (BCA, Mandiri, BNI, BRI), dan opsi Bayar di Tempat (COD).",
        suggestions: ["Apakah aman?", "Berapa lama verifikasi?", "Pilihan kurir"],
      };
    }

    // 5. Pengiriman & Ongkir
    if (/\b(ongkir|kirim|pengiriman|kurir|ekspedisi|jne|jnt|j&t|sicepat|ambil)\b/.test(text)) {
      return {
        reply: "Kami bekerja sama dengan ekspedisi terpercaya (JNE, J&T, SiCepat) dengan jangkauan ke seluruh Indonesia. Biaya ongkir dihitung otomatis saat checkout, atau pilih 'Ambil di Tempat' untuk bebas ongkir.",
        suggestions: ["Berapa hari pengiriman?", "Metode pembayaran", "Katalog produk"],
      };
    }

    // 6. Cara Belanja
    if (/\b(cara belanja|cara beli|cara order|cara pesan|gimana belinya|bantuan|tata cara)\b/.test(text)) {
      return {
        reply: "Cara berbelanja di PasarNusa sangat praktis:\n1. Pilih karya kriya favoritmu dari katalog.\n2. Klik 'Beli Langsung' atau masukkan ke keranjang.\n3. Masukkan alamat pengiriman & pilih kurir.\n4. Pilih metode bayar (QRIS/Transfer/COD) dan selesaikan pesanan!",
        action: { label: "Mulai Jelajahi Katalog", href: "/#katalog" },
        suggestions: ["Rekomendasi batik", "Kopi nusantara", "Gerabah & keramik"],
      };
    }

    // 7. Keaslian & Legalitas Produk
    if (/\b(asli|original|kualitas|garansi|terpercaya|aman|penipuan)\b/.test(text)) {
      return {
        reply: "Seluruh karya di PasarNusa dikurasi langsung dari tangan pengrajin dan UMKM lokal Nusantara. Kami menjamin keaslian kriya dan wastra tradisional serta keamanan transaksi 100%.",
        suggestions: ["Lihat produk terkurasi", "Cara order", "Metode bayar"],
      };
    }

    // 8. Pencarian Produk di Database
    const kategori = detectCategory(text);
    const searchTerms = text
      .replace(/\b(saya|mau|cari|ada|ga|ngga|bisa|rekomendasi|rekomendasikan|karya|produk|beli|tampilkan|lihat|dong|kah|tentang)\b/g, " ")
      .trim();

    const matchedProducts = await searchProducts(searchTerms, kategori || undefined);

    // Context summary for Gemini AI if enabled
    const contextCatalog = matchedProducts.length > 0
      ? matchedProducts.map((p) => `- ${p.nama_produk} (Rp ${p.harga.toLocaleString("id-ID")}, Asal: ${p.asal_daerah})`).join("\n")
      : "Beberapa produk: Tenun Ikat Sumba, Batik Tulis Pekalongan, Gerabah Kasongan, Kopi Robusta Lereng Ijen, Tas Anyaman Ketak.";

    // Try Gemini AI if available (Free Tier)
    const geminiReply = await callGeminiIfAvailable(rawMessage, contextCatalog);
    if (geminiReply) {
      return {
        reply: geminiReply,
        products: matchedProducts.length > 0 ? matchedProducts.map(toCard) : undefined,
        suggestions: [
          "Batik & Tenun Nusantara",
          "Kopi & Kuliner Khas",
          "Cek Pesanan Saya",
          "Cara Jadi Penjual",
        ],
      };
    }

    // Built-in Smart Matching fallback
    if (matchedProducts.length > 0) {
      const label = kategori ? `kategori ${kategori.toLowerCase()}` : "pencarianmu";
      return {
        reply: `Ketemu! Ini beberapa karya pilihan yang cocok untuk ${label}. Kamu bisa langsung menambahkan ke keranjang:`,
        products: matchedProducts.map(toCard),
        suggestions: ["Lihat katalog lengkap", "Cari produk lain", "Cara bayar"],
      };
    }

    if (kategori) {
      return {
        reply: `Karya untuk kategori ${kategori} sedang terus diperbarui oleh pengrajin mitra kami. Kamu bisa mengecek etalase kategori ${kategori} secara langsung di katalog:`,
        action: { label: `Buka Katalog ${kategori}`, href: `/?kategori=${encodeURIComponent(kategori)}#katalog` },
        suggestions: ["Rekomendasi Tenun", "Kopi Nusantara", "Kerajinan Gerabah"],
      };
    }

    // Default polite response
    return {
      reply: "Saya siap bantu carikan karya kriya dan wastra Nusantara. Coba sebutkan nama karya (misal: Tenun Ikat, Kopi Robusta, Gerabah), daerah asal (Sumba, Jogja, Pekalongan), atau kategori belanja.",
      action: { label: "Jelajahi Semua Produk", href: "/#katalog" },
      suggestions: DEFAULT_SUGGESTIONS,
    };
  },
};
