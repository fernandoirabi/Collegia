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
// BEFORE any personal-fit ranking: the institution's data-driven
// selectivity band is combined with the student's academic position
// into one honest ambition tier, and fit only decides the ORDERING
// within that tier. A dramatically weaker school is moved into the
// explicit Safety tier (or dropped); a dramatically harder school is
// moved into Dream/Reach even when its fit score is high. The frozen
// Match Engine is untouched.
//
// Tiers:
//   Dream    — a genuine stretch: top-elite institutions (ultra-low
//              acceptance + elite academic bar), or institutions the
//              student sits far below the bar of.
//   Reach    — possible but difficult: very highly selective
//              institutions, or institutions where the student sits
//              below the published bar.
//   Target   — realistic academic range: the student sits at or near
//              the college's reported bar and admission is competitive.
//   Likely   — comfortable: the student sits above a selective or
//              accessible institution's reported bar.
//   Safety   — an explicit, separated tier for colleges where the
//              student's academics are clearly ABOVE the reported bar
//              of a moderate/accessible institution. It is never
//              mixed into the primary Target/Likely tiers.
//   Pathway  — community college / 2-year options, surfaced when
//              the student's profile is below the normal range of
//              most 4-year institutions, framed as a legitimate
//              transfer pathway (not a punishment).
//
// The tier is academic only. Preferences (major, budget, region,
// etc.) never change a tier — they only re-order the colleges within
// an already-assigned tier.
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
  type AcademicDistance,
  type AcademicPositionBand,
} from "@/lib/services/academic-distance.service";
import {
  computeAcademicRelevance,
  isPathwayCollege,
  explainTier,
  INSTITUTIONAL_BAND_LABELS,
  type AcademicPosition,
  type AcademicRelevance,
  type RelevancePool,
  type InstitutionalSelectivityBand,
  type AmbitionTier,
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
// The academic-relevance layer decides the tier FIRST (the decision
// matrix); the per-dimension fit only decides the ordering within
// that tier. A college is never shown as Target/Likely when the
// student is over- or under-qualified for it.
function classifyTier(t: Tagged, pathwayEnabled: boolean): TierBucket {
  if (isPathwayCollege(t.college)) {
    return pathwayEnabled ? "pathway" : null;
  }
  return t.relevance.tier;
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
  /** Institutional selectivity band derived from published data. */
  institutionalBand: InstitutionalSelectivityBand | null;
  institutionalBandLabel: string;
  institutionalIndex: number;
  /** Which ambition tier placed this college here. */
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
    const tier = classifyTier(t, pathwayEnabled);
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
      institutionalBand: t.relevance.institutionalBand,
      institutionalBandLabel: t.relevance.institutionalBandLabel,
      institutionalIndex: t.relevance.institutionalIndex,
      relevancePool: t.relevance.pool,
      mainRisk: tier === "pathway" ? pathwayMainRisk(t.college) : explainTier(profile, t.college, t.relevance),
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
// SAFETY / PATHWAY MESSAGING
// ============================================================

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
  institutionalBand: InstitutionalSelectivityBand | null;
  institutionalBandLabel: string;
  institutionalIndex: number;
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
      institutionalBand: entry.institutionalBand,
      institutionalBandLabel: entry.institutionalBandLabel,
      institutionalIndex: entry.institutionalIndex,
      mainRisk: entry.mainRisk,
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