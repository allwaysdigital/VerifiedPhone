// "Apple iPhone 13", without repeating the brand when the model already has it
// ("Samsung A52" stays "Samsung A52").
export function deviceName(device: { brand: string; model: string }): string {
  const brand = device.brand.trim();
  const model = device.model.trim();
  if (!brand || model.toLowerCase().startsWith(brand.toLowerCase())) {
    return model;
  }
  return `${brand} ${model}`;
}

export function formatINR(value: number): string {
  return `₹${value.toLocaleString('en-IN')}`;
}

// Full rupees with Indian grouping below ₹1 lakh (₹1,500, ₹12,345); lakhs or
// crores with two decimals above that (₹1.25L, ₹2.50Cr). Small shops must see
// ₹1,500 as ₹1,500, not "₹0.0L".
export function formatAmount(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 1_00_00_000) {
    return `${sign}₹${(abs / 1_00_00_000).toFixed(2)}Cr`;
  }
  if (abs >= 1_00_000) {
    return `${sign}₹${(abs / 1_00_000).toFixed(2)}L`;
  }
  return `${sign}₹${Math.round(abs).toLocaleString('en-IN')}`;
}

// Short chart-axis labels: 0, 500, 2.5K, 1.5L, 2Cr.
export function formatAxisValue(value: number): string {
  const trim = (n: number) => String(Number(n.toFixed(2)));
  if (value >= 1_00_00_000) {
    return `${trim(value / 1_00_00_000)}Cr`;
  }
  if (value >= 1_00_000) {
    return `${trim(value / 1_00_000)}L`;
  }
  if (value >= 1_000) {
    return `${trim(value / 1_000)}K`;
  }
  return String(value);
}

// A profit figure isn't always a profit — a phone can sell for less than
// it cost. Pair this with formatINR(Math.abs(value)) so a loss reads as
// "Total Loss ₹500" instead of a confusingly-labeled "Total Profit ₹-500".
export function profitLossLabel(value: number, prefix: string = 'Total'): string {
  return `${prefix} ${value < 0 ? 'Loss' : 'Profit'}`;
}
