export function competitionRanksByTime<T>(
  itemsSortedAsc: T[],
  getTime: (item: T) => number
) {
  const ranks: number[] = [];
  let lastTime: number | null = null;
  let lastRank = 0;

  itemsSortedAsc.forEach((item, index) => {
    const time = getTime(item);

    // yeni süre geldiyse: rank = index + 1  ✅ (bu atlamayı otomatik yapar)
    if (lastTime === null || time !== lastTime) {
      lastRank = index + 1;
      lastTime = time;
    }

    ranks.push(lastRank);
  });

  return ranks;
}
