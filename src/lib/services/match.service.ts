import type { College } from "@/types";
import type { StudentProfileView } from "@/lib/services/profile.service";
import type { MatchClassification } from "@prisma/client";
import {
  MATCH_DIMENSIONS,
  MATCH_ENGINE_VERSION,
  type MatchConfidence,
  type MatchDimension,
} from "@/lib/services/match.engine";

export { MATCH_DIMENSIONS, MATCH_ENGINE_VERSION };
export type { MatchConfidence, MatchDimension };

// ============================================================
// COLLEGIA MATCH — CONTRACT + DEMO CLASSIFIER
//
// The real, deterministic engine lives in match.engine.ts
// (engineVersion "collegia-match-v1"). This file keeps the shared
// contract types and the clearly-marked DEMO classifier so the
// product works end-to-end until the engine is wired in.
//
// NOTE: A Match Score is a measure of profile/college FIT, never
// an admissions probability. Scores are displayed as
// "84 Collegia Match" / "Strong Match", never "84% chance".
// ============================================================

export interface MatchDimensionScore {
  dimension: MatchDimension;
  label: string;
  score: number; // 0-100
  confidence: MatchConfidence;
  reasons: string[];
}

export interface MatchResult {
  collegeId: string;
  matchScore: number; // 0-100 Collegia Match (fit), NOT admission probability
  classification: MatchClassification;
  engineVersion: string;
  breakdown: MatchDimensionScore[];
  isDemo: boolean;
}

export function matchClassificationForScore(score: number): MatchClassification {
  if (score >= 80) return "STRONG_MATCH";
  if (score >= 60) return "TARGET";
  return "REACH";
}

export function matchLabelForClassification(c: MatchClassification): "Strong Match" | "Target" | "Reach" {
  if (c === "STRONG_MATCH") return "Strong Match";
  if (c === "TARGET") return "Target";
  return "Reach";
}

// ============================================================
// DEMO CLASSIFIER (to be replaced by the real engine)
// ============================================================

const DEMO_DIMENSION_LABELS: Record<MatchDimension, string> = {
  academic: "Academic Fit",
  major: "Major Fit",
  financial: "Financial Fit",
  location: "Location Fit",
  collegePreference: "College Preference Fit",
  international: "International Fit",
  interests: "Student Interest Fit",
};

/**
 * DEMO classification. Uses basic profile hints (academic + budget)
 * to pick a stable, deterministic bucket. This is intentionally
 * simplistic and is NOT the final Match Engine.
 */
export function demoClassifyCollege(
  college: College,
  profile: StudentProfileView | null
): MatchResult {
  let score = 60;
  const reasons: string[] = [];
  const breakdown: MatchDimensionScore[] = [];

  const hasStrongAcademics = profile?.gpa != null && college.admissions.avgGPA > 0
    ? profile.gpa >= college.admissions.avgGPA
    : false;
  const hasSat = profile?.satScore != null && college.admissions.satRange[1] > 0
    ? profile.satScore >= college.admissions.satRange[0]
    : false;

  if (hasStrongAcademics) score += 12;
  if (hasSat) score += 8;

  if (profile?.financialAid?.annualBudget != null && college.cost.totalCost > 0) {
    if (profile.financialAid.annualBudget >= college.cost.totalCost) score += 10;
    else if (college.financial.internationalAid) score += 5;
  }

  if (profile?.financialAid?.requiresScholarship && college.financial.internationalAid) {
    score += 6;
    reasons.push("International aid available");
  }

  const maxScore = Math.min(score, 96);
  const classification = matchClassificationForScore(maxScore);

  const baseReason = profile?.intendedMajor
    ? `Offers strong programs in ${profile.intendedMajor}`
    : "Offers programs aligned with your interests";

  for (const dim of MATCH_DIMENSIONS) {
    breakdown.push({
      dimension: dim,
      label: DEMO_DIMENSION_LABELS[dim],
      score: maxScore,
      confidence: "LIMITED",
      reasons: dim === "academic" ? reasons : [baseReason],
    });
  }

  return {
    collegeId: college.id,
    matchScore: maxScore,
    classification,
    engineVersion: "demo-v1",
    breakdown,
    isDemo: true,
  };
}