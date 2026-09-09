// ============================================================
// COLLEGIA — Display Formatting Helpers
//
// Central helpers for presenting possibly-missing data honestly.
// When a value is null (i.e. the school hasn't reported it), we
// show a neutral "Not reported" placeholder instead of a misleading
// 0. These keep number formatting consistent across cards and the
// college detail page.
// ============================================================

export const NOT_REPORTED = "Not reported";

/** Percent value (0–100), e.g. acceptance rate or international %. */
export function formatPercent(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return NOT_REPORTED;
  return `${value}%`;
}

/** A single GPA figure. */
export function formatGpa(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return NOT_REPORTED;
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

/** A percentile range, e.g. SAT "1330–1490". Returns a single segment or
 *  the combined range. If either bound is missing, we still show the known
 *  bound rather than fabricating a full range. */
export function formatRange(lo: number | null | undefined, hi: number | null | undefined): string {
  const known: number[] = [];
  if (lo != null && !Number.isNaN(lo)) known.push(lo);
  if (hi != null && !Number.isNaN(hi)) known.push(hi);
  if (known.length === 0) return NOT_REPORTED;
  if (known.length === 1) return String(known[0]);
  return `${known.join("–")}`;
}

/** A cost figure in dollars, e.g. "$$28,700". */
export function formatCost(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return NOT_REPORTED;
  return `$${Math.round(value).toLocaleString("en-US")}`;
}

/** A compact annual tuition like "$$29K". */
export function formatCostK(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return NOT_REPORTED;
  return `$${Math.round(value / 1000)}K`;
}

/** An integer count, e.g. countries represented or clubs. */
export function formatCount(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return NOT_REPORTED;
  return String(value);
}