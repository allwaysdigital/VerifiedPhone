import { colors } from '../theme/colors';
import { parseDMY } from './date';
import type { Device } from '../types/domain';

// Shared by TransactionListScreen (the list) and TransactionReportPreviewScreen
// (the report) so both always agree on what each of the three history views
// means — same relationship StockListScreen/StockReportPreviewScreen have.
export type TransactionMode = 'purchase' | 'sale' | 'profit';

export const TRANSACTION_MODE_META: Record<
  TransactionMode,
  {
    title: string;
    accent: string;
    summaryLabel: string;
    summaryValue: (devices: Device[]) => number;
    summaryCaption: (count: number) => string;
    emptyMessage: string;
    searchPlaceholder: string;
  }
> = {
  purchase: {
    title: 'Purchase History',
    accent: colors.purple,
    summaryLabel: 'Total Purchases',
    summaryValue: devices => devices.reduce((sum, d) => sum + d.purchasePrice, 0),
    summaryCaption: count => `${count} device${count === 1 ? '' : 's'} purchased`,
    emptyMessage: 'No purchases yet',
    searchPlaceholder: 'Search by model, brand, IMEI, or seller',
  },
  sale: {
    title: 'Sale History',
    accent: colors.greenDark,
    summaryLabel: 'Total Sales',
    summaryValue: devices => devices.reduce((sum, d) => sum + (d.salePrice ?? 0), 0),
    summaryCaption: count => `${count} device${count === 1 ? '' : 's'} sold`,
    emptyMessage: 'No sales yet',
    searchPlaceholder: 'Search by model, brand, IMEI, or buyer',
  },
  profit: {
    title: 'Profit Overview',
    accent: colors.green,
    summaryLabel: 'Total Profit',
    summaryValue: devices => devices.reduce((sum, d) => sum + d.profit, 0),
    summaryCaption: count => `Across ${count} sold device${count === 1 ? '' : 's'}`,
    emptyMessage: 'No profit recorded yet',
    searchPlaceholder: 'Search by model, brand, or IMEI',
  },
};

function timeValue(dateStr?: string): number {
  return parseDMY(dateStr)?.getTime() ?? 0;
}

export function selectTransactionDevices(mode: TransactionMode, devices: Device[]): Device[] {
  if (mode === 'purchase') {
    return [...devices].sort((a, b) => timeValue(b.purchaseDate) - timeValue(a.purchaseDate));
  }
  const sold = devices.filter(d => d.status === 'Sold');
  if (mode === 'sale') {
    return sold.sort((a, b) => timeValue(b.saleDate) - timeValue(a.saleDate));
  }
  return sold.sort((a, b) => b.profit - a.profit);
}

// Purchase rows are dated by when they were bought; Sale/Profit rows only
// exist once sold, so the sale date is the meaningful one for those.
export function transactionDateField(mode: TransactionMode, device: Device): string | undefined {
  return mode === 'purchase' ? device.purchaseDate : device.saleDate;
}

export function matchesTransactionQuery(device: Device, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) {
    return true;
  }
  return (
    device.imei1.includes(q) ||
    device.brand.toLowerCase().includes(q) ||
    device.model.toLowerCase().includes(q) ||
    device.sellerName.toLowerCase().includes(q) ||
    (device.buyerName ?? '').toLowerCase().includes(q)
  );
}
