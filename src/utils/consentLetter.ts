import { colors } from '../theme/colors';
import type { Device, Shop } from '../types/domain';
import { deviceName } from './format';

function escapeHtml(value: string | number | null | undefined): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function consentLetterFileName(device: Device): string {
  return `ConsentLetter-${(device.imei1 || device.id).replace(/[^A-Za-z0-9-]/g, '-')}`;
}

// The seller's written consent to the sale of their phone to the shop, for
// the shop's records. Only states a declaration was made if one was recorded.
export function buildConsentLetterHtml(device: Device, shop: Shop | null, generatedAt: string): string {
  const shopName = escapeHtml(shop?.shopName || 'the shop');
  const sellerName = escapeHtml(device.sellerName);
  const price = `₹${device.purchasePrice.toLocaleString('en-IN')}`;

  const row = (label: string, value: string | number | null | undefined) =>
    value === null || value === undefined || value === ''
      ? ''
      : `<tr><td class="k">${label}</td><td>${escapeHtml(value)}</td></tr>`;

  const photo = (label: string, url: string | null | undefined) =>
    url ? `<div class="photo"><img src="${escapeHtml(url)}" /><div>${label}</div></div>` : '';
  const photos = [
    photo('Seller Photo', device.sellerPhotoUrl),
    photo('Aadhaar Front', device.aadhaarFrontUrl),
    photo('Aadhaar Back', device.aadhaarBackUrl),
  ].join('');

  const declaration = device.declarationDate
    ? `<div class="declared">✓ The seller confirmed this declaration in the Verified Phone app on ${escapeHtml(device.declarationDate)}.</div>`
    : '<div class="not-declared">No seller declaration was recorded in the app for this purchase. The seller should sign below.</div>';

  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: -apple-system, Roboto, Helvetica, Arial, sans-serif; color: #1f2937; margin: 0; padding: 32px; font-size: 13px; line-height: 1.5; }
          .header { border-bottom: 3px solid ${colors.primary}; padding-bottom: 12px; margin-bottom: 20px; }
          .header h1 { margin: 0; font-size: 20px; }
          .header .shop { color: #6b7280; font-size: 12px; margin-top: 4px; }
          h2 { font-size: 14px; margin: 20px 0 8px; }
          table { width: 100%; border-collapse: collapse; }
          td { padding: 5px 0; vertical-align: top; }
          td.k { color: #6b7280; width: 38%; }
          .statement { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px; }
          .declared { margin-top: 10px; color: #166534; font-weight: 600; }
          .not-declared { margin-top: 10px; color: #b91c1c; font-weight: 600; }
          .photos { display: flex; gap: 12px; flex-wrap: wrap; }
          .photo { width: 30%; text-align: center; font-size: 11px; color: #6b7280; }
          .photo img { width: 100%; height: 130px; object-fit: cover; border-radius: 6px; display: block; margin-bottom: 4px; }
          .signatures { display: flex; justify-content: space-between; margin-top: 48px; }
          .sign { width: 42%; border-top: 1px solid #9ca3af; padding-top: 6px; font-size: 12px; color: #4b5563; }
          .footer { margin-top: 28px; font-size: 10px; color: #9ca3af; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Seller Consent &amp; Declaration</h1>
          <div class="shop">${shopName}${shop?.address ? ` · ${escapeHtml(shop.address)}` : ''}${shop?.contactNumber ? ` · ${escapeHtml(shop.contactNumber)}` : ''}</div>
        </div>

        <h2>Seller Details</h2>
        <table>
          ${row('Name', device.sellerName)}
          ${row('Mobile', device.sellerMobile)}
          ${row('Alternate Mobile', device.sellerAltMobile)}
          ${row('Address', device.sellerAddress)}
          ${row('City', device.sellerCity)}
          ${row('State', device.sellerState)}
          ${row('Pincode', device.sellerPincode)}
        </table>

        <h2>Device Details</h2>
        <table>
          ${row('Brand & Model', deviceName(device))}
          ${row('IMEI 1', device.imei1)}
          ${row('IMEI 2', device.imei2)}
          ${row('Color', device.color)}
          ${row('Storage', device.storage)}
          ${row('Condition', device.condition)}
          ${row('Purchase Date', device.purchaseDate)}
          ${row('Purchase Price', price)}
        </table>

        <h2>Declaration</h2>
        <div class="statement">
          I, <strong>${sellerName}</strong>, declare that I am the lawful owner of the device described above,
          that it is not stolen, lost, or involved in any illegal activity, and that I am selling it of my own
          free will to <strong>${shopName}</strong> for ${price}. I consent to ${shopName} keeping a copy of my
          identity documents and photo for its records and for verification by the police if required.
          ${declaration}
        </div>

        ${photos ? `<h2>Identity Documents</h2><div class="photos">${photos}</div>` : ''}

        <div class="signatures">
          <div class="sign">Seller signature<br/>${sellerName}</div>
          <div class="sign">For ${shopName}</div>
        </div>

        <div class="footer">Generated by Verified Phone on ${escapeHtml(generatedAt)}</div>
      </body>
    </html>`;
}
