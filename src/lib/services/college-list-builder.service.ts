// ============================================================
// COLLEGIA — BALANCED COLLEGE LIST BUILDER
//
// Builds a balanced, counselor-style college list on top of the
// frozen Match Engine v1. The engine remains the source of truth
// for the Collegia Match score and the per-dimension fit. This
// module only decides which ambition levels to show and which
// colleges to pick, prioritizing diversity (region, size, type).
//
// ACADEMIC/SELECTIVITY RELEVANCE FIRST: an overall Match Score is a
// FIT measure and can be high even when the student is academically
// over- or under-qualified for a college. This module therefore runs
// an academic-relevance gate (see academic-relevance.service.ts)
// BEFORE any personal-fit ranking: relevance decides whether a
// college belongs in the pool at all, and fit only decides the
// ordering within that pool. A dramatically weaker school is moved
// into the explicit Safety tier (or dropped) even when its fit score
// is 90+; a dramatically harder school is moved into Dream/Reach even
// when its fit score is high. The frozen Match Engine is untouched.
//
// Tiers:
//   Dream    — ambitious schools: academically elite colleges with
//              ultra-low acceptance (top-elite tier), colleges where
//              the student sits clearly below the published bar, or
//              colleges flagged by the academic realism gate.
//   Reach    — possible but difficult: highly selective institutions
//              (admission rate at or below 25%) even when the student
//              is academically competitive, plus colleges where the
//              student sits below or at the published bar.
//   Target   — realistic academic range: the student is at the
//              edge of or inside the college's reported range
//              (NEAR_RANGE / WITHIN_RANGE) and admission is not
//              highly selective.
//   Likely   — the student's current profile is comfortably above the
//              college's reported range, with reasonable major /
//              financial / international compatibility, and the
//              college is not dramatically below the student's own
//              profile. For weak profiles, open-admission 4-year
//              institutions (85%+ admission rate) fill this tier
//              honestly.
//   Safety   — an explicit, separated tier for colleges where the
//              student's academics are clearly ABOVE the reported
//              range and admission is demonstrably non-selective
//              (published rate >= 40%). It is never mixed into the
//              primary Target/Likely tiers.
//   Pathway  — community college / 2-year options, surfaced when
//              the student's profile is below the normal range of
//              most 4-year institutions, framed as a legitimate
//              transfer pathway (not a punishment).
//
// Deterministic: same profile + same catalog => same list.
// A Collegia Match score is a FIT measure, never a probability,
// and no tier implies a guarantee of admission.
// ============================================================

import { prisma } from "@/lib/db/prisma";
import { getStudentProfile } from "@/lib/services/profile.service";
import { getSavedCollegeIds } from "@/lib/services/saved-college.service";
import {
  collegeToEngineCollege,
  computeMatch,
  profileToEngineProfile,
  type EngineCollege,
  type EngineMatchResult,
  type EngineProfile,
} from "@/lib/services/match.engine";
import { collegeInclude, mapCollegeToUI, type CollegeWithRelations } from "@/lib/services/college.service";
import { analyzeProfileGaps, potentialImpactForGap, type GapFinding } from "@/lib/services/recommendation.service";
import {
  computeAcademicDistance,
  computeAcademicPositionScore,
  selectivityAdmissionMessage,
  selectivityLabel,
  type AcademicDistance,
  type AcademicPositionBand,
} from "@/lib/services/academic-distance.service";
import {
  computeAcademicRelevance,
  isPathwayCollege,
  SELECTIVITY_BAND_LABELS,
  type AcademicPosition,
  type AcademicRelevance,
  type RelevancePool,
  type SelectivityBand,
} from "@/lib/services/academic-relevance.service";
import type { College } from "@/types";
import type { MatchClassification } from "@prisma/client";

// ============================================================
// CONSTANTS
// ============================================================

export const TIER_LABELS = {
  dream: "Dream",
  reach: "Reach",
  target: "Target",
  likely: "Likely",
  safety: "Safety",
  pathway: "Pathway",
} as const;

export type ListTierKey = keyof typeof TIER_LABELS;

export const TIER_ORDER: ListTierKey[] = ["dream", "reach", "target", "likely", "safety", "pathway"];

// Target list sizes vary with profile strength. A strong student
// gets a broader Dream/Reach strategy; a weak student gets fewer
// ambitious spots and more honest Likely/Pathway options. These are
// caps, not quotas: a tier that cannot be honestly filled stays
// smaller (the UI surfaces it as empty rather than padding it).
const STRONG_COUNTS: Record<ListTierKey, number> = {
  dream: 3,
  reach: 3,
  target: 4,
  likely: 3,
  safety: 3,
  pathway: 2,
};
const AVERAGE_COUNTS: Record<ListTierKey, number> = {
  dream: 2,
  reach: 3,
  target: 4,
  likely: 3,
  safety: 2,
  pathway: 2,
};
const WEAK_COUNTS: Record<ListTierKey, number> = {
  dream: 1,
  reach: 2,
  target: 3,
  likely: 4,
  safety: 1,
  pathway: 2,
};

// A college is considered academically elite (a dream for almost
// anyone) when its published academic profile clears these bars.
const ELITE_AVG_GPA = 3.9;
const ELITE_SAT_MIN = 1450;

// Selectivity-aware tiering (shared with academic-relevance.service):
//   ULTRA_SELECTIVE_RATE — an elite college admitting 7% or fewer is
//                           a Dream for any strong student.
//   HIGHLY_SELECTIVE_RATE — institutions admitting at or below 25% are
//                           ambitious: eligible for Dream/Reach, never
//                           Likely, even when the student's academics
//                           are excellent.
//   OPEN_ADMISSION_RATE   — 4-year colleges admitting 85%+ give weak
//                           profiles an honest Likely tier.
//   SAFETY_RATE           — colleges admitting 40%+ where the student
//                           sits clearly above the bar become an
//                           explicit Safety tier, never a primary
//                           Target/Likely.
const OPEN_ADMISSION_RATE = 85;
const SAFETY_RATE = 40;

// Likely relevance caps: a college is only a Likely when it is not
// dramatically below the student's own reported profile. Without
// this, an elite student's Likely tier would be padded with schools
// far beneath their academic level.
const LIKELY_MAX_GPA_GAP = 1.0;
const LIKELY_MAX_SAT_GAP = 400;

// Academic position thresholds (position is in [-1, 1]).
const DOMINANT_POSITION = 0.15; // student clearly above the college's bar
const LIKELY_MIN_SCORE = 65;
const LIKELY_MIN_MAJOR = 55;
const LIKELY_MIN_FINANCIAL = 55;
const LIKELY_MIN_INTERNATIONAL = 55;
const TARGET_MIN_SCORE = 60;
const REACH_MIN_SCORE = 55;

// A profile this weak is below the reported bar of most 4-year
// institutions, so the Pathway tier (community college / transfer)
// is surfaced as a legitimate strategic option.
const PATHWAY_PROFILE_GPA = 2.6;

export interface ListBuilderOptions {
  dreamCount?: number;
  reachCount?: number;
  targetCount?: number;
  likelyCount?: number;
  pathwayCount?: number;
}

// ============================================================
// ACADEMIC POSITION  (pure, deterministic)
//
// Roughly [-1, 1]: how the student stands relative to the
// college's published academic profile. -1 = far below, +1 = far
// above, 0 = at the college's reported bar. Derived from the
// academic-distance module's worst-signal severity so the tiering
// logic and the realism gate share one source of truth.
// ============================================================

function positionFromSeverity(severity: number | null): number {
  if (severity == null) return 0;
  return Math.max(-1, Math.min(1, severity / 3));
}

// Kept for callers/tests that want the standalone position value.
export function computeAcademicPosition(profile: EngineProfile, college: EngineCollege): number {
  return computeAcademicPositionScore(profile, college);
}

// ============================================================
// TIER CLASSIFICATION  (pure)
// ============================================================

interface Tagged {
  college: EngineCollege;
  result: EngineMatchResult;
  position: number;
  academic: AcademicDistance;
  relevance: AcademicRelevance;
}

function isElite(college: EngineCollege): boolean {
  if (college.avgGpa == null || college.satRangeMin == null) return false;
  return college.avgGpa >= ELITE_AVG_GPA && college.satRangeMin >= ELITE_SAT_MIN;
}

// A college belongs in the ambitious (Dream) bucket when it is
// academically elite AND ultra-selective (7% or lower admission), or
// when the academic realism gate flags a dramatic mismatch. A college
// where the student is merely "below the range" (but not dramatically
// so) stays in the realistic tiers. The gate is what stops a high
// overall Match Score from turning an unrealistic school into a
// "Target".
function isDreamCandidate(t: Tagged): boolean {
  const rate = t.college.acceptanceRate ?? null;
  return (
    t.academic.isAcademicMismatch ||
    (isElite(t.college) && (rate == null || rate <= 7))
  );
}

function dimensionScore(t: Tagged, dimension: string): number | null {
  const dim = t.result.dimensions.find((d) => d.dimension === dimension);
  return dim ? dim.score : null;
}

function isLikelyCandidate(t: Tagged, profile: EngineProfile): boolean {
  // The relevance pool already blocked overqualified safeties and
  // dramatic mismatches from this path.
  if (t.relevance.pool === "SAFETY" || t.relevance.pool === "AMBITIOUS") return false;

  const major = dimensionScore(t, "major");
  const financial = dimensionScore(t, "financial");
  if (major == null || major < LIKELY_MIN_MAJOR) return false;
  if (financial == null || financial < LIKELY_MIN_FINANCIAL) return false;
  if (profile.isInternationalStudent) {
    const international = dimensionScore(t, "international");
    if (international == null || international < LIKELY_MIN_INTERNATIONAL) return false;
  }

  const rate = t.college.acceptanceRate ?? null;

  // Open-admission path: an 85%+ 4-year college is a realistic Likely
  // for a weak profile (the student sits below most colleges' bars, so
  // the normal dominant-position path would never fire). Gated on the
  // student NOT being above the college's bar, so an elite student
  // cannot claim a dramatically weaker open-admission school here.
  if (
    rate != null &&
    rate >= OPEN_ADMISSION_RATE &&
    t.position <= DOMINANT_POSITION &&
    t.result.score >= LIKELY_MIN_SCORE
  ) {
    return true;
  }

  // Normal path: the student must be comfortably dominant academically.
  if (t.position <= DOMINANT_POSITION) return false;
  if (t.result.score < LIKELY_MIN_SCORE) return false;

  // Relevance caps: the college must not sit dramatically below the
  // student's own reported academic profile.
  const gpaGap = t.academic.gpa.gpaGap ?? null;
  const satGap = t.academic.sat.satGap ?? null;
  if (gpaGap != null && gpaGap > LIKELY_MAX_GPA_GAP) return false;
  if (satGap != null && satGap > LIKELY_MAX_SAT_GAP) return false;
  return true;
}

type TierBucket = ListTierKey | null;

// List sizes adapt to profile strength: a strong student gets a
// wider ambitious strategy, a weak student gets fewer ambitious
// spots and more Likely/Pathway coverage.
function defaultCountsFor(profile: EngineProfile): Record<ListTierKey, number> {
  const gpa = profile.gpa ?? 0;
  const sat = profile.sat ?? 0;
  if (gpa >= 3.5 && sat >= 1300) return { ...STRONG_COUNTS };
  if (gpa < PATHWAY_PROFILE_GPA) return { ...WEAK_COUNTS };
  return { ...AVERAGE_COUNTS };
}

// Assign a single honest tier to a college for the given profile.
// The academic-relevance layer decides the pool FIRST (relevance);
// the per-dimension fit only decides the ordering within that pool.
// A college is never shown as Target/Likely when the student is
// over- or under-qualified for it.
function classifyTier(t: Tagged, profile: EngineProfile, pathwayEnabled: boolean): TierBucket {
  if (isPathwayCollege(t.college)) {
    return pathwayEnabled ? "pathway" : null;
  }
  if (isDreamCandidate(t)) return "dream";

  const rel = t.relevance;

  // Overqualified: the student sits clearly above the college's range
  // at a demonstrably non-selective institution. Surfaced as an
  // explicit Safety tier, never as a primary Target/Likely.
  if (rel.pool === "SAFETY") return "safety";

  if (isLikelyCandidate(t, profile)) return "likely";

  // A genuine reach: below/at the bar of a highly selective school, or
  // flagged as ambitious by the relevance gate.
  if (rel.pool === "AMBITIOUS") {
    return t.result.score >= REACH_MIN_SCORE ? "reach" : null;
  }

  const position = rel.position;

  if (position === "BELOW") {
    return t.result.score >= REACH_MIN_SCORE ? "reach" : null;
  }
  if (position === "NEAR" || position === "MATCH") {
    return t.result.score >= TARGET_MIN_SCORE ? "target" : null;
  }
  // ABOVE / WELL_ABOVE but failed the likely fit checks: still a
  // realistic option, presented honestly as a Target.
  return t.result.score >= TARGET_MIN_SCORE ? "target" : null;
}

// ============================================================
// DIVERSITY-AWARE SELECTION  (pure, deterministic)
// ============================================================

interface PickContext {
  selected: Set<string>;
  seenRegions: Set<string>;
  seenSizes: Set<string>;
  seenTypes: Set<string>;
}

const REGION_BONUS = 6;
const SIZE_BONUS = 4;
const TYPE_BONUS = 4;

function pickCount(candidates: Tagged[], count: number, ctx: PickContext): Tagged[] {
  const pool = candidates
    .filter((c) => !ctx.selected.has(c.college.id))
    .map((c) => {
      const region = c.college.region ?? "?";
      const size = c.college.sizeCategory ?? "?";
      const type = c.college.type ?? "?";
      const bonus =
        (ctx.seenRegions.has(region) ? 0 : REGION_BONUS) +
        (ctx.seenSizes.has(size) ? 0 : SIZE_BONUS) +
        (ctx.seenTypes.has(type) ? 0 : TYPE_BONUS);
      return { c, bonus };
    });

  pool.sort((a, b) => {
    const sa = a.c.result.score + a.bonus;
    const sb = b.c.result.score + b.bonus;
    if (sa !== sb) return sb - sa;
    return a.c.college.name.localeCompare(b.c.college.name);
  });

  const chosen: Tagged[] = [];
  for (const { c } of pool) {
    if (chosen.length >= count) break;
    chosen.push(c);
    ctx.selected.add(c.college.id);
    if (c.college.region) ctx.seenRegions.add(c.college.region);
    if (c.college.sizeCategory) ctx.seenSizes.add(c.college.sizeCategory);
    if (c.college.type) ctx.seenTypes.add(c.college.type);
  }
  return chosen;
}

// ============================================================
// IMPROVEMENTS  (pure — reuses the Recommendation Engine)
//
// Improvements must never propose impossible leaps ("raise your GPA
// from 2.0 to 3.8"). Large gaps are framed honestly as long-term
// work; only realistic near-term targets are stated as numbers.
// ============================================================

export interface ImprovementItem {
  title: string;
  action: string;
  potentialImpact: number;
}

function fmtGpa(n: number): string {
  return n.toFixed(2);
}

function improvementAction(
  gap: GapFinding,
  profile: EngineProfile,
  college: EngineCollege,
  academic: AcademicDistance
): string {
  switch (gap.category) {
    case "TESTING":
      if (profile.sat != null && college.satRangeMin != null) {
        const satBand = academic.sat.band;
        if (satBand === "VERY_FAR_BELOW" || satBand === "FAR_BELOW") {
          return `Your SAT of ${profile.sat} is well below this college's reported range of ${college.satRangeMin}–${college.satRangeMax}. A large score jump is unlikely in the near term — prioritize colleges where your current score is competitive, and retake the SAT if time allows.`;
        }
        const realistic = Math.min(college.satRangeMin, profile.sat + 80);
        if (realistic > profile.sat) {
          return `Raise your SAT from ${profile.sat} toward ${realistic} with focused test prep.`;
        }
      }
      if (profile.act != null && college.actRangeMin != null) {
        const actBand = academic.act.band;
        if (actBand === "VERY_FAR_BELOW" || actBand === "FAR_BELOW") {
          return `Your ACT of ${profile.act} is well below this college's reported range. A large score jump is unlikely in the near term — prioritize colleges where your current score is competitive, and retake the ACT if time allows.`;
        }
        const realistic = Math.min(college.actRangeMin, profile.act + 4);
        if (realistic > profile.act) {
          return `Raise your ACT from ${profile.act} toward ${realistic} with focused test prep.`;
        }
      }
      return gap.suggestedAction;
    case "ACADEMIC":
      if (profile.gpa != null && college.avgGpa != null) {
        const gpaBand = academic.gpa.band;
        if (gpaBand === "VERY_FAR_BELOW" || gpaBand === "FAR_BELOW") {
          return `Your current GPA of ${fmtGpa(profile.gpa)} is significantly below this college's reported average of ${fmtGpa(college.avgGpa)}. Focus on strengthening your academic record, and consider adding colleges where your current profile is more competitive.`;
        }
        // Realistic near-term target based on the student's current
        // trajectory — never the full leap to the college's average.
        const realistic = Math.min(college.avgGpa, profile.gpa + 0.2);
        if (realistic > profile.gpa) {
          return `Raise your GPA from ${fmtGpa(profile.gpa)} toward ${fmtGpa(realistic)} this year, then keep building your transcript.`;
        }
      }
      return gap.suggestedAction;
    case "FINANCIAL":
      if (profile.annualBudget != null && college.estimatedTotalCost != null) {
        const diff = college.estimatedTotalCost - profile.annualBudget;
        return `Research merit scholarships and international aid to help close a cost gap of about $${diff.toLocaleString()}.`;
      }
      return gap.suggestedAction;
    case "INTERNATIONAL":
      return "Record a TOEFL or IELTS score to confirm you meet the college's English proficiency requirement.";
    default:
      return gap.suggestedAction;
  }
}

function buildImprovements(profile: EngineProfile, college: EngineCollege): ImprovementItem[] {
  const academic = computeAcademicDistance(profile, college);
  const gaps = analyzeProfileGaps(profile, [college]);
  return gaps.slice(0, 2).map((gap) => ({
    title: gap.title,
    action: improvementAction(gap, profile, college, academic),
    potentialImpact: potentialImpactForGap(profile, college, gap.mutate),
  }));
}

// ============================================================
// BALANCED LIST BUILDER  (pure, deterministic)
// ============================================================

export interface BalancedListEntry {
  college: EngineCollege;
  result: EngineMatchResult;
  position: number;
  tier: ListTierKey;
  improvements: ImprovementItem[];
  academicPositionBand: AcademicPositionBand | null;
  academicPositionLabel: string;
  academic: AcademicDistance;
  /** Coarse academic position used by the interpretation layer. */
  academicPosition: AcademicPosition | null;
  /** Selectivity band derived from the published acceptance rate. */
  selectivityBand: SelectivityBand | null;
  selectivityBandLabel: string;
  /** Which relevance pool placed this college in this tier. */
  relevancePool: RelevancePool;
  mainRisk: string;
  safetyNote?: string;
  pathwayNote?: string;
}

export interface BalancedList {
  dream: BalancedListEntry[];
  reach: BalancedListEntry[];
  target: BalancedListEntry[];
  likely: BalancedListEntry[];
  safety: BalancedListEntry[];
  pathway: BalancedListEntry[];
}

export function buildBalancedList(
  profile: EngineProfile,
  catalog: { college: EngineCollege; result: EngineMatchResult }[],
  options: ListBuilderOptions = {}
): BalancedList {
  const defaultCounts = defaultCountsFor(profile);
  const counts: Record<ListTierKey, number> = {
    dream: options.dreamCount ?? defaultCounts.dream,
    reach: options.reachCount ?? defaultCounts.reach,
    target: options.targetCount ?? defaultCounts.target,
    likely: options.likelyCount ?? defaultCounts.likely,
    safety: defaultCounts.safety,
    pathway: options.pathwayCount ?? defaultCounts.pathway,
  };

  // The Pathway tier is only relevant when the student's profile is
  // below the reported bar of most 4-year institutions. Stronger
  // profiles simply do not need a transfer pathway.
  const pathwayEnabled = (profile.gpa ?? 0) < PATHWAY_PROFILE_GPA;

  const tagged: Tagged[] = catalog.map(({ college, result }) => {
    const academic = computeAcademicDistance(profile, college);
    return {
      college,
      result,
      position: positionFromSeverity(academic.severity),
      academic,
      relevance: computeAcademicRelevance(profile, college),
    };
  });

  const ctx: PickContext = {
    selected: new Set<string>(),
    seenRegions: new Set<string>(),
    seenSizes: new Set<string>(),
    seenTypes: new Set<string>(),
  };

  // Build a diversified strategy: Dream + Reach + Target + Likely +
  // Safety (+ Pathway for weak profiles), NOT just the 12 highest
  // scores. Relevance decides membership first; fit ranks within.
  const buckets: Record<ListTierKey, Tagged[]> = {
    dream: [],
    reach: [],
    target: [],
    likely: [],
    safety: [],
    pathway: [],
  };
  for (const t of tagged) {
    const tier = classifyTier(t, profile, pathwayEnabled);
    if (tier) buckets[tier].push(t);
  }

  const dream = pickCount(buckets.dream, counts.dream, ctx);
  const likely = pickCount(buckets.likely, counts.likely, ctx);
  const target = pickCount(buckets.target, counts.target, ctx);
  const reach = pickCount(buckets.reach, counts.reach, ctx);
  const safety = pickCount(buckets.safety, counts.safety, ctx);
  const pathway = pickCount(buckets.pathway, counts.pathway, ctx);

  const asEntries = (list: Tagged[], tier: ListTierKey): BalancedListEntry[] =>
    list.map((t) => ({
      college: t.college,
      result: t.result,
      position: t.position,
      tier,
      improvements: buildImprovements(profile, t.college),
      academicPositionBand: t.academic.combinedBand,
      academicPositionLabel: tier === "pathway" ? "Community College / Transfer Pathway" : t.academic.combinedLabel,
      academic: t.academic,
      academicPosition: t.relevance.position,
      selectivityBand: t.relevance.selectivityBand,
      selectivityBandLabel: t.relevance.selectivityBand
        ? SELECTIVITY_BAND_LABELS[t.relevance.selectivityBand]
        : "Unknown",
      relevancePool: t.relevance.pool,
      mainRisk: tier === "pathway" ? pathwayMainRisk(t.college) : mainRiskFor(t.academic, t.college),
      safetyNote: tier === "safety" ? safetyNote(t.college) : undefined,
      pathwayNote: tier === "pathway" ? pathwayTransferNote(t.college) : undefined,
    }));

  return {
    dream: asEntries(dream, "dream"),
    reach: asEntries(reach, "reach"),
    target: asEntries(target, "target"),
    likely: asEntries(likely, "likely"),
    safety: asEntries(safety, "safety"),
    pathway: asEntries(pathway, "pathway"),
  };
}

// ============================================================
// MAIN RISK  (the interpretation layer's honest caveat)
// ============================================================

function mainRiskFor(academic: AcademicDistance, college: EngineCollege): string {
  if (academic.isAcademicMismatch) {
    return "Your current academic profile is significantly below this college's reported range.";
  }
  const rate = college.acceptanceRate ?? null;
  if (rate != null && rate <= 25) {
    return `Admission is ${selectivityLabel(rate)} and depends on the full applicant pool, even with a strong fit.`;
  }
  if (academic.combinedBand === "NEAR_RANGE" || academic.combinedBand === "BELOW_RANGE") {
    return "Your academic profile is at the lower edge of this college's reported range.";
  }
  return "Admission depends on the full applicant pool and is never assured by a fit score.";
}

// Safety messaging: an overqualified college is presented honestly as
// a separate safety option — never as a primary Target/Likely, and
// never as a guarantee.
function safetyNote(college: EngineCollege): string {
  return `Your academic profile is significantly above ${college.name}'s typical range. We include it as a safety option rather than a primary Target.`;
}

// Pathway messaging: community college is framed as a legitimate,
// strategic step toward a 4-year degree — never a dead end or a
// punishment for a weak profile.
function pathwayTransferNote(college: EngineCollege): string {
  return `${college.name} is a community college. It can be a smart strategic pathway: build a strong academic record here, then transfer into a 4-year university — many have transfer agreements that count your credits toward a bachelor's degree.`;
}

function pathwayMainRisk(college: EngineCollege): string {
  return "Community colleges use open admissions (no SAT or minimum GPA required). Success depends on completing the program with strong grades so you can transfer.";
}

// ============================================================
// VIEW + ORCHESTRATION  (loads the live profile + catalog)
// ============================================================

export interface BalancedCollegeListItem {
  college: College;
  matchScore: number;
  classification: MatchClassification;
  classificationLabel: "Dream" | "Reach" | "Target" | "Likely" | "Safety" | "Pathway";
  engineVersion: string;
  saved: boolean;
  reasons: string[];
  improvements: ImprovementItem[];
  academicPositionBand: AcademicPositionBand | null;
  academicPositionLabel: string;
  academicReality: AcademicDistance;
  academicPosition: AcademicPosition | null;
  selectivityBand: SelectivityBand | null;
  selectivityBandLabel: string;
  mainRisk: string;
  safetyNote?: string;
  pathwayNote?: string;
}

export interface BalancedCollegeListView {
  dream: BalancedCollegeListItem[];
  reach: BalancedCollegeListItem[];
  target: BalancedCollegeListItem[];
  likely: BalancedCollegeListItem[];
  safety: BalancedCollegeListItem[];
  pathway: BalancedCollegeListItem[];
  totals: Record<ListTierKey, number>;
  total: number;
  engineVersion: string;
}

export async function getBalancedCollegeList(
  options: ListBuilderOptions = {}
): Promise<BalancedCollegeListView> {
  const profile = await getStudentProfile();
  if (!profile) return emptyView();

  let intendedMajorCategory: string | null = null;
  if (profile.intendedMajor) {
    const major = await prisma.major.findUnique({ where: { name: profile.intendedMajor } });
    intendedMajorCategory = major?.category ?? null;
  }
  const engineProfile = profileToEngineProfile(profile, intendedMajorCategory);

  const colleges = await prisma.college.findMany({ include: collegeInclude });
  const byId = new Map(colleges.map((c) => [c.id, c]));
  const catalog = colleges.map((c) => {
    const ec = collegeToEngineCollege(c as CollegeWithRelations);
    return {
      college: ec,
      result: computeMatch(engineProfile, ec),
    };
  });

  const list = buildBalancedList(engineProfile, catalog, options);

  // The saved set is fetched once so every result card can render its
  // Saved state without a per-college database request.
  const savedIds = new Set(await getSavedCollegeIds());

  const toItem = (entry: BalancedListEntry): BalancedCollegeListItem => {
    const reasons = [...new Set(entry.result.dimensions.flatMap((d) => d.reasons))].slice(0, 3);
    const prismaCollege = byId.get(entry.college.id);
    if (!prismaCollege) throw new Error(`Missing college catalog row for ${entry.college.id}`);
    const selectivityNote =
      !entry.academic.isAcademicMismatch && entry.tier === "dream"
        ? selectivityAdmissionMessage(entry.college.acceptanceRate ?? null)
        : null;
    return {
      college: mapCollegeToUI(prismaCollege),
      matchScore: entry.result.score,
      classification: entry.result.classification,
      classificationLabel: TIER_LABELS[entry.tier],
      engineVersion: entry.result.engineVersion,
      saved: savedIds.has(entry.college.id),
      reasons: reasons.length > 0 ? reasons : ["Several aspects of your profile align with this college."],
      improvements: entry.improvements,
      academicPositionBand: entry.academicPositionBand,
      academicPositionLabel: entry.academicPositionLabel,
      academicReality: entry.academic,
      academicPosition: entry.academicPosition,
      selectivityBand: entry.selectivityBand,
      selectivityBandLabel: entry.selectivityBandLabel,
      mainRisk: selectivityNote ?? entry.mainRisk,
      safetyNote: entry.safetyNote,
      pathwayNote: entry.pathwayNote,
    };
  };

  const view: BalancedCollegeListView = {
    dream: list.dream.map(toItem),
    reach: list.reach.map(toItem),
    target: list.target.map(toItem),
    likely: list.likely.map(toItem),
    safety: list.safety.map(toItem),
    pathway: list.pathway.map(toItem),
    totals: {
      dream: list.dream.length,
      reach: list.reach.length,
      target: list.target.length,
      likely: list.likely.length,
      safety: list.safety.length,
      pathway: list.pathway.length,
    },
    total:
      list.dream.length +
      list.reach.length +
      list.target.length +
      list.likely.length +
      list.safety.length +
      list.pathway.length,
    engineVersion: list.dream[0]?.result.engineVersion ?? "collegia-match-v1",
  };

  return view;
}

function emptyView(): BalancedCollegeListView {
  return {
    dream: [],
    reach: [],
    target: [],
    likely: [],
    safety: [],
    pathway: [],
    totals: { dream: 0, reach: 0, target: 0, likely: 0, safety: 0, pathway: 0 },
    total: 0,
    engineVersion: "collegia-match-v1",
  };
}

export type { MatchClassification };