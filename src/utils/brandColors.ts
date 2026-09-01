// Recognizable colors for the brands most shops actually stock — matches
// each brand's own real-world identity color so a dealer can tell brands
// apart at a glance without reading the label.
const KNOWN_BRAND_COLORS: Record<string, string> = {
  apple: '#1d1d1f',
  samsung: '#1428a0',
  oneplus: '#eb0028',
  xiaomi: '#e85d04',
  vivo: '#415fff',
  oppo: '#159873',
  google: '#4285f4',
  others: '#6b7280',
};

// Fallback palette for any custom brand a shop adds that isn't in the list
// above — picked to stay visually distinct from both the known brand
// colors and the app's own orange accent.
const FALLBACK_PALETTE = ['#6366f1', '#ec4899', '#14b8a6', '#8b5cf6', '#0ea5e9', '#65a30d'];

/**
 * Returns a stable color for a brand name. Known real-world brands get
 * their own recognizable color; anything else gets one from a small
 * fallback palette, assigned by that brand's position among the *other*
 * unrecognized brands in `catalogBrandNames` — so a given custom brand
 * always gets the same color across renders, rather than shifting based
 * on which brands currently have stock.
 */
export function getBrandColor(brandName: string, catalogBrandNames: string[]): string {
  const key = brandName.trim().toLowerCase();
  const known = KNOWN_BRAND_COLORS[key];
  if (known) {
    return known;
  }

  const unknownBrands = catalogBrandNames.filter(name => !KNOWN_BRAND_COLORS[name.trim().toLowerCase()]);
  const index = unknownBrands.findIndex(name => name.trim().toLowerCase() === key);
  return FALLBACK_PALETTE[index >= 0 ? index % FALLBACK_PALETTE.length : 0];
}
