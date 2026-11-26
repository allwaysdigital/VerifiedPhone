// Rounds a step up to 1, 2, 2.5 or 5 × 10ⁿ so the axis reads 0, 2.5K, 5K…
export function niceStep(rawStep: number): number {
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const multiplier = [1, 2, 2.5, 5, 10].find(m => m * magnitude >= rawStep) ?? 10;
  return multiplier * magnitude;
}

// 4 or 5 evenly spaced round steps, with a little headroom above the tallest
// bar. Of the two, it picks the axis whose top is closest to the data, so
// a ₹20,000 bar gets 0–25K in 5K steps and not 0–40K in 10K steps.
export function niceYAxis(maxValue: number): { yMax: number; yStep: number } {
  const target = Math.max(maxValue * 1.05, 100);
  let best = { yMax: Infinity, yStep: 0 };
  for (const sections of [4, 5]) {
    const yStep = niceStep(target / sections);
    const yMax = yStep * sections;
    if (yMax < best.yMax) {
      best = { yMax, yStep };
    }
  }
  return best;
}
