export function formatINR(value: number): string {
  return `₹${value.toLocaleString('en-IN')}`;
}

export function formatLakhs(value: number): string {
  return `₹${(value / 100000).toFixed(1)}L`;
}

// A profit figure isn't always a profit — a phone can sell for less than
// it cost. Pair this with formatINR(Math.abs(value)) so a loss reads as
// "Total Loss ₹500" instead of a confusingly-labeled "Total Profit ₹-500".
export function profitLossLabel(value: number, prefix: string = 'Total'): string {
  return `${prefix} ${value < 0 ? 'Loss' : 'Profit'}`;
}
