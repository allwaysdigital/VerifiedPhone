import { colors } from '../theme/colors';
import { formatINR } from './format';
import type { TransactionMode } from './transactions';
import type { Device, Shop } from '../types/domain';

const MODE_META: Record<
  TransactionMode,
  { title: string; totalLabel: string; accent: string; columns: string[] }
> = {
  purchase: {
    title: 'Purchase History',
    totalLabel: 'Total Purchases',
    accent: colors.purple,
    columns: ['Device', 'Purchased', 'Seller', 'Amount'],
  },
  sale: {
    title: 'Sale History',
    totalLabel: 'Total Sales',
    accent: colors.greenDark,
    columns: ['Device', 'Sold', 'Buyer', 'Amount'],
  },
  profit: {
    title: 'Profit Overview',
    totalLabel: 'Total Profit',
    accent: colors.green,
    columns: ['Device', 'Sold', 'Margin', 'Profit'],
  },
};

function rowTotal(mode: TransactionMode, device: Device): number {
  if (mode === 'purchase') {
    return device.purchasePrice;
  }
  if (mode === 'sale') {
    return device.salePrice ?? 0;
  }
  return device.profit;
}

function rowHtml(mode: TransactionMode, device: Device): string {
  const name = `${device.brand} ${device.model}`;
  if (mode === 'purchase') {
    return `
      <tr>
        <td>${name}</td>
        <td>${device.purchaseDate || '—'}</td>
        <td>${device.sellerName || '—'}</td>
        <td class="num">${formatINR(device.purchasePrice)}</td>
      </tr>`;
  }
  if (mode === 'sale') {
    return `
      <tr>
        <td>${name}</td>
        <td>${device.saleDate || '—'}</td>
        <td>${device.buyerName || '—'}</td>
        <td class="num">${formatINR(device.salePrice ?? 0)}</td>
      </tr>`;
  }
  return `
    <tr>
      <td>${name}</td>
      <td>${device.saleDate || '—'}</td>
      <td class="num">${device.profitPercent}%</td>
      <td class="num" style="color:${device.profit >= 0 ? colors.greenDark : colors.danger}">${formatINR(device.profit)}</td>
    </tr>`;
}

export type TransactionReportOptions = {
  mode: TransactionMode;
  devices: Device[];
  shop: Shop | null;
  filterLabel: string;
  generatedAt: string;
};

// Purchase History / Sale History / Profit Overview share this one PDF
// builder — same letterhead-and-table shape as buildStockReportHtml, just
// with transaction rows instead of stock rows.
export function buildTransactionReportHtml({
  mode,
  devices,
  shop,
  filterLabel,
  generatedAt,
}: TransactionReportOptions): string {
  const meta = MODE_META[mode];
  const shopName = shop?.shopName || 'My Shop';
  const total = devices.reduce((sum, d) => sum + rowTotal(mode, d), 0);

  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: -apple-system, Roboto, Helvetica, Arial, sans-serif; color: #303030; padding: 0; margin: 0; }
          .header { background: ${meta.accent}; color: #fff; text-align: center; padding: 26px 16px; }
          .header h1 { margin: 0 0 6px; font-size: 22px; }
          .header p { margin: 2px 0; font-size: 12px; opacity: 0.9; }
          .body { padding: 20px; }
          .meta-row { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 12px; color: #999; }
          h2 { font-size: 15px; margin: 0 0 10px; }
          .stats { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px; }
          .stat { flex: 1; min-width: 140px; background: #f5f7fa; border-radius: 8px; padding: 12px 14px; }
          .stat .label { font-size: 11px; color: #999; margin-bottom: 4px; }
          .stat .value { font-size: 18px; font-weight: 700; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; }
          th { text-align: left; font-size: 11px; color: #999; text-transform: uppercase; padding: 6px 8px; border-bottom: 1px solid #eee; }
          td { padding: 8px; border-bottom: 1px solid #f5f7fa; }
          td.num, th.num { text-align: right; }
          .footer { text-align: right; margin-top: 20px; }
          .footer .label { font-size: 12px; color: #999; }
          .footer .shop { font-size: 15px; font-weight: 700; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${meta.title}</h1>
          <p>${shopName}</p>
        </div>
        <div class="body">
          <div class="meta-row">
            <span>Filter: ${filterLabel}</span>
            <span>Generated: ${generatedAt}</span>
          </div>

          <div class="stats">
            <div class="stat"><div class="label">${meta.totalLabel}</div><div class="value" style="color:${meta.accent}">${formatINR(total)}</div></div>
            <div class="stat"><div class="label">Devices</div><div class="value">${devices.length}</div></div>
          </div>

          <h2>${meta.title}</h2>
          <table>
            <thead>
              <tr>
                ${meta.columns.map((col, i) => `<th${i === meta.columns.length - 1 ? ' class="num"' : ''}>${col}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${devices.map(d => rowHtml(mode, d)).join('') || '<tr><td colspan="4">No devices in this range.</td></tr>'}
            </tbody>
          </table>

          <div class="footer">
            <div class="label">Prepared by</div>
            <div class="shop">${shopName}</div>
          </div>
        </div>
      </body>
    </html>
  `;
}
