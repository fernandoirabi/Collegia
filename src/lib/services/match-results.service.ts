// ============================================================
// COLLEGIA — MATCH RESULTS
//
// Ranks the real college catalog with the deterministic Match
// Engine using the student's live profile. The Engine is the
// source of truth: same profile + catalog => same ranking, and
// the ranking changes whenever the profile changes.
// ============================================================

import { prisma } from "@/lib/db/prisma";
import { getStudentProfile } from "@/lib/services/profile.service";
import { collegeInclude, mapCollegeToUI, type CollegeWithRelations } from "@/lib/services/college.service";
import {
  collegeToEngineCollege,
  computeMatch,
  profileToEngineProfile,
} from "@/lib/services/match.engine";
import { matchLabelForClassification } from "@/lib/services/match.service";
import type { College } from "@/types";
import type { MatchClassification } from "@prisma/client";

export interface MatchResultItem {
  college: College;
  matchScore: number;
  classification: MatchClassification;
  classificationLabel: "Strong Match" | "Target" | "Reach";
  engineVersion: string;
  reasons: string[];
}

export async function getMatchResults(limit = 12): Promise<MatchResultItem[]> {
  const profile = await getStudentProfile();
  if (!profile) return [];

  let intendedMajorCategory: string | null = null;
  if (profile.intendedMajor) {
    const major = await prisma.major.findUnique({ where: { name: profile.intendedMajor } });
    intendedMajorCategory = major?.category ?? null;
  }
  const engineProfile = profileToEngineProfile(profile, intendedMajorCategory);

  const colleges = await prisma.college.findMany({ include: collegeInclude });

  const items: MatchResultItem[] = colleges.map((c) => {
    const result = computeMatch(engineProfile, collegeToEngineCollege(c as CollegeWithRelations));
    const reasons = [...new Set(result.dimensions.flatMap((d) => d.reasons))].slice(0, 4);
    return {
      college: mapCollegeToUI(c as CollegeWithRelations),
      matchScore: result.score,
      classification: result.classification,
      classificationLabel: matchLabelForClassification(result.classification),
      engineVersion: result.engineVersion,
      reasons:
        reasons.length > 0 ? reasons : ["Several aspects of your profile align with this college."],
    };
  });

  items.sort(
    (a, b) => b.matchScore - a.matchScore || a.college.name.localeCompare(b.college.name)
  );

  return items.slice(0, limit);
}