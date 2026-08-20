import { prisma } from "@/lib/db/prisma";
import { getCurrentUserId } from "@/lib/auth/current-user";
import { getCollegeById, mapCollegeToUI } from "@/lib/services/college.service";
import { computeAndPersistMatch, type MatchDimensionView } from "@/lib/services/match-score.service";
import type { College } from "@/types";
import type { MatchClassification } from "@prisma/client";

export interface SavedCollegeView {
  college: College;
  matchClassification: MatchClassification | null;
  matchScore: number | null;
  matchDimensions: MatchDimensionView[] | null;
  savedAt: Date;
}

export async function getSavedColleges(): Promise<SavedCollegeView[]> {
  const userId = await getCurrentUserId();

  const [rows, matchScores] = await Promise.all([
    prisma.savedCollege.findMany({
      where: { userId },
      orderBy: { savedAt: "desc" },
      include: {
        college: {
          include: {
            majors: {
              select: {
                strength: true,
                isStrongProgram: true,
                major: { select: { name: true, category: true } },
              },
            },
            deadlines: { select: { plan: true, deadlineDescription: true, date: true } },
          },
        },
      },
    }),
    prisma.matchScore.findMany({
      where: { userId },
      include: { dimensions: true },
    }),
  ]);

  const scoreByCollege = new Map(matchScores.map((ms) => [ms.collegeId, ms]));

  return rows.map((row) => {
    const ms = scoreByCollege.get(row.collegeId);
    return {
      college: mapCollegeToUI(row.college),
      matchClassification: ms?.classification ?? row.matchClassification,
      matchScore: ms?.matchScore ?? row.matchScore,
      matchDimensions: ms
        ? ms.dimensions.map((d) => ({
            dimension: d.dimension,
            label: d.label,
            score: d.score,
            confidence: d.confidence,
            reasons: d.reasons,
          }))
        : null,
      savedAt: row.savedAt,
    };
  });
}

export async function getSavedCollegeIds(): Promise<string[]> {
  const userId = await getCurrentUserId();
  const rows = await prisma.savedCollege.findMany({
    where: { userId },
    select: { collegeId: true },
  });
  return rows.map((r) => r.collegeId);
}

export async function isCollegeSaved(collegeId: string): Promise<boolean> {
  const userId = await getCurrentUserId();
  const row = await prisma.savedCollege.findUnique({
    where: { userId_collegeId: { userId, collegeId } },
    select: { id: true },
  });
  return Boolean(row);
}

export async function saveCollege(collegeId: string): Promise<void> {
  const userId = await getCurrentUserId();
  const college = await getCollegeById(collegeId);
  if (!college) {
    throw new Error("COLLEGE_NOT_FOUND");
  }

  await prisma.savedCollege.upsert({
    where: { userId_collegeId: { userId, collegeId } },
    update: {},
    create: { userId, collegeId },
  });

  await computeAndPersistMatch(userId, collegeId);
}

export async function removeSavedCollege(collegeId: string): Promise<void> {
  const userId = await getCurrentUserId();
  await prisma.savedCollege.deleteMany({
    where: { userId, collegeId },
  });
}

export async function countSavedColleges(): Promise<number> {
  const userId = await getCurrentUserId();
  return prisma.savedCollege.count({ where: { userId } });
}