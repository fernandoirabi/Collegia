"use server";

import {
  getCollegeBySlug,
  getFeaturedColleges,
  searchColleges as searchCollegesService,
} from "@/lib/services/college.service";
import { searchCollegesSchema } from "@/lib/validation/schemas";

export interface SearchResult {
  ok: boolean;
  data?: unknown;
  error?: string;
}

export async function searchCollegesAction(rawInput: unknown): Promise<SearchResult> {
  const parsed = searchCollegesSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false, error: "Invalid search filters." };
  }
  try {
    const colleges = await searchCollegesService(parsed.data);
    return { ok: true, data: colleges };
  } catch {
    return { ok: false, error: "Unable to search colleges right now." };
  }
}

export async function getCollegeBySlugAction(slug: string) {
  try {
    const college = await getCollegeBySlug(slug);
    return { ok: true, data: college };
  } catch {
    return { ok: false, error: "Unable to load this college." };
  }
}

export async function getFeaturedCollegesAction(limit?: number) {
  try {
    const colleges = await getFeaturedColleges(limit);
    return { ok: true, data: colleges };
  } catch {
    return { ok: false, error: "Unable to load colleges right now." };
  }
}