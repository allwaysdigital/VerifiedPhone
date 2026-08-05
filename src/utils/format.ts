export function formatINR(value: number): string {
  return `₹${value.toLocaleString('en-IN')}`;
}

export function formatLakhs(value: number): string {
  return `₹${(value / 100000).toFixed(1)}L`;
}
