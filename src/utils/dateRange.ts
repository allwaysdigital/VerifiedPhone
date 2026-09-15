import { parseDMY } from './date';

export type DatePreset = 'All Time' | 'Today' | 'This Week' | 'This Month' | 'This Year' | 'Custom';

export const DATE_PRESETS: DatePreset[] = [
  'All Time',
  'Today',
  'This Week',
  'This Month',
  'This Year',
  'Custom',
];

// A custom range is carried as ISO strings (not Date objects) so it can
// safely pass through React Navigation params.
export type CustomRange = { startIso: string | null; endIso: string | null };

export function getDateRange(
  preset: DatePreset,
  custom?: CustomRange,
  now: Date = new Date(),
): { start: Date | null; end: Date | null } {
  if (preset === 'Custom') {
    return {
      start: custom?.startIso ? new Date(custom.startIso) : null,
      end: custom?.endIso ? new Date(custom.endIso) : null,
    };
  }

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000 - 1);

  switch (preset) {
    case 'Today':
      return { start: startOfToday, end: endOfToday };
    case 'This Week': {
      // Monday-start week, matching how the rest of the app's date math
      // already treats week boundaries.
      const daysSinceMonday = (now.getDay() + 6) % 7;
      const start = new Date(startOfToday);
      start.setDate(start.getDate() - daysSinceMonday);
      return { start, end: endOfToday };
    }
    case 'This Month':
      return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: endOfToday };
    case 'This Year':
      return { start: new Date(now.getFullYear(), 0, 1), end: endOfToday };
    case 'All Time':
    default:
      return { start: null, end: null };
  }
}

// Generic "D/M/YYYY" date-in-range check — callers pick which date field
// is meaningful for them (Stock Report uses purchaseDate; Sale/Profit
// History use saleDate).
export function isDateInRange(
  dateStr: string | undefined,
  preset: DatePreset,
  custom?: CustomRange,
): boolean {
  if (preset === 'All Time') {
    return true;
  }
  const { start, end } = getDateRange(preset, custom);
  if (!start || !end) {
    // Custom with an incomplete range (not yet applied) — don't filter
    // anything out until the dealer actually picks both dates.
    return true;
  }
  const parsed = parseDMY(dateStr);
  if (!parsed) {
    return false;
  }
  return parsed >= start && parsed <= end;
}

export function formatDateForDisplay(date: Date): string {
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
