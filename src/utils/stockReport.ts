import { colors } from '../theme/colors';
import { formatINR } from './format';
import type { Device, Shop } from '../types/domain';

export type BrandRow = { brand: string; units: number; purchaseValue: number };

export type ModelRow = {
  model: string;
  units: number;
  availableCount: number;
  soldCount: number;
  purchaseValue: number;
  storageOptions: string[];
  ramOptions: string[];
  conditions: string[];
};

export type StockReportStats = {
  totalDevices: number;
  availableCount: number;
  soldCount: number;
  totalPurchaseValue: number;
  totalSaleValue: number;
  netProfit: number;
  brandRows: BrandRow[];
};

// Model-level breakdown for a brand-scoped report — used in place of the
// brand table once the dealer has already drilled into a single brand,
// since "Apple: 5 units" is redundant when every row IS Apple.
export function computeModelRows(devices: Device[]): ModelRow[] {
  const byModel = new Map<
    string,
    {
      units: number;
      availableCount: number;
      soldCount: number;
      purchaseValue: number;
      storageOptions: Set<string>;
      ramOptions: Set<string>;
      conditions: Set<string>;
    }
  >();
  devices.forEach(device => {
    const entry = byModel.get(device.model) ?? {
      units: 0,
      availableCount: 0,
      soldCount: 0,
      purchaseValue: 0,
      storageOptions: new Set<string>(),
      ramOptions: new Set<string>(),
      conditions: new Set<string>(),
    };
    entry.units += 1;
    entry.purchaseValue += device.purchasePrice;
    if (device.status === 'Available') {
      entry.availableCount += 1;
    } else {
      entry.soldCount += 1;
    }
    if (device.storage) {
      entry.storageOptions.add(device.storage);
    }
    if (device.ram) {
      entry.ramOptions.add(device.ram);
    }
    if (device.condition) {
      entry.conditions.add(device.condition);
    }
    byModel.set(device.model, entry);
  });

  return Array.from(byModel.entries())
    .map(([model, entry]) => ({
      model,
      units: entry.units,
      availableCount: entry.availableCount,
      soldCount: entry.soldCount,
      purchaseValue: entry.purchaseValue,
      storageOptions: Array.from(entry.storageOptions),
      ramOptions: Array.from(entry.ramOptions),
      conditions: Array.from(entry.conditions),
    }))
    .sort((a, b) => b.units - a.units);
}

// The numbers behind the report — shared by the in-app preview
// (StockReportPreviewScreen) and the PDF (buildStockReportHtml) so both
// always show the exact same figures.
export function computeStockReportStats(devices: Device[]): StockReportStats {
  const byBrand = new Map<string, { units: number; purchaseValue: number }>();
  devices.forEach(device => {
    const entry = byBrand.get(device.brand) ?? { units: 0, purchaseValue: 0 };
    entry.units += 1;
    entry.purchaseValue += device.purchasePrice;
    byBrand.set(device.brand, entry);
  });
  const brandRows = Array.from(byBrand.entries())
    .map(([brand, { units, purchaseValue }]) => ({ brand, units, purchaseValue }))
    .sort((a, b) => b.units - a.units);

  return {
    totalDevices: devices.length,
    availableCount: devices.filter(d => d.status === 'Available').length,
    soldCount: devices.filter(d => d.status === 'Sold').length,
    totalPurchaseValue: devices.reduce((sum, d) => sum + d.purchasePrice, 0),
    totalSaleValue: devices
      .filter(d => d.status === 'Sold')
      .reduce((sum, d) => sum + (d.salePrice ?? 0), 0),
    // Profit only exists once a device actually sells — before that,
    // device.profit is just purchasePrice vs. the *expected* sale price
    // entered at intake, not a real number. Counting it here would let
    // unsold stock inflate a figure that's supposed to be realized profit.
    netProfit: devices
      .filter(d => d.status === 'Sold')
      .reduce((sum, d) => sum + d.profit, 0),
    brandRows,
  };
}

export type StockReportOptions = {
  devices: Device[];
  filterLabel: string;
  shop: Shop | null;
  generatedAt: string;
  brand?: string;
};

// A one-page "check the store" summary PDF: totals for whatever devices
// are passed in (StockScreen passes its currently filtered/searched list,
// so the report reflects whatever the dealer is looking at — e.g. only
// "Available" devices, or only devices matching a search).
export function buildStockReportHtml({
  devices,
  filterLabel,
  shop,
  generatedAt,
  brand,
}: StockReportOptions): string {
  const stats = computeStockReportStats(devices);
  const modelRows = brand ? computeModelRows(devices) : [];

  const shopName = shop?.shopName || 'My Shop';
  const shopAddress = shop?.address || '';
  const shopContact = shop?.contactNumber || shop?.phoneNumber || '';
  // When the report is scoped to one brand, lead the letterhead with that
  // brand (what the dealer actually drilled into) and drop it to a subtitle.
  const headerTitle = brand || shopName;
  const headerSubtitle = brand ? shopName : shopAddress;

  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: -apple-system, Roboto, Helvetica, Arial, sans-serif; color: #303030; padding: 0; margin: 0; }
          .header { background: ${colors.primary}; color: #fff; text-align: center; padding: 26px 16px; }
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
          .divider { border-top: 1px solid #eee; margin: 20px 0; }
          .footer { text-align: right; margin-top: 20px; }
          .footer .label { font-size: 12px; color: #999; }
          .footer .shop { font-size: 15px; font-weight: 700; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${headerTitle}</h1>
          ${headerSubtitle ? `<p>${headerSubtitle}</p>` : ''}
          ${!brand && shopContact ? `<p>Contact: ${shopContact}</p>` : ''}
        </div>
        <div class="body">
          <div class="meta-row">
            <span>Filter: ${filterLabel}</span>
            <span>Generated: ${generatedAt}</span>
          </div>

          <h2>Summary</h2>
          <!-- Stock report: devices that have already sold are excluded
               above, so Available/Sold and Sale Value/Net Profit would
               always read as "all" and "zero" here. Sale History and
               Profit Overview cover that ground instead. -->
          <div class="stats">
            <div class="stat"><div class="label">Devices In Stock</div><div class="value" style="color:${colors.green}">${stats.totalDevices}</div></div>
            <div class="stat"><div class="label">Purchase Value</div><div class="value">${formatINR(stats.totalPurchaseValue)}</div></div>
          </div>

          <div class="divider"></div>

          <h2>${brand ? 'Model-wise Breakdown' : 'Brand-wise Breakdown'}</h2>
          <table>
            <thead>
              <tr>
                <th>${brand ? 'Model' : 'Brand'}</th>
                ${brand ? '<th>Specs</th>' : ''}
                <th class="num">Units</th>
                <th class="num">Purchase Value</th>
              </tr>
            </thead>
            <tbody>
              ${
                brand
                  ? modelRows
                      .map(
                        row => `
                <tr>
                  <td>${row.model}</td>
                  <td>${[...row.storageOptions, ...row.ramOptions, ...row.conditions].join(', ')}</td>
                  <td class="num">${row.units}</td>
                  <td class="num">${formatINR(row.purchaseValue)}</td>
                </tr>
              `,
                      )
                      .join('')
                  : stats.brandRows
                      .map(
                        row => `
                <tr>
                  <td>${row.brand}</td>
                  <td class="num">${row.units}</td>
                  <td class="num">${formatINR(row.purchaseValue)}</td>
                </tr>
              `,
                      )
                      .join('')
              }
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
