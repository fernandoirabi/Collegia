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
// plus institutional selectivity (multi-factor index) and classifies
// each college into an honest relevance pool:
//
//   AMBITIOUS — a genuine reach: the student sits below or at the bar
//               of a highly selective institution, or the academic
//               gap is dramatic.
//   REALISTIC — the student's academics are plausibly competitive:
//               primary Dream/Reach/Target/Likely candidates.
//   SAFETY    — the student's academics are clearly above the college's
//               reported range AND the institution is demonstrably
//               non-selective: the student is overqualified. Surfaces
//               as an explicit Safety tier.
//   PATHWAY   — community college / 2-year transfer options.
//
// Also exposes the conceptual academic position and institutional
// selectivity band used by the interpretation layer to explain WHY a
// college landed in a given tier.
//
// Deterministic: same profile + same college => same relevance.
// ============================================================

import type { EngineCollege, EngineProfile } from "@/lib/services/match.engine";
import {
  computeAcademicDistance,
  type AcademicDistance,
  type AcademicPositionBand,
} from "@/lib/services/academic-distance.service";
import {
  institutionalSelectivityIndex,
  institutionalSelectivityBand,
  INSTITUTIONAL_BAND_LABELS,
  type InstitutionalSelectivityBand,
} from "@/lib/services/institutional-selectivity.service";

// Re-export for consumers
export { institutionalSelectivityBand };

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
// INSTITUTIONAL SELECTIVITY BANDS (multi-factor, data-driven)
// ============================================================

export { INSTITUTIONAL_BAND_LABELS };
export type { InstitutionalSelectivityBand };

// Community college / 2-year tags. A college carrying one of these is
// a Pathway option, never a 4-year primary tier.
export const PATHWAY_TAGS = ["Community College", "2-Year", "Associate Degree"];

export function isPathwayCollege(college: EngineCollege): boolean {
  return PATHWAY_TAGS.some((tag) => college.tags.includes(tag));
}

// ============================================================
// RELEVANCE POOL
// ============================================================

export type RelevancePool = "AMBITIOUS" | "REALISTIC" | "SAFETY" | "PATHWAY";

export interface AcademicRelevance {
  /** Coarse academic position derived from the realism layer. */
  position: AcademicPosition | null;
  /** Institutional selectivity band derived from published data. */
  institutionalBand: InstitutionalSelectivityBand | null;
  institutionalBandLabel: string;
  /** The data-driven selectivity index (diagnostics/UI). */
  institutionalIndex: number;
  /** True when the college is a community college / 2-year option. */
  isPathway: boolean;
  /** The honest ambition tier this college belongs to. */
  tier: AmbitionTier | null;
  /** The honest relevance pool this college belongs to. */
  pool: RelevancePool;
  /** Full academic-distance analysis (shared with the realism layer). */
  academic: AcademicDistance;
}

// ============================================================
// TIER CLASSIFICATION MATRIX (pure, deterministic)
//
// institution band (rows) × academic position (columns) => tier.
// The tiers are the six the College List Builder exposes. The matrix
// is fully data-driven on both axes: nothing here is hardcoded per
// university, and preferences play no part in it.
// ============================================================

export type AmbitionTier = "dream" | "reach" | "target" | "likely" | "safety" | "pathway";

export const TIER_MATRIX: Record<
  InstitutionalSelectivityBand,
  Record<AcademicPosition, AmbitionTier>
> = {
  // Ultra-elite institutions are Dream for essentially every applicant:
  // admission is extraordinarily selective and a strong academic profile
  // alone never makes them Target/Likely.
  ULTRA_ELITE: {
    FAR_BELOW: "dream",
    BELOW: "dream",
    NEAR: "dream",
    MATCH: "dream",
    ABOVE: "dream",
    WELL_ABOVE: "dream",
  },
  // Very-high selectivity (roughly T10-20) is Reach even for a strong
  // applicant. Being academically well-qualified does not demote these to
  // Target — outcomes depend on the full applicant pool.
  VERY_HIGH: {
    FAR_BELOW: "dream",
    BELOW: "dream",
    NEAR: "reach",
    MATCH: "reach",
    ABOVE: "reach",
    WELL_ABOVE: "reach",
  },
  // High selectivity (the competitive top 25-50 flagships: Michigan,
  // Georgia Tech, USC, UVA, Notre Dame, Emory, NYU, UCLA, Berkeley,
  // etc.) is Target when the student is at or modestly above the
  // reported bar, Reach when below it. Even a student clearly ABOVE
  // the bar stays Reach — these institutions are too selective to be
  // Likely.
  HIGH: {
    FAR_BELOW: "dream",
    BELOW: "reach",
    NEAR: "reach",
    MATCH: "target",
    ABOVE: "target",
    WELL_ABOVE: "reach",
  },
  // Selective selectivity (roughly T50-100: Florida, Miami, Boston
  // University, UNC, UT Austin, Wisconsin, Maryland, Georgia, SDSU) is
  // Target when the student sits at/near its bar and Likely when the
  // student is clearly above it. Being over-qualified never moves a
  // school into a harder tier.
  SELECTIVE: {
    FAR_BELOW: "reach",
    BELOW: "reach",
    NEAR: "target",
    MATCH: "target",
    ABOVE: "likely",
    WELL_ABOVE: "likely",
  },
  // Moderate selectivity is the realistic Target band for a student at or
  // near its bar. It is never mixed into the same tier as a HIGH school for
  // the same profile (a strong student sits above it and lands in
  // Likely/Safety); Safety is reserved for when the student is clearly above
  // the range of this meaningfully less selective institution.
  MODERATE: {
    FAR_BELOW: "reach",
    BELOW: "reach",
    NEAR: "target",
    MATCH: "target",
    ABOVE: "safety",
    WELL_ABOVE: "safety",
  },
  ACCESSIBLE: {
    FAR_BELOW: "reach",
    BELOW: "likely",
    NEAR: "likely",
    MATCH: "likely",
    ABOVE: "safety",
    WELL_ABOVE: "safety",
  },
  OPEN_ADMISSION: {
    FAR_BELOW: "likely",
    BELOW: "likely",
    NEAR: "likely",
    MATCH: "likely",
    ABOVE: "safety",
    WELL_ABOVE: "safety",
  },
};

/**
 * The honest ambition tier for a college given its institutional
 * selectivity band and the student's academic position. Returns null
 * when either axis cannot be assessed (never guessed).
 */
export function tierForBandAndPosition(
  band: InstitutionalSelectivityBand | null,
  position: AcademicPosition | null
): AmbitionTier | null {
  if (band == null) return null;
  if (position != null) return TIER_MATRIX[band][position];
  // The student's academic position cannot be assessed (missing
  // profile or college data): fall back to an honest band-only
  // default so an unassessable college is never blocked.
  switch (band) {
    case "ULTRA_ELITE":
      return "dream";
    case "VERY_HIGH":
    case "HIGH":
    case "SELECTIVE":
      return "reach";
    case "MODERATE":
    case "ACCESSIBLE":
    case "OPEN_ADMISSION":
      return "likely";
  }
}

export const TIER_POOL: Record<AmbitionTier, RelevancePool> = {
  dream: "AMBITIOUS",
  reach: "AMBITIOUS",
  target: "REALISTIC",
  likely: "REALISTIC",
  safety: "SAFETY",
  pathway: "PATHWAY",
};

// ============================================================
// COMPUTE RELEVANCE  (pure, deterministic)
// ============================================================

export function computeAcademicRelevance(
  profile: EngineProfile,
  college: EngineCollege
): AcademicRelevance {
  const academic = computeAcademicDistance(profile, college);
  const position = academicPositionForBand(academic.combinedBand);
  const pathway = isPathwayCollege(college);
  const index = institutionalSelectivityIndex(college);
  const band = institutionalSelectivityBand(college);

  let tier: AmbitionTier | null;
  if (pathway) {
    tier = "pathway";
  } else if (academic.isAcademicMismatch) {
    // Dramatically below the published bar: Dream for any institution
    // where the student is severely underqualified, regardless of
    // institutional selectivity. A mismatch is a mismatch.
    tier = "dream";
  } else {
    tier = tierForBandAndPosition(band, position);
  }

  return {
    position,
    institutionalBand: band,
    institutionalBandLabel: INSTITUTIONAL_BAND_LABELS[band],
    institutionalIndex: index,
    isPathway: pathway,
    tier,
    pool: tier ? TIER_POOL[tier] : "REALISTIC",
    academic,
  };
}

// ============================================================
// TIER EXPLANATION  (the interpretation layer's "why this tier")
//
// Explains WHY a college sits in its assigned tier, tying the student's
// academic position to the institution's selectivity. It never frames a
// fit score as admission likelihood, and it never claims that being at
// or above the reported range makes admission at an elite college
// likely.
// ============================================================

export function explainTier(
  profile: EngineProfile,
  college: EngineCollege,
  relevance: AcademicRelevance
): string {
  const name = college.name;
  const position = relevance.position;
  const farBelow = position === "FAR_BELOW" || position === "BELOW";
  const belowBar = farBelow || position === "NEAR";

  switch (relevance.tier) {
    case "dream":
      if (belowBar) {
        return `Your academic profile currently sits ${
          farBelow ? "significantly below" : "at the lower edge of"
        } ${name}'s reported range, so ${name} is a Dream — admission would be a long shot at your current profile.`;
      }
      return relevance.institutionalBand === "ULTRA_ELITE"
        ? `Admission to ${name} is extremely selective. An exceptionally strong academic profile still keeps it a Dream, because academic fit alone does not make admission likely.`
        : `Admission to ${name} is highly selective and your academic profile does not place you clearly above the typical applicant — that is why it stays a Dream rather than a Target.`;
    case "reach":
      if (belowBar) {
        return `Your academic profile sits ${
          farBelow ? "significantly below" : "at the lower edge of"
        } ${name}'s reported range, and admission remains competitive — that is why ${name} is a Reach.`;
      }
      return `Admission to ${name} is highly selective. A strong academic profile keeps it a Reach rather than a Target, because admission outcomes depend on the full applicant pool.`;
    case "target":
      return `Your academic profile is at or above ${name}'s typical reported range while the school remains meaningfully competitive — that is why ${name} is a Target rather than a Likely or a Reach.`;
    case "likely":
      return `Your academic profile is comfortably at or above ${name}'s typical reported range, so ${name} is a Likely — a realistic option, though admission is still not guaranteed.`;
    case "safety":
      return `Your academic profile is substantially above ${name}'s typical reported range and the college is meaningfully less selective, making it a reasonable Safety option. Admission is still not guaranteed.`;
    case "pathway":
      return `${name} is a community college. It can be a smart strategic pathway: build a strong record here, then transfer into a 4-year university — many have transfer agreements that count your credits toward a bachelor's degree.`;
    default:
      return `This college is placed in its tier based on your academic profile and the school's overall selectivity.`;
  }
}