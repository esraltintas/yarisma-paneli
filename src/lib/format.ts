export function formatTime(sec: number | null) {
  if (sec === null) return "-";

  // saniye integer’a yakınsa integer göster
  const s = Math.round(sec * 100) / 100;

  const m = Math.floor(s / 60);
  const r = s - m * 60;

  // 0–59.99 arası: "12.34s"
  if (m === 0) return `${r.toFixed(r % 1 === 0 ? 0 : 2)}s`;

  // 1:02.34 format
  const rr = r.toFixed(r % 1 === 0 ? 0 : 2).padStart(2, "0");
  return `${m}:${rr}`;
}
