export function resolveMediaUrl(
  value: string | null | undefined,
  folder: "produk" | "profil"
): string {
  if (!value) return "";
  if (/^https?:\/\//i.test(value) || value.startsWith("/")) return value;
  return `/uploads/${folder}/${value}`;
}

export function resolveProductImage(value: string | null | undefined): string {
  return resolveMediaUrl(value, "produk") || "/pasar.jpg";
}

export function resolveProfileImage(value: string | null | undefined): string {
  return resolveMediaUrl(value, "profil");
}
