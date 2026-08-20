// ============================================================
// COLLEGIA — COLLEGE LIST ANALYSIS
//
// Analyzes the balance of the student's saved college list by
// classification (Strong Match / Target / Reach). These describe
// profile FIT, not admission outcomes. "Safe school" language is
// never used.
// ============================================================

import { prisma } from "@/lib/db/prisma";
import { getCurrentUserId } from "@/lib/auth/current-user";
import type { MatchClassification } from "@prisma/client";

export interface CollegeListCounts {
  strongMatch: number;
  target: number;
  reach: number;
  total: number;
}

export interface CollegeListAnalysis {
  counts: CollegeListCounts;
  balance: "empty" | "balanced" | "reach_heavy" | "mixed";
  message: string;
}

export async function analyzeCollegeList(): Promise<CollegeListAnalysis> {
  const userId = await getCurrentUserId();

  // MatchScore is the authoritative source for classification.
  const scores = await prisma.matchScore.findMany({
    where: { userId },
    select: { classification: true },
  });

  const counts: CollegeListCounts = {
    strongMatch: 0,
    target: 0,
    reach: 0,
    total: scores.length,
  };
  for (const s of scores) {
    if (s.classification === "STRONG_MATCH") counts.strongMatch += 1;
    else if (s.classification === "TARGET") counts.target += 1;
    else counts.reach += 1;
  }

  const { strongMatch: s, target: t, reach: r, total } = counts;

  if (total === 0) {
    return {
      counts,
      balance: "empty",
      message: "Add colleges to your list to see your match balance.",
    };
  }

  if (r >= total * 0.5 && r >= 2) {
    return {
      counts,
      balance: "reach_heavy",
      message: "Your list is heavily concentrated in Reach colleges. Consider adding more Strong Match colleges.",
    };
  }

  if (s >= r || (s > 0 && t > 0)) {
    return {
      counts,
      balance: "balanced",
      message: "Your list has a balanced mix of colleges.",
    };
  }

  return {
    counts,
    balance: "mixed",
    message: "Your list contains a mix of colleges. Consider adding more Strong Match colleges.",
  };
}

export type { MatchClassification };