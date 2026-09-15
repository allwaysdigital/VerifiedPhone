// Device purchase/sale dates are stored as "D/M/YYYY" strings (see
// DashboardScreen's todayLabel()). Returns null for missing/malformed input.
export function parseDMY(value?: string): Date | null {
  if (!value) {
    return null;
  }
  const [day, month, year] = value.split('/').map(Number);
  if (!day || !month || !year) {
    return null;
  }
  return new Date(year, month - 1, day);
}
