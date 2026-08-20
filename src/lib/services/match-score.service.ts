// ============================================================
// COLLEGIA MATCH — PERSISTENCE SERVICE
//
// Computes a match with the deterministic engine and persists:
//   - MatchScore          (current result, authoritative)
//   - MatchDimensionScore (per-dimension breakdown + reasons)
//   - MatchHistory        (snapshot only when the score changes)
//   - SavedCollege        (kept in sync: matchScore + classification)
//
// All writes for one college happen in a single transaction so the
// persisted values never silently diverge.
// ============================================================

import { prisma } from "@/lib/db/prisma";
import { getCurrentUserId } from "@/lib/auth/current-user";
import { getStudentProfile } from "@/lib/services/profile.service";
import { collegeInclude, type CollegeWithRelations } from "@/lib/services/college.service";
import {
  collegeToEngineCollege,
  computeMatch,
  MATCH_ENGINE_VERSION,
  profileToEngineProfile,
  type EngineMatchResult,
} from "@/lib/services/match.engine";
import { matchLabelForClassification } from "@/lib/services/match.service";
import type { MatchClassification } from "@prisma/client";

export type MatchConfidenceValue = "HIGH" | "MEDIUM" | "LIMITED";

export interface MatchDimensionView {
  dimension: string;
  label: string;
  score: number;
  confidence: MatchConfidenceValue;
  reasons: string[];
}

export interface MatchView {
  collegeId: string;
  collegeName: string;
  score: number;
  classification: MatchClassification;
  classificationLabel: string;
  engineVersion: string;
  isDemo: boolean;
  saved: boolean;
  dimensions: MatchDimensionView[];
}

function toDimensionViews(result: EngineMatchResult): MatchDimensionView[] {
  return result.dimensions.map((d) => ({
    dimension: d.dimension,
    label: d.label,
    score: d.score,
    confidence: d.confidence,
    reasons: d.reasons,
  }));
}

async function loadEngineInputs(collegeId: string) {
  const [profile, college] = await Promise.all([
    getStudentProfile(),
    prisma.college.findUnique({ where: { id: collegeId }, include: collegeInclude }),
  ]);
  if (!profile || !college) return null;

  let intendedMajorCategory: string | null = null;
  if (profile.intendedMajor) {
    const major = await prisma.major.findUnique({ where: { name: profile.intendedMajor } });
    intendedMajorCategory = major?.category ?? null;
  }

  return {
    engineProfile: profileToEngineProfile(profile, intendedMajorCategory),
    college: college as CollegeWithRelations,
  };
}

/**
 * Compute the match for one college using the current profile.
 * Does not persist anything.
 */
export async function computeMatchResult(collegeId: string): Promise<EngineMatchResult | null> {
  const inputs = await loadEngineInputs(collegeId);
  if (!inputs) return null;
  return computeMatch(inputs.engineProfile, collegeToEngineCollege(inputs.college));
}

/**
 * Compute and persist the match for one college. Returns the result
 * and whether the score changed (a history snapshot was created).
 */
export async function computeAndPersistMatch(
  userId: string,
  collegeId: string
): Promise<{ result: EngineMatchResult; changed: boolean } | null> {
  const inputs = await loadEngineInputs(collegeId);
  if (!inputs) return null;

  const result = computeMatch(inputs.engineProfile, collegeToEngineCollege(inputs.college));
  const isDemo = inputs.college.isDemoData;

  const changed = await prisma.$transaction(async (tx) => {
    const existing = await tx.matchScore.findUnique({
      where: { userId_collegeId: { userId, collegeId } },
      select: { matchScore: true, classification: true },
    });

    const isChange =
      !existing || existing.matchScore !== result.score || existing.classification !== result.classification;

    const matchScoreRow = await tx.matchScore.upsert({
      where: { userId_collegeId: { userId, collegeId } },
      update: {
        matchScore: result.score,
        classification: result.classification,
        engineVersion: result.engineVersion,
        isDemo,
        computedAt: new Date(),
      },
      create: {
        userId,
        collegeId,
        matchScore: result.score,
        classification: result.classification,
        engineVersion: result.engineVersion,
        isDemo,
      },
    });

    await tx.matchDimensionScore.deleteMany({ where: { matchScoreId: matchScoreRow.id } });
    await tx.matchDimensionScore.createMany({
      data: result.dimensions.map((d) => ({
        matchScoreId: matchScoreRow.id,
        dimension: d.dimension,
        label: d.label,
        score: d.score,
        confidence: d.confidence,
        reasons: d.reasons,
      })),
    });

    if (isChange) {
      await tx.matchHistory.create({
        data: {
          userId,
          collegeId,
          matchScore: result.score,
          classification: result.classification,
          engineVersion: result.engineVersion,
          isDemo,
        },
      });
    }

    const saved = await tx.savedCollege.findUnique({
      where: { userId_collegeId: { userId, collegeId } },
      select: { id: true },
    });
    if (saved) {
      await tx.savedCollege.update({
        where: { userId_collegeId: { userId, collegeId } },
        data: { matchScore: result.score, matchClassification: result.classification },
      });
    }

    return isChange;
  });

  return { result, changed };
}

/**
 * Recalculate matches for every saved college. Returns the number of
 * colleges whose score actually changed (new history snapshots).
 */
export async function recomputeSavedColleges(): Promise<number> {
  const userId = await getCurrentUserId();
  const saved = await prisma.savedCollege.findMany({
    where: { userId },
    select: { collegeId: true },
  });

  let changedCount = 0;
  for (const row of saved) {
    const res = await computeAndPersistMatch(userId, row.collegeId);
    if (res?.changed) changedCount += 1;
  }
  return changedCount;
}

export async function getMatchScore(userId: string, collegeId: string) {
  return prisma.matchScore.findUnique({
    where: { userId_collegeId: { userId, collegeId } },
    include: { dimensions: true },
  });
}

/**
 * UI-facing view for the college profile page. Computed live with the
 * deterministic engine (nothing is persisted unless the college is
 * saved — saving is what persists).
 */
export async function getMatchView(collegeId: string): Promise<MatchView | null> {
  const userId = await getCurrentUserId();
  const inputs = await loadEngineInputs(collegeId);
  if (!inputs) return null;

  const result = computeMatch(inputs.engineProfile, collegeToEngineCollege(inputs.college));

  const savedRow = await prisma.savedCollege.findUnique({
    where: { userId_collegeId: { userId, collegeId } },
    select: { id: true },
  });

  return {
    collegeId,
    collegeName: inputs.college.name,
    score: result.score,
    classification: result.classification,
    classificationLabel: matchLabelForClassification(result.classification),
    engineVersion: result.engineVersion,
    isDemo: inputs.college.isDemoData,
    saved: Boolean(savedRow),
    dimensions: toDimensionViews(result),
  };
}

/**
 * The persisted current match scores for a user (used by the saved
 * college list as the authoritative source).
 */
export async function getMatchScoresForUser(userId: string) {
  return prisma.matchScore.findMany({
    where: { userId },
    include: { dimensions: true },
  });
}

/**
 * The recorded history snapshots for a college, oldest first.
 * A snapshot is only created when the score or classification
 * actually changes (see computeAndPersistMatch).
 */
export async function getMatchHistory(collegeId: string) {
  const userId = await getCurrentUserId();
  return prisma.matchHistory.findMany({
    where: { userId, collegeId },
    orderBy: { computedAt: "asc" },
  });
}

export { MATCH_ENGINE_VERSION };