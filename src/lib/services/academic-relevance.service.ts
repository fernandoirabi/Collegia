// ============================================================
// COLLEGIA — ACADEMIC RELEVANCE (selection gate)
//
// Decides WHICH colleges belong in a student's recommendation pool
// based on academic/selectivity relevance, BEFORE personal-fit
// ranking. A high Collegia Match score is a FIT measure and never
// overrides academic relevance: a college the student is dramatically
// overqualified or underqualified for leaves the primary tiers.
//
// This module is separate from the frozen Match Engine and from the
// academic-distance realism layer. It consumes academic-distance bands
// plus published selectivity (acceptance rate) and classifies each
// college into an honest relevance pool:
//
//   AMBITIOUS — a genuine reach: the student sits below or at the bar
//               of a highly selective institution, or the academic
//               gap is dramatic.
//   REALISTIC — the student's academics are plausibly competitive:
//               primary Dream/Reach/Target/Likely candidates.
//   SAFETY    — the student's academics are clearly above the college's
//               reported range AND admission is demonstrably
//               non-selective (published rate >= 40%): the student is
//               overqualified. Surfaces as an explicit Safety tier.
//   PATHWAY   — community college / 2-year transfer options.
//
// Also exposes the conceptual academic position and selectivity band
// used by the interpretation layer to explain WHY a college landed in
// a given tier.
//
// Deterministic: same profile + same college => same relevance.
// ============================================================

import type { EngineCollege, EngineProfile } from "@/lib/services/match.engine";
import {
  computeAcademicDistance,
  type AcademicDistance,
  type AcademicPositionBand,
} from "@/lib/services/academic-distance.service";

// ============================================================
// ACADEMIC POSITION (conceptual, data-driven)
//
// A coarse, counselor-style reading of where the student stands
// relative to a college's reported academic profile. Derived from the
// academic-distance module's worst-signal band so tiering and the
// realism gate share one source of truth.
// ============================================================

export type AcademicPosition =
  | "FAR_BELOW"
  | "BELOW"
  | "NEAR"
  | "MATCH"
  | "ABOVE"
  | "WELL_ABOVE";

export const ACADEMIC_POSITION_LABELS: Record<AcademicPosition, string> = {
  FAR_BELOW: "Far below",
  BELOW: "Below",
  NEAR: "Near",
  MATCH: "Match",
  ABOVE: "Above",
  WELL_ABOVE: "Well above",
};

export function academicPositionForBand(band: AcademicPositionBand | null): AcademicPosition | null {
  switch (band) {
    case "VERY_FAR_BELOW":
    case "FAR_BELOW":
      return "FAR_BELOW";
    case "BELOW_RANGE":
      return "BELOW";
    case "NEAR_RANGE":
      return "NEAR";
    case "WITHIN_RANGE":
      return "MATCH";
    case "ABOVE_RANGE":
      return "ABOVE";
    case "WELL_ABOVE_RANGE":
      return "WELL_ABOVE";
    default:
      return null;
  }
}

// ============================================================
// SELECTIVITY BANDS (data-driven from the published acceptance rate)
// ============================================================

export type SelectivityBand =
  | "ULTRA_SELECTIVE"
  | "HIGHLY_SELECTIVE"
  | "SELECTIVE"
  | "MODERATE"
  | "HIGH_ADMISSION"
  | "OPEN_ADMISSION";

export const SELECTIVITY_BAND_LABELS: Record<SelectivityBand, string> = {
  ULTRA_SELECTIVE: "Ultra-selective",
  HIGHLY_SELECTIVE: "Highly selective",
  SELECTIVE: "Selective",
  MODERATE: "Moderate admission",
  HIGH_ADMISSION: "High admission",
  OPEN_ADMISSION: "Open admission",
};

// An elite college admitting 7% or fewer is a Dream for any strong
// student (top-national reach).
export const ULTRA_SELECTIVE_RATE = 7;
// Institutions admitting at or below 25% are ambitious: eligible for
// Dream/Reach, never Likely, even when the student's academics are
// excellent.
export const HIGHLY_SELECTIVE_RATE = 25;
export const SELECTIVE_RATE = 50;
export const MODERATE_RATE = 75;
export const HIGH_ADMISSION_RATE = 85;
// A college admitting above 85% is open admission: an honest Likely
// for weak profiles that sit at or below its bar.
export const OPEN_ADMISSION_RATE = 85;
// A college is a documented SAFETY when the student sits clearly above
// its reported range AND its published admission rate is 40%+ (clearly
// non-selective). Below 40% the outcome stays competitive enough that
// the school is better presented as a Likely than an overqualified
// safety.
export const SAFETY_RATE = 40;

export function selectivityBandFor(acceptanceRate: number | null): SelectivityBand | null {
  if (acceptanceRate == null) return null;
  if (acceptanceRate <= ULTRA_SELECTIVE_RATE) return "ULTRA_SELECTIVE";
  if (acceptanceRate <= HIGHLY_SELECTIVE_RATE) return "HIGHLY_SELECTIVE";
  if (acceptanceRate <= SELECTIVE_RATE) return "SELECTIVE";
  if (acceptanceRate <= MODERATE_RATE) return "MODERATE";
  if (acceptanceRate <= HIGH_ADMISSION_RATE) return "HIGH_ADMISSION";
  return "OPEN_ADMISSION";
}

// ============================================================
// RELEVANCE POOL
// ============================================================

export type RelevancePool = "AMBITIOUS" | "REALISTIC" | "SAFETY" | "PATHWAY";

export interface AcademicRelevance {
  /** Coarse academic position derived from the realism layer. */
  position: AcademicPosition | null;
  /** Selectivity band from the published acceptance rate. */
  selectivityBand: SelectivityBand | null;
  /** True when admission is at or below 25%. */
  isHighlySelective: boolean;
  /** True when admission is at or below 7%. */
  isUltraSelective: boolean;
  /** True when the published admission rate is 40% or higher. */
  isDocumentedSafety: boolean;
  /** True when the college is a community college / 2-year option. */
  isPathway: boolean;
  /** The honest relevance pool this college belongs to. */
  pool: RelevancePool;
  /** Full academic-distance analysis (shared with the realism layer). */
  academic: AcademicDistance;
}

// Community college / 2-year tags. A college carrying one of these is
// a Pathway option, never a 4-year primary tier.
export const PATHWAY_TAGS = ["Community College", "2-Year", "Associate Degree"];

export function isPathwayCollege(college: EngineCollege): boolean {
  return PATHWAY_TAGS.some((tag) => college.tags.includes(tag));
}

// ============================================================
// COMPUTE RELEVANCE  (pure, deterministic)
// ============================================================

export function computeAcademicRelevance(
  profile: EngineProfile,
  college: EngineCollege
): AcademicRelevance {
  const academic = computeAcademicDistance(profile, college);
  const position = academicPositionForBand(academic.combinedBand);
  const rate = college.acceptanceRate ?? null;
  const isHighlySelective = rate != null && rate <= HIGHLY_SELECTIVE_RATE;
  const isUltraSelective = rate != null && rate <= ULTRA_SELECTIVE_RATE;
  const isDocumentedSafety = rate != null && rate >= SAFETY_RATE;

  let pool: RelevancePool;
  if (isPathwayCollege(college)) {
    pool = "PATHWAY";
  } else if (academic.isAcademicMismatch) {
    // Dramatically below the published bar: a genuine reach at best,
    // never a Target/Likely.
    pool = "AMBITIOUS";
  } else {
    switch (position) {
      case "FAR_BELOW":
        pool = "AMBITIOUS";
        break;
      case "BELOW":
      case "NEAR":
      case "MATCH":
        // At or below the bar of a highly selective institution is a
        // genuine reach even when the academics are otherwise close.
        pool = isHighlySelective ? "AMBITIOUS" : "REALISTIC";
        break;
      case "ABOVE":
        if (isHighlySelective) {
          pool = "AMBITIOUS";
        } else if (isDocumentedSafety) {
          pool = "SAFETY";
        } else {
          pool = "REALISTIC";
        }
        break;
      case "WELL_ABOVE":
        if (isHighlySelective) {
          pool = "AMBITIOUS";
        } else if (isDocumentedSafety) {
          pool = "SAFETY";
        } else {
          pool = "REALISTIC";
        }
        break;
      default:
        // Unknown academic position: never block a college we cannot
        // assess.
        pool = "REALISTIC";
    }
  }

  return {
    position,
    selectivityBand: selectivityBandFor(rate),
    isHighlySelective,
    isUltraSelective,
    isDocumentedSafety,
    isPathway: isPathwayCollege(college),
    pool,
    academic,
  };
}