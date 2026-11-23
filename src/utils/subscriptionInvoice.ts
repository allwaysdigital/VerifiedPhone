import { colors } from '../theme/colors';
import { formatINR } from './format';
import { PLANS, type Shop } from '../types/domain';
import type { Invoice } from '../api/subscription';

// The business that receives subscription payments (as shown on the UPI
// AutoPay mandate). Add a GSTIN here once available to print it.
const SELLER = {
  name: 'The Allways Digital Private Limited',
  address: 'Ahmedabad, Gujarat, India',
  gstin: '',
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatInvoiceDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function subscriptionInvoiceFileName(invoice: Invoice): string {
  return `VerifiedPhone-Invoice-${invoice.id}`;
}

export function buildSubscriptionInvoiceHtml(invoice: Invoice, shop: Shop | null): string {
  const plan = PLANS[invoice.planId];
  const planLabel = plan ? `${plan.tierName} subscription` : 'Subscription';
  const period = plan ? `1 ${plan.period}` : '—';
  const billedTo = [
    shop?.shopName ? `<strong>${escapeHtml(shop.shopName)}</strong>` : '',
    shop?.address ? escapeHtml(shop.address) : '',
    shop?.gstNumber ? `GSTIN: ${escapeHtml(shop.gstNumber)}` : '',
    shop?.contactNumber ? `Phone: ${escapeHtml(shop.contactNumber)}` : '',
  ]
    .filter(Boolean)
    .join('<br/>');

  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          * { box-sizing: border-box; }
          body { font-family: -apple-system, Roboto, Helvetica, Arial, sans-serif; color: #0f172a; margin: 0; padding: 32px; font-size: 13px; }
          .top { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid ${colors.primary}; padding-bottom: 16px; }
          .brand { font-size: 20px; font-weight: 800; color: ${colors.primary}; letter-spacing: 0.5px; }
          .brand-sub { font-size: 11px; color: #64748b; letter-spacing: 2px; margin-top: 2px; }
          .title { text-align: right; }
          .title h1 { margin: 0; font-size: 24px; letter-spacing: 1px; }
          .paid { display: inline-block; margin-top: 6px; padding: 3px 10px; border-radius: 999px; background: #dcfce7; color: #166534; font-weight: 700; font-size: 11px; }
          .parties { display: flex; gap: 24px; margin-top: 24px; }
          .party { flex: 1; }
          .label { font-size: 10px; font-weight: 700; color: #64748b; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 6px; }
          .meta { margin-top: 24px; width: 100%; border-collapse: collapse; }
          .meta td { padding: 4px 0; }
          .meta td.k { color: #64748b; width: 40%; }
          table.items { margin-top: 24px; width: 100%; border-collapse: collapse; }
          table.items th { background: #f1f5f9; text-align: left; padding: 10px; font-size: 11px; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; }
          table.items td { padding: 12px 10px; border-bottom: 1px solid #e2e8f0; }
          .num { text-align: right; }
          .total td { font-weight: 800; font-size: 15px; border-bottom: none; }
          .note { margin-top: 28px; color: #64748b; font-size: 11px; line-height: 1.5; }
        </style>
      </head>
      <body>
        <div class="top">
          <div>
            <div class="brand">VERIFIED PHONE</div>
            <div class="brand-sub">DEALER SATHI</div>
          </div>
          <div class="title">
            <h1>INVOICE</h1>
            <div class="paid">PAID</div>
          </div>
        </div>

        <div class="parties">
          <div class="party">
            <div class="label">From</div>
            <strong>${escapeHtml(SELLER.name)}</strong><br/>
            ${escapeHtml(SELLER.address)}
            ${SELLER.gstin ? `<br/>GSTIN: ${escapeHtml(SELLER.gstin)}` : ''}
          </div>
          <div class="party">
            <div class="label">Billed to</div>
            ${billedTo || '—'}
          </div>
        </div>

        <table class="meta">
          <tr><td class="k">Invoice number</td><td>${escapeHtml(invoice.id)}</td></tr>
          <tr><td class="k">Invoice date</td><td>${formatInvoiceDate(invoice.paidAt)}</td></tr>
          <tr><td class="k">Payment method</td><td>${escapeHtml(invoice.method || 'AutoPay')}</td></tr>
          ${invoice.subscriptionId ? `<tr><td class="k">Subscription ID</td><td>${escapeHtml(invoice.subscriptionId)}</td></tr>` : ''}
        </table>

        <table class="items">
          <tr><th>Description</th><th>Period</th><th class="num">Amount</th></tr>
          <tr>
            <td>${escapeHtml(planLabel)}</td>
            <td>${period}</td>
            <td class="num">${formatINR(invoice.amount)}</td>
          </tr>
          <tr class="total">
            <td colspan="2">Total paid</td>
            <td class="num">${formatINR(invoice.amount)}</td>
          </tr>
        </table>

        <div class="note">
          Amount is inclusive of applicable taxes. Payment received via Razorpay
          (payment ID ${escapeHtml(invoice.id)}). This is a computer-generated invoice and does not
          require a signature.
        </div>
      </body>
    </html>`;
}
