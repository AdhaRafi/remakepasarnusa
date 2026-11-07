export const SHIPPING_RATES: Record<string, number> = {
  "JNE Reguler": 18000,
  "J&T Express": 20000,
  "SiCepat REG": 17000,
  "Ambil di Tempat": 0,
};

export const SHIPPING_OPTIONS = Object.entries(SHIPPING_RATES).map(([label, cost]) => ({
  label,
  cost,
}));

export function getShippingCost(kurir?: string | null): number {
  if (!kurir) return SHIPPING_RATES["JNE Reguler"];
  return SHIPPING_RATES[kurir] ?? SHIPPING_RATES["JNE Reguler"];
}
