// ============================================================
// COLLEGIA — ACADEMIC DISTANCE (realism layer)
//
// A reusable, pure, deterministic analysis of how far a student's
// CURRENT academic profile sits relative to a college's reported
// academic profile (average GPA and SAT/ACT middle-50% ranges).
//
// This module is the "academic realism" layer. It is deliberately
// separate from the frozen Match Engine v1: it never changes the
// engine's weights, dimensions, formulas, or score thresholds. The
// College List Builder consumes this module to decide which ambition
// tiers are honest for a given student, and the interpretation layer
// uses it to write honest explanations.
//
// CONCEPTS
// --------
// gpaGap      = student.gpa - college.avgGpa
// satGap      = student.sat relative to college.satRange
// actGap      = student.act relative to college.actRange
// severity    = numeric intensity of the worst available signal
//               (-3 dramatically below ... +2 well above)
// position    = severity normalized to [-1, 1] (shared with the
//               list builder's tiering logic)
//
// ACADEMIC POSITION BANDS (data-driven thresholds)
// -----
// VERY_FAR_BELOW   — dramatically below the college's typical profile
// FAR_BELOW        — clearly below; a serious academic gap
// BELOW_RANGE      — below, but within reach
// NEAR_RANGE       — at the low edge of the typical profile
// WITHIN_RANGE     — inside the college's reported middle range
// ABOVE_RANGE      — above the college's reported profile
// WELL_ABOVE_RANGE — well above the college's reported profile
//
// The GPA bands scale with the college's own average: more selective
// colleges report narrower admitted-GPA ranges, so the same absolute
// gap is a bigger mismatch at a 3.8-average college than at a
// 2.8-average college. This is driven entirely by the college's
// published data — never hardcoded per university.
// ============================================================

import type { EngineCollege, EngineProfile } from "@/lib/services/match.engine";

// ============================================================
// BANDS
// ============================================================

export type AcademicPositionBand =
  | "VERY_FAR_BELOW"
  | "FAR_BELOW"
  | "BELOW_RANGE"
  | "NEAR_RANGE"
  | "WITHIN_RANGE"
  | "ABOVE_RANGE"
  | "WELL_ABOVE_RANGE";

export const ACADEMIC_POSITION_BANDS: readonly AcademicPositionBand[] = [
  "VERY_FAR_BELOW",
  "FAR_BELOW",
  "BELOW_RANGE",
  "NEAR_RANGE",
  "WITHIN_RANGE",
  "ABOVE_RANGE",
  "WELL_ABOVE_RANGE",
];

export const ACADEMIC_POSITION_LABELS: Record<AcademicPositionBand, string> = {
  VERY_FAR_BELOW: "Very far below",
  FAR_BELOW: "Far below",
  BELOW_RANGE: "Below the reported range",
  NEAR_RANGE: "Near the reported range",
  WITHIN_RANGE: "Within the reported range",
  ABOVE_RANGE: "Above the reported range",
  WELL_ABOVE_RANGE: "Well above the reported range",
};

export const ACADEMIC_POSITION_BADGE: Record<AcademicPositionBand, string> = {
  VERY_FAR_BELOW: "badge-reach",
  FAR_BELOW: "badge-reach",
  BELOW_RANGE: "badge-target",
  NEAR_RANGE: "badge-target",
  WITHIN_RANGE: "badge-strong",
  ABOVE_RANGE: "badge-strong",
  WELL_ABOVE_RANGE: "badge-strong",
};

// Numeric intensity of each band. -3 is the most severe deficit.
export const BAND_SEVERITY: Record<AcademicPositionBand, number> = {
  VERY_FAR_BELOW: -3,
  FAR_BELOW: -2,
  BELOW_RANGE: -1.5,
  NEAR_RANGE: -0.75,
  WITHIN_RANGE: 0,
  ABOVE_RANGE: 1,
  WELL_ABOVE_RANGE: 2,
};

// A college is blocked from the realistic tiers (Target / Strong
// Match / Likely) when the worst available academic signal is
// FAR_BELOW or worse (severity <= -1.75). BELOW_RANGE (-1.5) is
// below but still within reach and may remain a realistic option.
export const MISMATCH_SEVERITY = -1.75;

export type AcademicDataCoverage = "HIGH" | "MEDIUM" | "LIMITED";

// ============================================================
// COMPONENT GAP RESULTS
// ============================================================

export interface GpaGapResult {
  available: boolean;
  studentGpa: number | null;
  collegeGpa: number | null;
  /** student.gpa - college.avgGpa */
  gpaGap: number | null;
  band: AcademicPositionBand | null;
  label: string;
}

export interface SatGapResult {
  available: boolean;
  studentSat: number | null;
  satRangeMin: number | null;
  satRangeMax: number | null;
  /** student.sat - midpoint of the college's reported range */
  satGap: number | null;
  band: AcademicPositionBand | null;
  label: string;
}

export interface ActGapResult {
  available: boolean;
  studentAct: number | null;
  actRangeMin: number | null;
  actRangeMax: number | null;
  /** student.act - midpoint of the college's reported range */
  actGap: number | null;
  band: AcademicPositionBand | null;
  label: string;
}

export interface AcademicDistance {
  gpa: GpaGapResult;
  sat: SatGapResult;
  act: ActGapResult;
  /** Worst available signal's band (the driver of the realism gate). */
  combinedBand: AcademicPositionBand | null;
  combinedLabel: string;
  /** Worst available signal severity in [-3, 2]. */
  severity: number | null;
  dataCoverage: AcademicDataCoverage;
  /** True when the current profile is dramatically below the college's bar. */
  isAcademicMismatch: boolean;
  /** True when every available signal is at or above the college's bar. */
  isAcademicallyCompetitive: boolean;
  /** Honest, counselor-style explanation of the academic reality. */
  message: string;
}

// ============================================================
// HELPERS
// ============================================================

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function compatibleGpaScales(student: number | null, college: number | null): boolean {
  return Math.abs((student ?? 4.0) - (college ?? 4.0)) < 0.001;
}

function fmtGpa(n: number): string {
  return n.toFixed(2);
}

function rangeText(min: number | null, max: number | null): string {
  if (min != null && max != null) return `${min}–${max}`;
  if (min != null) return `${min}+`;
  if (max != null) return `≤ ${max}`;
  return "n/a";
}

function bandLabel(band: AcademicPositionBand | null): string {
  return band ? ACADEMIC_POSITION_LABELS[band] : "Unknown";
}

function severityFor(band: AcademicPositionBand): number {
  return BAND_SEVERITY[band];
}

// ============================================================
// GPA BANDS (scaled by the college's own average)
//
//   scale = 0.4 + max(0, 3.5 - collegeAvgGpa) * 0.3
//
//   VERY_FAR_BELOW   gap <   -2.2 * scale
//   FAR_BELOW        gap <   -1.6 * scale
//   BELOW_RANGE      gap <   -0.9 * scale
//   NEAR_RANGE       gap <   -0.15 * scale
//   WITHIN_RANGE     gap <=   0.15 * scale
//   ABOVE_RANGE      gap <=   0.9 * scale
//   WELL_ABOVE_RANGE otherwise
//
// Examples vs a 3.8-average college (scale 0.4):
//   2.0 (-1.8)  -> VERY_FAR_BELOW   (dramatic)
//   2.9 (-0.9)  -> VERY_FAR_BELOW   (ambitious reach)
//   3.4 (-0.4)  -> BELOW_RANGE      (below but reachable)
//   3.7 (-0.1)  -> NEAR_RANGE
//   3.8 (0.0)   -> WITHIN_RANGE
//   3.9 (+0.1)  -> ABOVE_RANGE
// Examples vs a 2.8-average college (scale 0.61):
//   2.0 (-0.8)  -> BELOW_RANGE      (realistic applicant)
// ============================================================

export function gpaBandScale(collegeGpa: number): number {
  return 0.4 + Math.max(0, 3.5 - collegeGpa) * 0.3;
}

export function gpaBandForGap(gap: number, collegeGpa: number): AcademicPositionBand {
  const s = gpaBandScale(collegeGpa);
  if (gap < -2.2 * s) return "VERY_FAR_BELOW";
  if (gap < -1.6 * s) return "FAR_BELOW";
  if (gap < -0.9 * s) return "BELOW_RANGE";
  if (gap < -0.15 * s) return "NEAR_RANGE";
  if (gap <= 0.15 * s) return "WITHIN_RANGE";
  if (gap <= 0.9 * s) return "ABOVE_RANGE";
  return "WELL_ABOVE_RANGE";
}

export function computeGpaGap(profile: EngineProfile, college: EngineCollege): GpaGapResult {
  if (
    profile.gpa == null ||
    college.avgGpa == null ||
    !compatibleGpaScales(profile.gpaScale, college.gpaScale)
  ) {
    return {
      available: false,
      studentGpa: profile.gpa,
      collegeGpa: college.avgGpa,
      gpaGap: null,
      band: null,
      label: "Unknown",
    };
  }
  const gpaGap = profile.gpa - college.avgGpa;
  const band = gpaBandForGap(gpaGap, college.avgGpa);
  return {
    available: true,
    studentGpa: profile.gpa,
    collegeGpa: college.avgGpa,
    gpaGap,
    band,
    label: bandLabel(band),
  };
}

// ============================================================
// SAT / ACT BANDS (relative to the college's reported range)
//
// SAT (scale points are fixed because the SAT is on a universal
// scale; the college's own range anchors the comparison):
//   VERY_FAR_BELOW   student <  rangeMin - 220
//   FAR_BELOW        student <  rangeMin - 140
//   BELOW_RANGE      student <  rangeMin - 70
//   NEAR_RANGE       student <  rangeMin
//   WITHIN_RANGE     rangeMin <= student <= rangeMax
//   ABOVE_RANGE      student <= rangeMax + 60
//   WELL_ABOVE_RANGE otherwise
//
// ACT (same shape, ACT-scale points):
//   VERY_FAR_BELOW   student <  rangeMin - 6
//   FAR_BELOW        student <  rangeMin - 4
//   BELOW_RANGE      student <  rangeMin - 2
//   NEAR_RANGE       student <  rangeMin
//   WITHIN_RANGE     rangeMin <= student <= rangeMax
//   ABOVE_RANGE      student <= rangeMax + 1
//   WELL_ABOVE_RANGE otherwise
// ============================================================

export function bandForBelow(score: number, rangeMin: number, veryFar: number, far: number, below: number): AcademicPositionBand {
  if (score < rangeMin - veryFar) return "VERY_FAR_BELOW";
  if (score < rangeMin - far) return "FAR_BELOW";
  if (score < rangeMin - below) return "BELOW_RANGE";
  return "NEAR_RANGE";
}

export function bandForAbove(score: number, rangeMax: number, above: number): AcademicPositionBand {
  if (score <= rangeMax + above) return "ABOVE_RANGE";
  return "WELL_ABOVE_RANGE";
}

export function computeSatGap(profile: EngineProfile, college: EngineCollege): SatGapResult {
  if (profile.sat == null || college.satRangeMin == null || college.satRangeMax == null) {
    return {
      available: false,
      studentSat: profile.sat,
      satRangeMin: college.satRangeMin,
      satRangeMax: college.satRangeMax,
      satGap: null,
      band: null,
      label: "Unknown",
    };
  }
  const mid = (college.satRangeMin + college.satRangeMax) / 2;
  const satGap = profile.sat - mid;
  let band: AcademicPositionBand;
  if (profile.sat < college.satRangeMin) {
    band = bandForBelow(profile.sat, college.satRangeMin, 220, 140, 70);
  } else if (profile.sat <= college.satRangeMax) {
    band = "WITHIN_RANGE";
  } else {
    band = bandForAbove(profile.sat, college.satRangeMax, 60);
  }
  return {
    available: true,
    studentSat: profile.sat,
    satRangeMin: college.satRangeMin,
    satRangeMax: college.satRangeMax,
    satGap,
    band,
    label: bandLabel(band),
  };
}

export function computeActGap(profile: EngineProfile, college: EngineCollege): ActGapResult {
  if (profile.act == null || college.actRangeMin == null || college.actRangeMax == null) {
    return {
      available: false,
      studentAct: profile.act,
      actRangeMin: college.actRangeMin,
      actRangeMax: college.actRangeMax,
      actGap: null,
      band: null,
      label: "Unknown",
    };
  }
  const mid = (college.actRangeMin + college.actRangeMax) / 2;
  const actGap = profile.act - mid;
  let band: AcademicPositionBand;
  if (profile.act < college.actRangeMin) {
    band = bandForBelow(profile.act, college.actRangeMin, 6, 4, 2);
  } else if (profile.act <= college.actRangeMax) {
    band = "WITHIN_RANGE";
  } else {
    band = bandForAbove(profile.act, college.actRangeMax, 1);
  }
  return {
    available: true,
    studentAct: profile.act,
    actRangeMin: college.actRangeMin,
    actRangeMax: college.actRangeMax,
    actGap,
    band,
    label: bandLabel(band),
  };
}

// ============================================================
// COMBINED ACADEMIC DISTANCE
// ============================================================

export function computeAcademicDistance(profile: EngineProfile, college: EngineCollege): AcademicDistance {
  const gpa = computeGpaGap(profile, college);
  const sat = computeSatGap(profile, college);
  const act = computeActGap(profile, college);

  const present: { band: AcademicPositionBand; severity: number }[] = [];
  if (gpa.band) present.push({ band: gpa.band, severity: severityFor(gpa.band) });
  if (sat.band) present.push({ band: sat.band, severity: severityFor(sat.band) });
  if (act.band) present.push({ band: act.band, severity: severityFor(act.band) });

  const count = present.length;
  const dataCoverage: AcademicDataCoverage = count === 3 ? "HIGH" : count === 2 ? "MEDIUM" : "LIMITED";

  if (count === 0) {
    return {
      gpa,
      sat,
      act,
      combinedBand: null,
      combinedLabel: "Unknown",
      severity: null,
      dataCoverage,
      isAcademicMismatch: false,
      isAcademicallyCompetitive: false,
      message:
        "There isn't enough reported academic data for this college to assess your competitiveness against it.",
    };
  }

  // The worst available signal drives the realism assessment.
  const worst = present.reduce((a, b) => (b.severity < a.severity ? b : a), present[0]);
  const severity = worst.severity;
  const combinedBand = worst.band;
  const isAcademicMismatch = severity <= MISMATCH_SEVERITY;
  const isAcademicallyCompetitive = severity >= 0;

  const distance: AcademicDistance = {
    gpa,
    sat,
    act,
    combinedBand,
    combinedLabel: bandLabel(combinedBand),
    severity,
    dataCoverage,
    isAcademicMismatch,
    isAcademicallyCompetitive,
    message: "",
  };
  distance.message = academicRealityMessage(distance);
  return distance;
}

// ============================================================
// MESSAGING (honest interpretation layer)
// ============================================================

export function selectivityLabel(acceptanceRate: number | null): string {
  if (acceptanceRate == null) return "highly selective";
  if (acceptanceRate <= 10) return "extremely selective";
  if (acceptanceRate <= 25) return "highly selective";
  if (acceptanceRate <= 50) return "selective";
  return "competitive";
}

function academicRealityMessage(d: AcademicDistance): string {
  const details: string[] = [];

  if (d.gpa.available && d.gpa.band && d.gpa.studentGpa != null && d.gpa.collegeGpa != null) {
    const b = d.gpa.band;
    if (b === "VERY_FAR_BELOW" || b === "FAR_BELOW") {
      details.push(
        `Your GPA of ${fmtGpa(d.gpa.studentGpa)} is well below this college's reported average of ${fmtGpa(d.gpa.collegeGpa)}.`
      );
    } else if (b === "BELOW_RANGE" || b === "NEAR_RANGE") {
      details.push(
        `Your GPA of ${fmtGpa(d.gpa.studentGpa)} is slightly below this college's reported average of ${fmtGpa(d.gpa.collegeGpa)}.`
      );
    } else if (b === "WITHIN_RANGE") {
      details.push(
        `Your GPA of ${fmtGpa(d.gpa.studentGpa)} is in line with this college's reported average of ${fmtGpa(d.gpa.collegeGpa)}.`
      );
    } else {
      details.push(
        `Your GPA of ${fmtGpa(d.gpa.studentGpa)} is at or above this college's reported average of ${fmtGpa(d.gpa.collegeGpa)}.`
      );
    }
  }

  if (d.sat.available && d.sat.band && d.sat.studentSat != null) {
    const b = d.sat.band;
    const r = rangeText(d.sat.satRangeMin, d.sat.satRangeMax);
    if (b === "VERY_FAR_BELOW" || b === "FAR_BELOW") {
      details.push(`Your SAT of ${d.sat.studentSat} is well below this college's reported range of ${r}.`);
    } else if (b === "BELOW_RANGE" || b === "NEAR_RANGE") {
      details.push(`Your SAT of ${d.sat.studentSat} is slightly below this college's reported range of ${r}.`);
    } else if (b === "WITHIN_RANGE") {
      details.push(`Your SAT of ${d.sat.studentSat} is within this college's reported range of ${r}.`);
    } else {
      details.push(`Your SAT of ${d.sat.studentSat} is above this college's reported range of ${r}.`);
    }
  }

  if (d.act.available && d.act.band && d.act.studentAct != null) {
    const b = d.act.band;
    const r = rangeText(d.act.actRangeMin, d.act.actRangeMax);
    if (b === "VERY_FAR_BELOW" || b === "FAR_BELOW") {
      details.push(`Your ACT of ${d.act.studentAct} is well below this college's reported range of ${r}.`);
    } else if (b === "BELOW_RANGE" || b === "NEAR_RANGE") {
      details.push(`Your ACT of ${d.act.studentAct} is slightly below this college's reported range of ${r}.`);
    } else if (b === "WITHIN_RANGE") {
      details.push(`Your ACT of ${d.act.studentAct} is within this college's reported range of ${r}.`);
    } else {
      details.push(`Your ACT of ${d.act.studentAct} is above this college's reported range of ${r}.`);
    }
  }

  if (details.length === 0) {
    return "There isn't enough reported academic data for this college to assess your competitiveness against it.";
  }

  if (d.isAcademicMismatch) {
    return `Your current academic profile is significantly below this college's reported range. ${details.join(" ")}`;
  }

  return details.join(" ");
}

/**
 * Message used when the student IS academically competitive but the
 * college is still an ambitious reach because admission is selective.
 * Academic fit is not an admission guarantee.
 */
export function selectivityAdmissionMessage(acceptanceRate: number | null): string {
  const label = selectivityLabel(acceptanceRate);
  return `Your academic profile is competitive for this college, but admission is ${label} and outcomes depend on the full applicant pool.`;
}

// ============================================================
// NUMERIC POSITION ([-1, 1]) — shared with the list builder
// ============================================================

/**
 * Normalizes the worst-signal severity to [-1, 1] so tiering logic
 * can keep using a single signed position value:
 *   -1 = dramatically below, 0 = at the college's bar, +1 = far above.
 */
export function computeAcademicPositionScore(profile: EngineProfile, college: EngineCollege): number {
  const d = computeAcademicDistance(profile, college);
  if (d.severity == null) return 0;
  return clamp(d.severity / 3, -1, 1);
}

// ============================================================
// REALISM GATE (used by the College List Builder)
// ============================================================

/**
 * True when the student's current academic profile is dramatically
 * below the college's typical reported profile. Such a college must
 * not be presented as Target / Strong Match / Likely — only as an
 * ambitious Dream/Reach.
 */
export function isAcademicMismatch(profile: EngineProfile, college: EngineCollege): boolean {
  return computeAcademicDistance(profile, college).isAcademicMismatch;
}