"use server";

import {
  getSavedColleges as getSavedCollegesService,
  saveCollege as saveCollegeService,
  removeSavedCollege as removeSavedCollegeService,
  isCollegeSaved,
} from "@/lib/services/saved-college.service";
import { removeSavedCollegeSchema, saveCollegeSchema } from "@/lib/validation/schemas";
import { generateRecommendations } from "@/lib/services/recommendation.service";
import { revalidatePath } from "next/cache";

export interface SavedCollegeActionResult {
  ok: boolean;
  error?: string;
}

export async function getSavedCollegesAction() {
  try {
    const saved = await getSavedCollegesService();
    return { ok: true, data: saved };
  } catch {
    return { ok: false, error: "Unable to load your saved colleges." };
  }
}

export async function saveCollegeAction(rawInput: unknown): Promise<SavedCollegeActionResult> {
  const parsed = saveCollegeSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false, error: "Invalid college reference." };
  }
  try {
    await saveCollegeService(parsed.data.collegeId);
    try {
      await generateRecommendations();
    } catch {
      // Best-effort: a recommendation refresh must never block saving.
    }
    revalidatePath("/journey/colleges");
    revalidatePath("/college/[slug]", "page");
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error && e.message === "COLLEGE_NOT_FOUND"
      ? "That college does not exist."
      : "Unable to save this college right now.";
    return { ok: false, error: msg };
  }
}

export async function removeSavedCollegeAction(rawInput: unknown): Promise<SavedCollegeActionResult> {
  const parsed = removeSavedCollegeSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false, error: "Invalid college reference." };
  }
  try {
    await removeSavedCollegeService(parsed.data.collegeId);
    revalidatePath("/journey/colleges");
    revalidatePath("/college/[slug]", "page");
    return { ok: true };
  } catch {
    return { ok: false, error: "Unable to remove this college right now." };
  }
}

export async function isCollegeSavedAction(collegeId: string) {
  try {
    const saved = await isCollegeSaved(collegeId);
    return { ok: true, data: saved };
  } catch {
    return { ok: false, data: false };
  }
}