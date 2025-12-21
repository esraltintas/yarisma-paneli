export function formatTime(min: number | null) {
  if (min === null) return "-";
  return `${min.toFixed(2)} dk`;
}
