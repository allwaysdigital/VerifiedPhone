import { colors } from '../theme/colors';
import type { Device } from '../types/domain';
import { deviceName } from './format';

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Shop header lines from Settings → Shop Details; empty fields are left out.
export function shopHeaderLines(shop: { address?: string; contactNumber?: string; gstNumber?: string } | null) {
  const lines: string[] = [];
  if (shop?.address?.trim()) {
    lines.push(shop.address.trim());
  }
  if (shop?.contactNumber?.trim()) {
    lines.push(`Contact: ${shop.contactNumber.trim()}`);
  }
  if (shop?.gstNumber?.trim()) {
    lines.push(`GST: ${shop.gstNumber.trim()}`);
  }
  return lines;
}

export const INVOICE_TERMS = [
  'No returns or exchanges after purchase',
  'Warranty is void if tampered or physically damaged',
  'Keep this invoice for warranty claims',
  'IMEI verified at the time of purchase',
];

export function buildInvoiceHtml(params: {
  shopName: string;
  shopLines: string[];
  invoiceNumber: string;
  invoiceDate: string;
  device: Device;
  customerName: string;
  customerMobile: string;
  customerAddress: string;
  salePrice: number;
  warrantyPeriod: string;
}): string {
  const { shopLines, invoiceNumber, invoiceDate, device, salePrice } = params;
  const shopName = escapeHtml(params.shopName);
  const customerName = escapeHtml(params.customerName);
  const customerMobile = escapeHtml(params.customerMobile);
  const customerAddress = escapeHtml(params.customerAddress);
  const warrantyPeriod = escapeHtml(params.warrantyPeriod);
  const formattedPrice = `₹${salePrice.toLocaleString('en-IN')}`;

  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: -apple-system, Roboto, Helvetica, Arial, sans-serif; color: #303030; padding: 0; margin: 0; }
          .header { background: ${colors.primary}; color: #fff; text-align: center; padding: 28px 16px; }
          .header h1 { margin: 0 0 6px; font-size: 24px; }
          .header p { margin: 2px 0; font-size: 13px; opacity: 0.9; }
          .body { padding: 20px; }
          .meta-row { display: flex; justify-content: space-between; margin-bottom: 20px; }
          .meta-row .label { font-size: 12px; color: #999; margin-bottom: 2px; }
          .meta-row .value { font-size: 16px; font-weight: 700; }
          h2 { font-size: 15px; margin: 0 0 8px; }
          .box { background: #f5f7fa; border-radius: 8px; padding: 12px; margin-bottom: 18px; font-size: 14px; }
          .box p { margin: 4px 0; }
          .box .label { color: #999; }
          .price-row { display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 6px; }
          .divider { border-top: 1px solid #eee; margin: 12px 0; }
          .total-row { display: flex; justify-content: space-between; font-size: 18px; font-weight: 700; }
          .total-row .value { color: ${colors.greenDark}; }
          .warranty { background: #dbeafe; border-radius: 8px; padding: 10px 14px; margin-top: 8px; font-size: 14px; font-weight: 600; }
          ul { font-size: 12px; color: #666; padding-left: 18px; }
          .signature { text-align: right; margin-top: 30px; }
          .signature .label { font-size: 12px; color: #999; }
          .signature .shop { font-size: 15px; font-weight: 700; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${shopName}</h1>
          ${shopLines.map(line => `<p>${escapeHtml(line)}</p>`).join('')}
        </div>
        <div class="body">
          <div class="meta-row">
            <div><div class="label">Invoice Number</div><div class="value">${invoiceNumber}</div></div>
            <div style="text-align:right"><div class="label">Date</div><div class="value">${invoiceDate}</div></div>
          </div>

          <h2>Customer Details</h2>
          <div class="box">
            <p><span class="label">Name:</span> ${customerName}</p>
            <p><span class="label">Mobile:</span> ${customerMobile}</p>
            ${customerAddress ? `<p><span class="label">Address:</span> ${customerAddress}</p>` : ''}
          </div>

          <h2>Product Details</h2>
          <div class="box">
            <p><span class="label">Brand & Model:</span> ${escapeHtml(deviceName(device))}</p>
            <p><span class="label">IMEI:</span> ${escapeHtml(device.imei1)}</p>
            <p><span class="label">Storage:</span> ${escapeHtml(device.storage)}</p>
            <p><span class="label">Color:</span> ${escapeHtml(device.color)}</p>
          </div>

          <div class="price-row"><span>Sale Price:</span><span>${formattedPrice}</span></div>
          <div class="divider"></div>
          <div class="total-row"><span>Total Amount:</span><span class="value">${formattedPrice}</span></div>

          ${warrantyPeriod ? `<div class="warranty">Warranty: ${warrantyPeriod}</div>` : ''}

          <div class="divider"></div>
          <h2>Terms & Conditions</h2>
          <ul>
            ${INVOICE_TERMS.map(term => `<li>${term}</li>`).join('')}
          </ul>

          <div class="signature">
            <div class="label">Authorized Signature</div>
            <div class="shop">${shopName}</div>
          </div>
        </div>
      </body>
    </html>
  `;
}
