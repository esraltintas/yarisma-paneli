export function stagePointsByRank(rank: number) {
  if (rank <= 3) return 100;
  if (rank <= 7) return 95;
  if (rank <= 12) return 90;
  if (rank <= 20) return 85;
  if (rank <= 30) return 80;
  if (rank <= 40) return 75;
  if (rank <= 50) return 70;
  if (rank <= 60) return 65;
  if (rank <= 70) return 60;
  if (rank <= 80) return 55;
  if (rank <= 88) return 50;
  if (rank <= 94) return 45;
  if (rank <= 97) return 35;
  if (rank <= 99) return 20;
  return 0; // 100.
}
