// ============================================================
// COLLEGIA MATCH ENGINE v1
//
// Official implementation spec:
//   https://... COLLEGIA MATCH ENGINE v1 (internal)
//
// The Collegia Match Score measures how well a college fits the
// student's CURRENT profile and preferences. It is a FIT score,
// NOT an admissions probability. Never display it as "% chance".
//
// Determinism rules:
//   - Pure functions only (no I/O inside scoring).
//   - Same EngineProfile + EngineCollege + engine version always
//     produce the same result.
//   - UNKNOWN data is never treated as 0 (zero).
//
// Missing-data behavior:
//   - Every dimension returns { score, confidence, reasons }.
//   - confidence is HIGH / MEDIUM / LIMITED.
//   - Missing data lowers confidence, never silently zeroes a fit.
// ============================================================

import type { CollegeWithRelations } from "./college.service";
import type { StudentProfileView } from "./profile.service";
import type {
  CollegeRegion,
  CampusSetting,
  CollegeSize,
  CollegeType,
  MatchClassification,
} from "@prisma/client";

export const MATCH_ENGINE_VERSION = "collegia-match-v1";

export type MatchConfidence = "HIGH" | "MEDIUM" | "LIMITED";

export const MATCH_DIMENSIONS = [
  "academic",
  "major",
  "financial",
  "location",
  "collegePreference",
  "international",
  "interests",
] as const;

export type MatchDimension = (typeof MATCH_DIMENSIONS)[number];

export const DIMENSION_LABELS: Record<MatchDimension, string> = {
  academic: "Academic Fit",
  major: "Major Fit",
  financial: "Financial Fit",
  location: "Location Fit",
  collegePreference: "College Preference Fit",
  international: "International Fit",
  interests: "Interest / Lifestyle Fit",
};

// Official weights (sum = 1.00)
export const DIMENSION_WEIGHTS: Record<MatchDimension, number> = {
  academic: 0.25,
  major: 0.2,
  financial: 0.2,
  location: 0.1,
  collegePreference: 0.1,
  international: 0.1,
  interests: 0.05,
};

// ============================================================
// INPUT TYPES (normalized, plain)
// ============================================================

export interface EngineProfile {
  gpa: number | null;
  gpaScale: number | null;
  sat: number | null;
  act: number | null;
  intendedMajor: string | null;
  intendedMajorCategory: string | null;
  preferredStates: string[];
  preferredRegions: string[];
  preferredSizes: string[];
  publicPrivate: string[];
  preferredSettings: string[];
  sports: string[];
  clubs: string[];
  interests: string[];
  annualBudget: number | null;
  requiresFinancialAid: boolean | null;
  requiresScholarship: boolean | null;
  isInternationalStudent: boolean;
  englishProficiencyScore: number | null;
  ieltsScore: number | null;
}

export interface EngineCollege {
  id: string;
  name: string;
  acceptanceRate?: number | null;
  avgGpa: number | null;
  gpaScale: number | null;
  satRangeMin: number | null;
  satRangeMax: number | null;
  actRangeMin: number | null;
  actRangeMax: number | null;
  estimatedTotalCost: number | null;
  internationalAidAvailable: boolean | null;
  meritScholarshipsAvailable: boolean | null;
  needBasedAidAvailable: boolean | null;
  meetsFullNeed: boolean | null;
  avgAidInternational: number | null;
  region: CollegeRegion | null;
  stateCode: string | null;
  setting: CampusSetting | null;
  sizeCategory: CollegeSize | null;
  type: CollegeType | null;
  housing: string | null;
  sports: string[];
  tags: string[];
  clubsCount: number | null;
  internationalPercentage: number | null;
  internationalPopulation: number | null;
  i20Support: boolean | null;
  optAvailable: boolean | null;
  toeflMinimum: number | null;
  ieltsMinimum: number | null;
  majors: { name: string; category: string | null; strength: number | null }[];
}

export interface DimensionResult {
  dimension: MatchDimension;
  label: string;
  score: number; // 0-100
  confidence: MatchConfidence;
  reasons: string[];
}

export interface EngineMatchResult {
  score: number; // 0-100 Collegia Match (fit), NOT admission probability
  classification: MatchClassification;
  engineVersion: string;
  dimensions: DimensionResult[];
}

// ============================================================
// HELPERS
// ============================================================

function clampScore(n: number): number {
  return Math.max(0, Math.min(100, n));
}

const REGION_LABEL: Record<string, string> = {
  NORTHEAST: "Northeast",
  EAST_COAST: "East Coast",
  MIDWEST: "Midwest",
  SOUTH: "South",
  SOUTHWEST: "Southwest",
  WEST_COAST: "West Coast",
  OTHER: "Other",
};

const SETTING_LABEL: Record<string, string> = {
  URBAN: "Urban",
  SUBURBAN: "Suburban",
  RURAL: "Rural",
};

const SIZE_LABEL: Record<string, string> = {
  SMALL: "Small",
  MEDIUM: "Medium",
  LARGE: "Large",
};

const TYPE_LABEL: Record<string, string> = {
  PUBLIC: "Public",
  PRIVATE: "Private",
};

function compatibleGpaScales(student: number | null, college: number | null): boolean {
  const a = student ?? 4.0;
  const b = college ?? 4.0;
  return Math.abs(a - b) < 0.001;
}

// ============================================================
// 6. ACADEMIC FIT  (25%)
// ============================================================

export function scoreAcademic(profile: EngineProfile, college: EngineCollege): DimensionResult {
  const reasons: string[] = [];
  let gpaScore: number | null = null;
  let testScore: number | null = null;

  const studentGpa = profile.gpa;
  const collegeGpa = college.avgGpa;

  if (studentGpa != null && collegeGpa != null) {
    if (!compatibleGpaScales(profile.gpaScale, college.gpaScale)) {
      reasons.push("GPA scales differ and cannot be reliably compared — treated as unknown.");
    } else {
      const below = collegeGpa - studentGpa;
      if (below > 0) {
        if (below <= 0.09) gpaScore = 80;
        else if (below <= 0.19) gpaScore = 65;
        else gpaScore = 45;
        reasons.push("Your GPA is below the college's reported average.");
      } else {
        const above = studentGpa - collegeGpa;
        gpaScore = Math.min(100, 95 + Math.round(above * 25));
        reasons.push("Your GPA is within or above the college's reported range.");
      }
    }
  }

  // Test component — prefer the test that provides the stronger comparison.
  const satUsable = profile.sat != null && college.satRangeMin != null && college.satRangeMax != null;
  const actUsable = profile.act != null && college.actRangeMin != null && college.actRangeMax != null;

  const scoreSat = () => scoreTestValue(profile.sat as number, college.satRangeMin as number, college.satRangeMax as number, 40);
  const scoreAct = () => scoreTestValue(profile.act as number, college.actRangeMin as number, college.actRangeMax as number, 1);

  if (satUsable && actUsable) {
    const s = scoreSat();
    const a = scoreAct();
    if (a >= s) {
      testScore = a;
      reasons.push(testReason("ACT", profile.act as number, college.actRangeMin as number, college.actRangeMax as number));
    } else {
      testScore = s;
      reasons.push(testReason("SAT", profile.sat as number, college.satRangeMin as number, college.satRangeMax as number));
    }
  } else if (satUsable) {
    testScore = scoreSat();
    reasons.push(testReason("SAT", profile.sat as number, college.satRangeMin as number, college.satRangeMax as number));
  } else if (actUsable) {
    testScore = scoreAct();
    reasons.push(testReason("ACT", profile.act as number, college.actRangeMin as number, college.actRangeMax as number));
  } else if (profile.sat == null && profile.act == null) {
    // Student has no test — not a penalty, test simply unavailable.
  }

  if (gpaScore == null && testScore == null) {
    return {
      dimension: "academic",
      label: DIMENSION_LABELS.academic,
      score: 70,
      confidence: "LIMITED",
      reasons: ["Insufficient academic data."],
    };
  }

  let score: number;
  let confidence: MatchConfidence;
  if (gpaScore != null && testScore != null) {
    score = Math.round(gpaScore * 0.6 + testScore * 0.4);
    confidence = "HIGH";
  } else if (gpaScore != null) {
    score = gpaScore;
    confidence = "MEDIUM";
  } else {
    score = testScore as number;
    confidence = "MEDIUM";
  }

  return {
    dimension: "academic",
    label: DIMENSION_LABELS.academic,
    score: clampScore(score),
    confidence,
    reasons,
  };
}

function scoreTestValue(student: number, min: number, max: number, aboveStep: number): number {
  if (student >= min && student <= max) return 95;
  if (student > max) return Math.min(100, 95 + Math.min(5, Math.floor((student - max) / aboveStep)));
  return Math.max(0, Math.round(95 * (student / min)));
}

function testReason(kind: "SAT" | "ACT", student: number, min: number, max: number): string {
  if (student >= min && student <= max) return `Your ${kind} is within the college's reported range.`;
  if (student > max) return `Your ${kind} is above the college's reported range.`;
  return `Your ${kind} is slightly below the reported range.`;
}

// ============================================================
// 7. MAJOR FIT  (20%)
// ============================================================

const EXACT_MAJOR_SCORE: Record<number, number> = { 5: 100, 4: 95, 3: 90, 2: 80, 1: 70 };
const RELATED_MAJOR_SCORE: Record<number, number> = { 5: 85, 4: 80, 3: 75, 2: 65, 1: 55 };

function majorStrengthScore(strength: number | null, mapping: Record<number, number>): number {
  if (strength == null) return mapping[3];
  return mapping[strength] ?? mapping[3];
}

export function scoreMajor(profile: EngineProfile, college: EngineCollege): DimensionResult {
  if (!profile.intendedMajor) {
    return {
      dimension: "major",
      label: DIMENSION_LABELS.major,
      score: 70,
      confidence: "LIMITED",
      reasons: ["No intended major selected."],
    };
  }

  if (college.majors.length === 0) {
    return {
      dimension: "major",
      label: DIMENSION_LABELS.major,
      score: 0,
      confidence: "MEDIUM",
      reasons: ["No major programs recorded for this college."],
    };
  }

  const target = profile.intendedMajor.trim().toLowerCase();

  const exact = college.majors.find((m) => m.name.trim().toLowerCase() === target);
  if (exact) {
    return {
      dimension: "major",
      label: DIMENSION_LABELS.major,
      score: majorStrengthScore(exact.strength, EXACT_MAJOR_SCORE),
      confidence: "HIGH",
      reasons: ["Your intended major has a strong program at this college."],
    };
  }

  if (profile.intendedMajorCategory) {
    const related = college.majors.find(
      (m) => m.category != null && m.category === profile.intendedMajorCategory
    );
    if (related) {
      return {
        dimension: "major",
        label: DIMENSION_LABELS.major,
        score: majorStrengthScore(related.strength, RELATED_MAJOR_SCORE),
        confidence: "MEDIUM",
        reasons: [`Offers a related program in ${profile.intendedMajorCategory}.`],
      };
    }
  }

  return {
    dimension: "major",
    label: DIMENSION_LABELS.major,
    score: 40,
    confidence: "MEDIUM",
    reasons: ["No related program found for your intended major."],
  };
}

// ============================================================
// 8. FINANCIAL FIT  (20%)
// ============================================================

export function scoreFinancial(profile: EngineProfile, college: EngineCollege): DimensionResult {
  const budget = profile.annualBudget;
  const cost = college.estimatedTotalCost;

  if (budget == null || cost == null || cost <= 0) {
    return {
      dimension: "financial",
      label: DIMENSION_LABELS.financial,
      score: 70,
      confidence: "LIMITED",
      reasons: ["Insufficient financial data."],
    };
  }

  let score: number;
  const reasons: string[] = [];
  if (cost <= budget) {
    score = 100;
    reasons.push("This college's estimated cost is within your budget.");
  } else {
    const pctAbove = (cost - budget) / budget;
    if (pctAbove <= 0.1) score = 90;
    else if (pctAbove <= 0.25) score = 75;
    else if (pctAbove <= 0.5) score = 55;
    else if (pctAbove <= 1.0) score = 35;
    else score = 20;
    reasons.push("This college's estimated cost is above your current budget.");
  }

  // Compatibility adjustments — NOT promises of aid.
  if (college.internationalAidAvailable === true) {
    score += 5;
    reasons.push("International aid is available.");
  }
  if (college.meritScholarshipsAvailable === true) {
    score += 5;
    reasons.push("Merit scholarships are available.");
  }
  if (college.needBasedAidAvailable === true) {
    score += 3;
    reasons.push("Need-based aid is available.");
  }
  if (college.meetsFullNeed === true) {
    score += 7;
    reasons.push("This college meets full demonstrated need.");
  }

  const aidKnown = [
    college.internationalAidAvailable,
    college.meritScholarshipsAvailable,
    college.needBasedAidAvailable,
    college.meetsFullNeed,
  ].filter((v) => v != null).length;

  const confidence: MatchConfidence = aidKnown >= 3 ? "HIGH" : aidKnown >= 1 ? "MEDIUM" : "LIMITED";

  return {
    dimension: "financial",
    label: DIMENSION_LABELS.financial,
    score: clampScore(score),
    confidence,
    reasons,
  };
}

// ============================================================
// 9. LOCATION FIT  (10%)
// ============================================================

export function scoreLocation(profile: EngineProfile, college: EngineCollege): DimensionResult {
  const reasons: string[] = [];
  const hasGeo = profile.preferredStates.length > 0 || profile.preferredRegions.length > 0;

  let score: number;
  if (college.stateCode && profile.preferredStates.includes(college.stateCode)) {
    score = 100;
    reasons.push("The college is in a state you prefer.");
  } else if (college.region && profile.preferredRegions.includes(REGION_LABEL[college.region])) {
    score = 90;
    reasons.push("The college is located in one of your preferred regions.");
  } else if (!hasGeo) {
    score = 75;
    reasons.push("No location preference set.");
  } else {
    score = 60;
    reasons.push("The college is outside your preferred locations.");
  }

  if (profile.preferredSettings.length > 0 && college.setting) {
    if (profile.preferredSettings.includes(SETTING_LABEL[college.setting])) {
      score += 5;
      reasons.push("The campus setting matches your preference.");
    } else {
      score -= 5;
      reasons.push("The campus setting differs from your preference.");
    }
  }

  return {
    dimension: "location",
    label: DIMENSION_LABELS.location,
    score: clampScore(score),
    confidence: hasGeo ? "HIGH" : "MEDIUM",
    reasons,
  };
}

// ============================================================
// 10. COLLEGE PREFERENCE FIT  (10%)
// ============================================================

export function scorePreference(profile: EngineProfile, college: EngineCollege): DimensionResult {
  const parts: number[] = [];
  const reasons: string[] = [];

  if (profile.publicPrivate.length > 0) {
    const value = TYPE_LABEL[college.type ?? ""];
    if (value) {
      parts.push(profile.publicPrivate.includes(value) ? 100 : 60);
      reasons.push(
        profile.publicPrivate.includes(value)
          ? "College type matches your preference."
          : "College type differs from your preference."
      );
    } else {
      parts.push(75);
      reasons.push("College type information unavailable.");
    }
  }

  if (profile.preferredSizes.length > 0) {
    const value = SIZE_LABEL[college.sizeCategory ?? ""];
    if (value) {
      parts.push(profile.preferredSizes.includes(value) ? 100 : 60);
      reasons.push(
        profile.preferredSizes.includes(value)
          ? "College size matches your preference."
          : "College size differs from your preference."
      );
    } else {
      parts.push(75);
      reasons.push("College size information unavailable.");
    }
  }

  if (profile.preferredSettings.length > 0) {
    const value = SETTING_LABEL[college.setting ?? ""];
    if (value) {
      parts.push(profile.preferredSettings.includes(value) ? 100 : 60);
      reasons.push(
        profile.preferredSettings.includes(value)
          ? "Campus setting matches your preference."
          : "Campus setting differs from your preference."
      );
    } else {
      parts.push(75);
      reasons.push("Campus setting information unavailable.");
    }
  }

  if (parts.length === 0) {
    return {
      dimension: "collegePreference",
      label: DIMENSION_LABELS.collegePreference,
      score: 75,
      confidence: "MEDIUM",
      reasons: ["No college preferences set."],
    };
  }

  const score = Math.round(parts.reduce((a, b) => a + b, 0) / parts.length);
  return {
    dimension: "collegePreference",
    label: DIMENSION_LABELS.collegePreference,
    score: clampScore(score),
    confidence: "HIGH",
    reasons,
  };
}

// ============================================================
// 11. INTERNATIONAL FIT  (10%)
// ============================================================

export function scoreInternational(profile: EngineProfile, college: EngineCollege): DimensionResult {
  const known = [
    college.i20Support,
    college.internationalAidAvailable,
    college.internationalPercentage,
    college.optAvailable,
  ].filter((v) => v != null).length;

  if (known === 0) {
    return {
      dimension: "international",
      label: DIMENSION_LABELS.international,
      score: 70,
      confidence: "LIMITED",
      reasons: ["International support data is largely unknown."],
    };
  }

  // Base 70 = "support exists but data is incomplete".
  let score = 70;
  const reasons: string[] = [];

  if (college.i20Support === true) {
    score += 15;
    reasons.push("I-20 support is available.");
  } else if (college.i20Support === false) {
    score -= 50;
    reasons.push("I-20 support is not available.");
  }

  if (college.internationalAidAvailable === true) {
    score += 10;
    reasons.push("International aid is available.");
  }

  if (college.internationalPercentage != null) {
    if (college.internationalPercentage >= 10) {
      score += 10;
      reasons.push("Has a meaningful international student population.");
    } else if (college.internationalPercentage >= 5) {
      score += 7;
    } else if (college.internationalPercentage > 0) {
      score += 5;
    }
  }

  if (college.optAvailable === true) {
    score += 5;
    reasons.push("OPT is available.");
  } else if (college.optAvailable === false) {
    score -= 5;
  }

  if (college.toeflMinimum != null || college.ieltsMinimum != null) {
    score += 5;
    reasons.push("English proficiency requirements are published.");
  }

  if (
    college.i20Support === true &&
    college.internationalAidAvailable === true &&
    (college.internationalPercentage ?? 0) >= 10
  ) {
    score += 5;
    reasons.push("Strong all-around international support.");
  }

  const confidence: MatchConfidence = known >= 4 ? "HIGH" : known >= 2 ? "MEDIUM" : "LIMITED";

  return {
    dimension: "international",
    label: DIMENSION_LABELS.international,
    score: clampScore(score),
    confidence,
    reasons,
  };
}

// ============================================================
// 12. INTEREST / LIFESTYLE FIT  (5%)
// ============================================================

export function scoreInterest(profile: EngineProfile, college: EngineCollege): DimensionResult {
  if (profile.interests.length === 0) {
    return {
      dimension: "interests",
      label: DIMENSION_LABELS.interests,
      score: 75,
      confidence: "MEDIUM",
      reasons: ["No interests recorded."],
    };
  }

  const offerings = new Set<string>();
  for (const s of [...college.sports, ...college.tags]) {
    const t = s.trim().toLowerCase();
    if (t.length >= 3) offerings.add(t);
  }

  let score = 75;
  let matches = 0;
  for (const interest of profile.interests) {
    const lc = interest.trim().toLowerCase();
    if (lc.length === 0) continue;
    const hit = [...offerings].some(
      (o) => o === lc || o.includes(lc) || lc.includes(o)
    );
    if (hit) matches += 1;
  }
  score = Math.min(100, 75 + matches * 5);

  const reasons =
    matches > 0
      ? ["The college offers activities matching your interests."]
      : ["No explicit interest matches found."];

  const confidence: MatchConfidence = offerings.size === 0 ? "LIMITED" : matches > 0 ? "HIGH" : "MEDIUM";

  return {
    dimension: "interests",
    label: DIMENSION_LABELS.interests,
    score,
    confidence,
    reasons,
  };
}

// ============================================================
// FINAL SCORE + CLASSIFICATION
// ============================================================

export function finalMatchScore(dimensions: DimensionResult[]): number {
  const byDimension = new Map(dimensions.map((d) => [d.dimension, d.score]));
  let total = 0;
  for (const dim of MATCH_DIMENSIONS) {
    const score = byDimension.get(dim) ?? 0;
    total += score * DIMENSION_WEIGHTS[dim];
  }
  return Math.round(total);
}

export function classifyMatch(score: number): MatchClassification {
  if (score >= 80) return "STRONG_MATCH";
  if (score >= 60) return "TARGET";
  return "REACH";
}

export function computeMatch(profile: EngineProfile, college: EngineCollege): EngineMatchResult {
  const dimensions: DimensionResult[] = [
    scoreAcademic(profile, college),
    scoreMajor(profile, college),
    scoreFinancial(profile, college),
    scoreLocation(profile, college),
    scorePreference(profile, college),
    scoreInternational(profile, college),
    scoreInterest(profile, college),
  ];

  const score = finalMatchScore(dimensions);

  return {
    score,
    classification: classifyMatch(score),
    engineVersion: MATCH_ENGINE_VERSION,
    dimensions,
  };
}

// ============================================================
// ADAPTERS
// ============================================================

export function profileToEngineProfile(
  profile: StudentProfileView,
  intendedMajorCategory: string | null
): EngineProfile {
  return {
    gpa: profile.gpa,
    gpaScale: profile.gpaScale,
    sat: profile.satScore,
    act: profile.actScore,
    intendedMajor: profile.intendedMajor,
    intendedMajorCategory,
    preferredStates: profile.preferences.preferredStates,
    preferredRegions: profile.preferences.preferredRegions,
    preferredSizes: profile.preferences.preferredSizes,
    publicPrivate: profile.preferences.publicPrivate,
    preferredSettings: profile.preferences.settings,
    sports: profile.preferences.sports,
    clubs: profile.preferences.clubs,
    interests: profile.preferences.interests,
    annualBudget: profile.financialAid.annualBudget,
    requiresFinancialAid: profile.financialAid.requiresFinancialAid,
    requiresScholarship: profile.financialAid.requiresScholarship,
    isInternationalStudent: profile.isInternationalStudent,
    englishProficiencyScore: profile.international.englishProficiencyScore,
    ieltsScore: profile.international.ieltsScore,
  };
}

export function collegeToEngineCollege(college: CollegeWithRelations): EngineCollege {
  return {
    id: college.id,
    name: college.name,
    acceptanceRate: college.acceptanceRate,
    avgGpa: college.avgGpa,
    gpaScale: college.gpaScale,
    satRangeMin: college.satRangeMin,
    satRangeMax: college.satRangeMax,
    actRangeMin: college.actRangeMin,
    actRangeMax: college.actRangeMax,
    estimatedTotalCost:
      college.estimatedTotalCostInternational ??
      (college.tuitionInternational != null && college.roomAndBoard != null
        ? college.tuitionInternational + college.roomAndBoard
        : null),
    internationalAidAvailable: college.internationalAidAvailable,
    meritScholarshipsAvailable: college.meritScholarshipsAvailable,
    needBasedAidAvailable: college.needBasedAidAvailable,
    meetsFullNeed: college.meetsFullNeed,
    avgAidInternational: college.avgAidInternational,
    region: college.region,
    stateCode: college.stateCode,
    setting: college.setting,
    sizeCategory: college.sizeCategory,
    type: college.type,
    housing: college.housing,
    sports: college.sports ?? [],
    tags: college.tags ?? [],
    clubsCount: college.clubsCount,
    internationalPercentage: college.internationalPercentage,
    internationalPopulation: college.internationalPopulation,
    i20Support: college.i20Support,
    optAvailable: college.optAvailable,
    toeflMinimum: college.toeflMinimum,
    ieltsMinimum: college.ieltsMinimum,
    majors: college.majors.map((m) => ({
      name: m.major.name,
      category: m.major.category,
      strength: m.strength,
    })),
  };
}