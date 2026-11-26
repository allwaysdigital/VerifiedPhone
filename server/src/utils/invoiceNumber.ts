import { Shop } from '../models/Shop';
import { financialYear, formatInvoiceNumber, invoicePrefix } from './invoiceFormat';

// Sequential per shop and financial year, e.g. MC/2026-27/0001. The counter
// is incremented atomically so two sales saved together can't share a number.
export async function nextInvoiceNumber(
  shopId: unknown,
  shopName: string | null | undefined,
  saleDate: Date,
): Promise<string> {
  const fy = financialYear(saleDate);
  const shop = await Shop.findOneAndUpdate(
    { _id: shopId },
    { $inc: { [`invoiceCounters.${fy}`]: 1 } },
    { new: true },
  ).lean();
  const counters = (shop?.invoiceCounters ?? {}) as Record<string, number>;
  return formatInvoiceNumber(invoicePrefix(shopName), fy, counters[fy] ?? 1);
}
