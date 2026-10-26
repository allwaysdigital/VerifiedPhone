import { colors } from '../theme/colors';
import type { Device, Shop } from '../types/domain';

const VERIFICATION_DOCUMENTS = [
  { label: 'Aadhaar Card (Front & Back)', status: 'Verified' },
  { label: 'Seller Live Photo', status: 'Captured' },
  { label: 'Digital Signature', status: 'Signed' },
  { label: 'Device Images', status: 'Uploaded' },
];

export type PoliceExportRecordOptions = {
  device: Device;
  shop: Shop | null;
  recordGenerated: string;
};

// Mirrors PoliceExportRecordScreen's on-screen layout section for section,
// so the PDF a dealer shares with police matches exactly what they saw
// before tapping Download.
export function buildPoliceExportRecordHtml({
  device,
  shop,
  recordGenerated,
}: PoliceExportRecordOptions): string {
  const shopName = shop?.shopName || 'My Shop';

  const optionalRow = (label: string, value: string | null | undefined) =>
    value ? `<div class="info-row"><span class="info-label">${label}</span><span class="info-value">${value}</span></div>` : '';

  const photoCard = (label: string, url: string | null | undefined) => `
    <div class="photo-card">
      ${url ? `<img src="${url}" />` : '<div class="photo-missing">Not available</div>'}
      <div class="photo-label">${label}</div>
    </div>`;

  const sellerPhotos = [
    photoCard('Device Front', device.phoneFrontImageUrl),
    photoCard('Device Back', device.phoneBackImageUrl),
    photoCard('Seller Photo', device.sellerPhotoUrl),
    photoCard('Aadhaar Front', device.aadhaarFrontUrl),
    photoCard('Aadhaar Back', device.aadhaarBackUrl),
    photoCard('Old Phone Bill', device.oldPhoneBillUrl),
  ].join('');

  // Only present once the device has actually been sold — no buyer yet
  // otherwise, so there's nothing real to show.
  const buyerPhotos = device.buyerName
    ? [
        photoCard('Buyer Photo', device.buyerPhotoUrl),
        photoCard('Buyer Aadhaar Front', device.buyerAadhaarFrontUrl),
        photoCard('Buyer Aadhaar Back', device.buyerAadhaarBackUrl),
      ].join('')
    : '';

  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: -apple-system, Roboto, Helvetica, Arial, sans-serif; color: #303030; padding: 0; margin: 0; }
          .header { background: ${colors.danger}; color: #fff; text-align: center; padding: 26px 16px; }
          .header h1 { margin: 0 0 6px; font-size: 22px; }
          .header p { margin: 2px 0; font-size: 12px; opacity: 0.9; }
          .body { padding: 20px; }
          .warning { background: rgba(236,77,81,0.08); border: 1px solid rgba(236,77,81,0.3); border-radius: 8px; padding: 12px 14px; font-size: 12px; color: ${colors.danger}; margin-bottom: 20px; }
          h2 { font-size: 15px; margin: 18px 0 8px; }
          .info-box { background: #f5f7fa; border-radius: 8px; padding: 10px 14px; }
          .info-row { display: flex; justify-content: space-between; font-size: 13px; padding: 4px 0; }
          .info-label { color: #898989; }
          .info-value { font-weight: 600; text-align: right; }
          .doc-row { display: flex; justify-content: space-between; align-items: center; background: #dbeafe; border-radius: 8px; padding: 10px 14px; margin-bottom: 8px; font-size: 13px; }
          .doc-status { color: ${colors.blue}; font-weight: 600; }
          .photo-grid { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 8px; }
          .photo-card { width: 47%; background: #f5f7fa; border-radius: 8px; padding: 8px; box-sizing: border-box; }
          .photo-card img { width: 100%; height: 150px; object-fit: cover; border-radius: 6px; display: block; }
          .photo-card .photo-label { font-size: 11px; color: #666; margin-top: 6px; text-align: center; }
          .photo-missing { width: 100%; height: 150px; border-radius: 6px; background: #e5e7eb; color: #999; font-size: 11px; display: flex; align-items: center; justify-content: center; }
          .declaration { background: rgba(52,199,89,0.12); border-radius: 8px; padding: 12px 14px; }
          .declaration p { color: ${colors.greenDark}; font-size: 13px; margin: 0 0 6px; }
          .declaration .date { color: #898989; font-size: 11px; }
          .timestamp-box { background: #f5f7fa; border-radius: 8px; padding: 10px 14px; font-size: 12px; color: #666; }
          .footer { text-align: center; margin-top: 20px; font-size: 11px; color: #999; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Police Export Record</h1>
          <p>${shopName} — Confidential Document</p>
        </div>
        <div class="body">
          <div class="warning">
            ⚠ This document contains sensitive information. Handle with care and share only with
            authorized personnel.
          </div>

          <h2>Device Information</h2>
          <div class="info-box">
            <div class="info-row"><span class="info-label">Brand &amp; Model :</span><span class="info-value">${device.brand} ${device.model}</span></div>
            <div class="info-row"><span class="info-label">IMEI 1 :</span><span class="info-value">${device.imei1 || '—'}</span></div>
            <div class="info-row"><span class="info-label">Color :</span><span class="info-value">${device.color || '—'}</span></div>
            <div class="info-row"><span class="info-label">Storage :</span><span class="info-value">${device.storage || '—'}</span></div>
            <div class="info-row"><span class="info-label">Purchase Date :</span><span class="info-value">${device.purchaseDate || '—'}</span></div>
            <div class="info-row"><span class="info-label">IMEI Status :</span><span class="info-value" style="color:${device.verification === 'Verified' ? colors.green : colors.danger}">${device.verification}</span></div>
          </div>

          <h2>Seller Information</h2>
          <div class="info-box">
            <div class="info-row"><span class="info-label">Full Name :</span><span class="info-value">${device.sellerName}</span></div>
            <div class="info-row"><span class="info-label">Mobile :</span><span class="info-value">${device.sellerMobile}</span></div>
            ${optionalRow('Alt. Mobile :', device.sellerAltMobile)}
            ${optionalRow('Address :', device.sellerAddress)}
            <div class="info-row"><span class="info-label">City :</span><span class="info-value">${device.sellerCity}</span></div>
            ${optionalRow('State :', device.sellerState)}
            ${optionalRow('Pincode :', device.sellerPincode)}
          </div>

          <h2>Verification Documents</h2>
          ${VERIFICATION_DOCUMENTS.map(
            doc => `<div class="doc-row"><span>✓ ${doc.label}</span><span class="doc-status">${doc.status}</span></div>`,
          ).join('')}

          <h2>Seller &amp; Device Photos</h2>
          <div class="photo-grid">${sellerPhotos}</div>

          ${buyerPhotos ? `<h2>Buyer Photos</h2><div class="photo-grid">${buyerPhotos}</div>` : ''}

          <h2>Legal Declaration</h2>
          <div class="declaration">
            <p>✓ Seller has declared that this device is legally owned and not stolen, lost, or involved in any illegal activity.</p>
            <div class="date">Declaration Date: ${device.declarationDate ?? device.purchaseDate}</div>
          </div>

          <h2>Record Timestamp</h2>
          <div class="timestamp-box">
            <div>Record Generated: ${recordGenerated}</div>
            <div>Purchase Timestamp: ${device.purchaseDate}${device.purchaseTime ? `, ${device.purchaseTime}` : ''}</div>
          </div>

          <div class="footer">
            This document is generated automatically and contains all verification details for legal compliance.
          </div>
        </div>
      </body>
    </html>
  `;
}
