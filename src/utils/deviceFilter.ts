import type { Device } from '../types/domain';

export type StockFilterTab = 'All' | 'Available' | 'Sold';

// Shared by StockListScreen (the device list) and StockReportPreviewScreen
// (the report) so both always agree on what "the current filter" means.
// `brand`, when given, is a hard lock (exact match) — distinct from `query`,
// which is free-text search the dealer can still edit/clear without losing
// the brand lock.
export function filterDevices(
  devices: Device[],
  filter: StockFilterTab,
  query: string,
  brand?: string,
): Device[] {
  return devices.filter(device => {
    if (brand && device.brand !== brand) {
      return false;
    }
    if (filter !== 'All' && device.status !== filter) {
      return false;
    }
    if (!query.trim()) {
      return true;
    }
    const q = query.trim().toLowerCase();
    return (
      device.imei1.includes(q) ||
      device.brand.toLowerCase().includes(q) ||
      device.model.toLowerCase().includes(q)
    );
  });
}
