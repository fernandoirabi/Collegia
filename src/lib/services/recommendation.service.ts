// ============================================================
// COLLEGIA — RECOMMENDATION ENGINE
//
// Identifies meaningful, data-driven improvement opportunities by
// comparing the student profile against their saved colleges, then
// ESTIMATES the potential Collegia Match impact by re-running the
// deterministic engine with the proposed improvement.
//
// potentialImpact = simulatedMatchScore - currentMatchScore.
// It is an estimate under the current scoring model, NOT a promise.
// ============================================================

import { prisma } from "@/lib/db/prisma";
import { getCurrentUserId } from "@/lib/auth/current-user";
import { getStudentProfile } from "@/lib/services/profile.service";
import { collegeInclude, type CollegeWithRelations } from "@/lib/services/college.service";
import {
  collegeToEngineCollege,
  computeMatch,
  profileToEngineProfile,
  type EngineCollege,
  type EngineProfile,
} from "@/lib/services/match.engine";
import type { RecommendationCategory, RecommendationStatus } from "@prisma/client";

export interface GapFinding {
  category: RecommendationCategory;
  title: string;
  description: string;
  suggestedAction: string;
  collegeId: string | null;
  /** Applies the proposed improvement to a profile copy (used to simulate impact). */
  mutate: (p: EngineProfile) => EngineProfile;
}

// ============================================================
// PURE GAP ANALYSIS  (no I/O — unit-testable)
// ============================================================

export function findTestingGap(profile: EngineProfile, colleges: EngineCollege[]): GapFinding | null {
  for (const c of colleges) {
    if (profile.sat != null && c.satRangeMin != null && profile.sat < c.satRangeMin) {
      const target = Math.min(c.satRangeMin, profile.sat + 80);
      if (target <= profile.sat) continue;
      const largeGap = profile.sat < c.satRangeMin - 140;
      return {
        category: "TESTING",
        title: "Improve SAT score",
        description: `Your SAT is below the reported range at ${c.name}.`,
        suggestedAction: largeGap
          ? `Your SAT of ${profile.sat} is well below ${c.name}'s reported range — a large jump is unlikely in the near term. Prioritize colleges where your current score is competitive, and retake the SAT if time allows.`
          : `Focus on test prep (Math and Reading) to move your SAT toward ${target}.`,
        collegeId: c.id,
        mutate: (p) => ({ ...p, sat: target }),
      };
    }
    if (profile.act != null && c.actRangeMin != null && profile.act < c.actRangeMin) {
      const target = Math.min(c.actRangeMin, profile.act + 4);
      if (target <= profile.act) continue;
      const largeGap = profile.act < c.actRangeMin - 4;
      return {
        category: "TESTING",
        title: "Improve ACT score",
        description: `Your ACT is below the reported range at ${c.name}.`,
        suggestedAction: largeGap
          ? `Your ACT of ${profile.act} is well below ${c.name}'s reported range — a large jump is unlikely in the near term. Prioritize colleges where your current score is competitive, and retake the ACT if time allows.`
          : `Focus on test prep to move your ACT toward ${target}.`,
        collegeId: c.id,
        mutate: (p) => ({ ...p, act: target }),
      };
    }
  }
  return null;
}

export function findAcademicGap(profile: EngineProfile, colleges: EngineCollege[]): GapFinding | null {
  if (profile.gpa == null) return null;
  for (const c of colleges) {
    if (c.avgGpa == null) continue;
    const below = c.avgGpa - profile.gpa;
    if (below > 0.09) {
      // Simulate a meaningful, realistic improvement toward the
      // college's typical GPA — never the full leap.
      const target = Math.min(c.avgGpa, profile.gpa + 0.4);
      if (target <= profile.gpa) continue;
      const nearTermTarget = Math.min(c.avgGpa, profile.gpa + 0.2);
      return {
        category: "ACADEMIC",
        title: "Strengthen GPA",
        description: `Your GPA is below the typical average at ${c.name}.`,
        suggestedAction:
          below > 0.5
            ? `Your GPA of ${profile.gpa.toFixed(2)} is well below ${c.name}'s typical average of ${c.avgGpa.toFixed(2)}. Focus on strengthening your academic record, and consider adding colleges where your current profile is more competitive.`
            : `Raise your GPA toward ${nearTermTarget.toFixed(2)} this year with consistent effort in core classes.`,
        collegeId: c.id,
        mutate: (p) => ({ ...p, gpa: target }),
      };
    }
  }
  return null;
}

export function findFinancialGap(profile: EngineProfile, colleges: EngineCollege[]): GapFinding | null {
  if (profile.annualBudget == null) return null;
  for (const c of colleges) {
    if (c.estimatedTotalCost == null) continue;
    if (c.estimatedTotalCost > profile.annualBudget) {
      return {
        category: "FINANCIAL",
        title: "Research financial aid",
        description: `Your budget is below the estimated cost at ${c.name}.`,
        suggestedAction: "Research international merit scholarships, need-based aid, and colleges with stronger financial fit.",
        collegeId: c.id,
        mutate: (p) => ({ ...p, annualBudget: c.estimatedTotalCost }),
      };
    }
  }
  return null;
}

export function findInternationalGap(profile: EngineProfile, colleges: EngineCollege[]): GapFinding | null {
  if (!profile.isInternationalStudent) return null;
  for (const c of colleges) {
    const hasEnglishRequirement = c.toeflMinimum != null || c.ieltsMinimum != null;
    if (hasEnglishRequirement && profile.englishProficiencyScore == null && profile.ieltsScore == null) {
      const target = c.toeflMinimum ?? c.ieltsMinimum ?? null;
      if (target == null) continue;
      return {
        category: "INTERNATIONAL",
        title: "Prepare English proficiency",
        description: `${c.name} publishes an English proficiency requirement and you have not recorded a test score.`,
        suggestedAction: "Prepare for and record your TOEFL or IELTS result to confirm you meet the requirement.",
        collegeId: c.id,
        mutate: (p) => ({ ...p, englishProficiencyScore: Math.round(target) }),
      };
    }
  }
  return null;
}

/**
 * Runs all gap finders and returns the first meaningful gap in
 * priority order: academic, testing, financial, international.
 */
export function analyzeProfileGaps(profile: EngineProfile, colleges: EngineCollege[]): GapFinding[] {
  const gaps: GapFinding[] = [];
  const push = (g: GapFinding | null) => {
    if (g) gaps.push(g);
  };
  push(findAcademicGap(profile, colleges));
  push(findTestingGap(profile, colleges));
  push(findFinancialGap(profile, colleges));
  push(findInternationalGap(profile, colleges));
  return gaps;
}

// ============================================================
// POTENTIAL IMPACT SIMULATION  (pure)
// ============================================================

export function potentialImpactForGap(
  profile: EngineProfile,
  college: EngineCollege,
  mutate: (p: EngineProfile) => EngineProfile
): number {
  const current = computeMatch(profile, college).score;
  const simulated = computeMatch(mutate(profile), college).score;
  return Math.max(0, simulated - current);
}

// ============================================================
// PERSISTENCE / ORCHESTRATION
// ============================================================

export interface RecommendationView {
  id: string;
  category: RecommendationCategory;
  title: string;
  description: string | null;
  suggestedAction: string | null;
  potentialImpact: number | null;
  status: string;
  collegeName: string | null;
  createdAt: Date;
}

export async function generateRecommendations(): Promise<RecommendationView[]> {
  const userId = await getCurrentUserId();
  const profile = await getStudentProfile();
  if (!profile) return [];

  const savedRows = await prisma.savedCollege.findMany({
    where: { userId },
    include: { college: { include: collegeInclude } },
  });
  const colleges = savedRows
    .map((r) => r.college)
    .filter((c): c is CollegeWithRelations => Boolean(c))
    .map((c) => collegeToEngineCollege(c as CollegeWithRelations));

  if (colleges.length === 0) return [];

  let intendedMajorCategory: string | null = null;
  if (profile.intendedMajor) {
    const major = await prisma.major.findUnique({ where: { name: profile.intendedMajor } });
    intendedMajorCategory = major?.category ?? null;
  }
  const engineProfile = profileToEngineProfile(profile, intendedMajorCategory);

  const gaps = analyzeProfileGaps(engineProfile, colleges);
  const views: RecommendationView[] = [];

  for (const gap of gaps) {
    const college = colleges.find((c) => c.id === gap.collegeId);
    if (!college) continue;
    const impact = potentialImpactForGap(engineProfile, college, gap.mutate);

    const collegeName = college.name;
    const existing = await prisma.recommendation.findFirst({
      where: { userId, title: gap.title },
    });

    // Respect existing recommendation status: a DONE/DISMISSED
    // recommendation is never silently reopened or duplicated.
    if (existing && existing.status !== "OPEN") continue;

    const data = {
      category: gap.category,
      title: gap.title,
      description: gap.description,
      suggestedAction: gap.suggestedAction,
      potentialImpact: impact,
      status: "OPEN" as const,
      source: "improvement-engine",
      collegeId: gap.collegeId,
    };

    const row = existing
      ? await prisma.recommendation.update({ where: { id: existing.id }, data })
      : await prisma.recommendation.create({ data: { userId, ...data } });

    views.push({
      id: row.id,
      category: row.category,
      title: row.title,
      description: row.description,
      suggestedAction: row.suggestedAction,
      potentialImpact: row.potentialImpact,
      status: row.status,
      collegeName,
      createdAt: row.createdAt,
    });
  }

  return views;
}

export async function getRecommendations(): Promise<RecommendationView[]> {
  const userId = await getCurrentUserId();
  const rows = await prisma.recommendation.findMany({
    where: { userId, status: "OPEN" },
    include: { college: { select: { name: true } } },
    orderBy: [{ potentialImpact: "desc" }, { createdAt: "asc" }],
  });
  return rows.map((r) => ({
    id: r.id,
    category: r.category,
    title: r.title,
    description: r.description,
    suggestedAction: r.suggestedAction,
    potentialImpact: r.potentialImpact,
    status: r.status,
    collegeName: r.college?.name ?? null,
    createdAt: r.createdAt,
  }));
}

/**
 * Mark a recommendation DONE or DISMISSED. The recommendation engine
 * never reopens or duplicates a recommendation in a terminal state.
 */
export async function updateRecommendationStatus(
  id: string,
  status: RecommendationStatus
): Promise<boolean> {
  const userId = await getCurrentUserId();
  const existing = await prisma.recommendation.findFirst({ where: { id, userId } });
  if (!existing) return false;
  await prisma.recommendation.update({
    where: { id },
    data: { status },
  });
  return true;
}

/**
 * Compute college-specific recommendations for a single college
 * (used on the college profile page). Pure, deterministic.
 */
export async function getRecommendationsForCollege(
  collegeId: string
): Promise<
  { category: RecommendationCategory; title: string; description: string; suggestedAction: string; potentialImpact: number }[]
> {
  const profile = await getStudentProfile();
  if (!profile) return [];

  const college = await prisma.college.findUnique({ where: { id: collegeId }, include: collegeInclude });
  if (!college) return [];

  let intendedMajorCategory: string | null = null;
  if (profile.intendedMajor) {
    const major = await prisma.major.findUnique({ where: { name: profile.intendedMajor } });
    intendedMajorCategory = major?.category ?? null;
  }
  const engineProfile = profileToEngineProfile(profile, intendedMajorCategory);
  const engineCollege = collegeToEngineCollege(college as CollegeWithRelations);

  const gaps = analyzeProfileGaps(engineProfile, [engineCollege]);
  return gaps.map((gap) => ({
    category: gap.category,
    title: gap.title,
    description: gap.description,
    suggestedAction: gap.suggestedAction,
    potentialImpact: potentialImpactForGap(engineProfile, engineCollege, gap.mutate),
  }));
}