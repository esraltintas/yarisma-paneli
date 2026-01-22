// src/lib/format.ts

/**
 * Eski kullanım bozulmasın diye duruyor.
 * Eğer eskiden dakikaydı vs. karıştıysa bunu artık kullanmamaya çalış.
 */
export function formatTime(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return "-";
  return `${Number(value).toFixed(2)} sn`;
}

/**
 * Artık sistem saniye.
 * Sadece saniye text'i için:
 * 120 -> "120 sn"
 */
export function formatSeconds(sec: number | null | undefined) {
  if (sec == null || Number.isNaN(sec)) return "-";
  const s = Math.max(0, sec);
  // istersen burada virgül/ondalık yönetebiliriz
  return `${s}`.replace(".", ",") + " sn";
}

/**
 * Yanında dakika gösterimi:
 * 120 -> "2:00 dk"
 * 320 -> "5:20 dk"
 */
export function formatSecondsToMinSec(sec: number | null | undefined) {
  if (sec == null || Number.isNaN(sec)) return "-";
  const s = Math.max(0, Math.floor(sec));

  const m = Math.floor(s / 60);
  const r = s % 60;

  return `${m}:${String(r).padStart(2, "0")} dk`;
}

/**
 * Export vb durumlarda dakika (ondalıklı) da gerekirse:
 * 120 -> "2,00 dk"
 */
export function formatSecondsToMinutesDecimal(sec: number | null | undefined) {
  if (sec == null || Number.isNaN(sec)) return "-";
  const m = Math.max(0, sec) / 60;
  return m.toFixed(2).replace(".", ",") + " dk";
}
