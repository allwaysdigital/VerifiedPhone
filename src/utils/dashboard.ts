import { deviceName, formatAmount } from './format';
import type { Device } from '../types/domain';

export type BrandRow = { brand: string; units: string; value: string; deviceIds: string[] };

// e.g. "Samsung Galaxy A52 +2 more" — the newest phone in stock (devices come
// newest first) plus a count of the rest; undefined when nothing is in stock.
export function stockSummary(devices: Device[]): string | undefined {
  const available = devices.filter(d => d.status === 'Available');
  if (available.length === 0) {
    return undefined;
  }
  const name = deviceName(available[0]);
  return available.length > 1 ? `${name} +${available.length - 1} more` : name;
}

// Stock on hand per brand — matching Total Stock, so sold phones aren't counted.
export function brandDistribution(devices: Device[]): BrandRow[] {
  const byBrand = new Map<string, { units: number; value: number; deviceIds: string[] }>();
  devices
    .filter(device => device.status === 'Available')
    .forEach(device => {
      const entry = byBrand.get(device.brand) ?? { units: 0, value: 0, deviceIds: [] };
      entry.units += 1;
      entry.value += device.purchasePrice;
      entry.deviceIds.push(device.id);
      byBrand.set(device.brand, entry);
    });
  return Array.from(byBrand.entries())
    .map(([brand, { units, value, deviceIds }]) => ({
      brand,
      units: `${units} unit${units === 1 ? '' : 's'}`,
      value: formatAmount(value),
      deviceIds,
    }))
    .sort((a, b) => a.brand.localeCompare(b.brand));
}
