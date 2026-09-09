"use server";

import { getMatchResults } from "@/lib/services/match-results.service";
import {
  getBalancedCollegeList,
  MatchValidationError,
} from "@/lib/services/college-list-builder.service";

export async function getMatchResultsAction(limit = 12) {
  try {
    const data = await getMatchResults(limit);
    return { ok: true, data } as const;
  } catch {
    return { ok: false, error: "Unable to compute your matches right now." } as const;
  }
}

export async function getBalancedCollegeListAction() {
  try {
    const data = await getBalancedCollegeList();
    return { ok: true, data } as const;
  } catch (err) {
    if (err instanceof MatchValidationError) {
      return { ok: false, error: err.message } as const;
    }
    return { ok: false, error: "Unable to build your college list right now." } as const;
  }
}