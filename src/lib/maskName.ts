// src/lib/maskName.ts

/**
 * "Ad Soyad" -> "Ad S***"
 * - soyad = son kelime
 * - birden fazla ad varsa hepsi görünür
 * - soyad yoksa olduğu gibi döner
 */
export function maskName(fullName: string) {
  const name = (fullName ?? "").trim().replace(/\s+/g, " ");
  if (!name) return "";

  const parts = name.split(" ");
  if (parts.length === 1) return name; // soyad yok

  const last = parts[parts.length - 1];
  const firstNames = parts.slice(0, -1).join(" ");

  // soyad ilk harf
  const initial = last.charAt(0).toUpperCase();

  return `${firstNames} ${initial}***`;
}
