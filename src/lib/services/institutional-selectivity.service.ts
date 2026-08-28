// ============================================================
// COLLEGIA — INSTITUTIONAL SELECTIVITY (data-driven)
//
// Rates every college on a single academic-selectivity index built
// exclusively from the catalog's PUBLISHED data:
//
//   admission rate     (how competitive the gate is)
//   reported GPA       (average admitted GPA)
//   reported SAT/ACT   (middle-50% low end)
//   graduation rate    (completion quality signal)
//
// The result is one of seven institutional selectivity bands. The
// tier-classification layer (academic-relevance.service.ts) combines
// this band with the student's academic position to assign an honest
// ambition tier. No university is hardcoded: everything is derived
// from the data.
//
// This module is separate from the frozen Match Engine and never
// changes its weights, formulas, or score thresholds.
// ============================================================

import type { EngineCollege } from "@/lib/services/match.engine";

// ============================================================
// BANDS
// ============================================================

export type InstitutionalSelectivityBand =
  | "ULTRA_ELITE"
  | "VERY_HIGH"
  | "HIGH"
  | "SELECTIVE"
  | "MODERATE"
  | "ACCESSIBLE"
  | "OPEN_ADMISSION";

export const INSTITUTIONAL_BAND_LABELS: Record<InstitutionalSelectivityBand, string> = {
  ULTRA_ELITE: "Ultra-elite (top ~10 national)",
  VERY_HIGH: "Very high selectivity (top ~10-25)",
  HIGH: "High selectivity (competitive top 25-50)",
  SELECTIVE: "Selective (top ~50-100)",
  MODERATE: "Moderate selectivity",
  ACCESSIBLE: "Accessible admission",
  OPEN_ADMISSION: "Open / near-open admission",
};

// ============================================================
// INDEX COMPONENTS
//
// Each component maps the college's published figure onto a 0-5.5
// scale. ratePoints dominates (0.5 weight) because admission rate is
// the sharpest published selectivity signal; the academic bar gets
// 0.45; graduation rate is a small quality modifier.
// ============================================================

export function admissionRatePoints(acceptanceRate: number | null): number {
  if (acceptanceRate == null) return 3.0; // unknown gate: treat as mid-selectivity
  if (acceptanceRate < 4) return 5.5;
  if (acceptanceRate < 6) return 5.2;
  if (acceptanceRate < 8) return 4.8;
  if (acceptanceRate < 11) return 4.6;
  if (acceptanceRate < 20) return 4.2;
  if (acceptanceRate < 30) return 3.6;
  if (acceptanceRate < 40) return 3.1;
  if (acceptanceRate < 55) return 2.4;
  if (acceptanceRate < 70) return 2.1;
  if (acceptanceRate < 85) return 1.6;
  return 1.1;
}

export function gpaBarPoints(avgGpa: number | null): number {
  if (avgGpa == null) return 2.5;
  if (avgGpa >= 4.0) return 5.0;
  if (avgGpa >= 3.9) return 4.5;
  if (avgGpa >= 3.7) return 4.0;
  if (avgGpa >= 3.5) return 3.5;
  if (avgGpa >= 3.3) return 3.0;
  if (avgGpa >= 3.0) return 2.5;
  if (avgGpa >= 2.7) return 1.5;
  if (avgGpa >= 2.4) return 1.0;
  return 0.5;
}

export function testBarPoints(satRangeMin: number | null, actRangeMin: number | null): number {
  // SAT is the canonical signal; ACT is converted to SAT scale (x20).
  const s = satRangeMin ?? (actRangeMin != null ? actRangeMin * 20 : null);
  if (s == null) return 2.5;
  if (s >= 1510) return 5.0;
  if (s >= 1470) return 4.5;
  if (s >= 1410) return 4.0;
  if (s >= 1350) return 3.5;
  if (s >= 1280) return 3.0;
  if (s >= 1180) return 2.5;
  if (s >= 1080) return 2.0;
  if (s >= 960) return 1.5;
  if (s >= 880) return 1.0;
  return 0.5;
}

export function graduationRatePoints(graduationRate: number | null): number {
  if (graduationRate == null) return 0;
  if (graduationRate >= 90) return 0.4;
  if (graduationRate >= 75) return 0.2;
  if (graduationRate >= 55) return 0;
  return -0.2;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

// ============================================================
// INDEX + BAND
// ============================================================

/**
 * Single selectivity index in roughly [0.5, 5.5]. Higher = more
 * selective / elite. Fully data-driven; deterministic per college.
 */
export function institutionalSelectivityIndex(college: EngineCollege): number {
  const rate = admissionRatePoints(college.acceptanceRate ?? null);
  const bar = (gpaBarPoints(college.avgGpa) + testBarPoints(college.satRangeMin, college.actRangeMin)) / 2;
  const grad = graduationRatePoints(college.graduationRate ?? null);
  return round1(rate * 0.5 + bar * 0.45 + grad);
}

export const SELECTIVITY_BAND_THRESHOLDS: { band: InstitutionalSelectivityBand; min: number }[] = [
  { band: "VERY_HIGH", min: 4.4 },
  { band: "HIGH", min: 4.0 },
  { band: "SELECTIVE", min: 3.0 },
  { band: "MODERATE", min: 2.3 },
  { band: "ACCESSIBLE", min: 1.5 },
];

/**
 * The ultra-elite band is the only selectivity classification that
 * combines two data signals: an elite selectivity index (>= 4.8) AND a
 * published admission rate of 6.5% or lower. This reliably separates the
 * genuinely ultra-elite group (HYPSM + the other Ivies + Caltech/UChicago/
 * Duke-class schools) from very-high schools like Northwestern, Vanderbilt,
 * JHU or Swarthmore (index ~4.8-4.9 but 7%+ admission), so the Dream tier
 * is not flooded with schools that are elite-but-not-unpredictable.
 */
export const ULTRA_ELITE_INDEX_MIN = 4.8;
export const ULTRA_ELITE_RATE_MAX = 6.5;

export function institutionalSelectivityBand(college: EngineCollege): InstitutionalSelectivityBand {
  const index = institutionalSelectivityIndex(college);
  const rate = college.acceptanceRate;
  if (
    rate != null &&
    rate <= ULTRA_ELITE_RATE_MAX &&
    index >= ULTRA_ELITE_INDEX_MIN
  ) {
    return "ULTRA_ELITE";
  }
  for (const { band, min } of SELECTIVITY_BAND_THRESHOLDS) {
    if (index >= min) return band;
  }
  return "OPEN_ADMISSION";
}