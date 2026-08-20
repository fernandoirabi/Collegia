"use server";

import {
  createStudentProfile as createStudentProfileService,
  getStudentPreferences as getStudentPreferencesService,
  getStudentProfile as getStudentProfileService,
  updateStudentPreferences as updateStudentPreferencesService,
  updateStudentProfile as updateStudentProfileService,
  type UpdateProfileInput,
} from "@/lib/services/profile.service";
import {
  financialAidUpdateSchema,
  internationalProfileUpdateSchema,
  preferencesUpdateSchema,
  profileUpdateSchema,
} from "@/lib/validation/schemas";
import { recomputeSavedColleges } from "@/lib/services/match-score.service";
import { generateRecommendations } from "@/lib/services/recommendation.service";
import { revalidatePath } from "next/cache";

export interface ActionResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

function toActionError(e: unknown): string {
  if (e instanceof Error) {
    if ("issues" in (e as unknown as { issues?: unknown[] })) return "Invalid input provided.";
    return "Something went wrong. Please try again.";
  }
  return "Something went wrong. Please try again.";
}

async function recomputeMatchesAfterProfileChange(): Promise<void> {
  try {
    await recomputeSavedColleges();
  } catch {
    // A profile update must never fail because a recalculation hiccuped.
  }
  try {
    await generateRecommendations();
  } catch {
    // Recommendations are best-effort and must never block a profile save.
  }
}

export async function getStudentProfileAction() {
  try {
    const profile = await getStudentProfileService();
    return { ok: true, data: profile } as const;
  } catch {
    return { ok: false, error: "Unable to load your profile." } as const;
  }
}

export async function getStudentPreferencesAction() {
  try {
    const prefs = await getStudentPreferencesService();
    return { ok: true, data: prefs } as const;
  } catch {
    return { ok: false, error: "Unable to load your preferences." } as const;
  }
}

export async function updateStudentProfileAction(
  rawInput: unknown
): Promise<ActionResult<UpdateProfileInput>> {
  const parsed = profileUpdateSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false, error: "One or more profile fields are invalid." };
  }
  try {
    await updateStudentProfileService(parsed.data);
    await recomputeMatchesAfterProfileChange();
    revalidatePath("/profile");
    return { ok: true };
  } catch {
    return { ok: false, error: toActionError(new Error("update failed")) };
  }
}

export async function updateStudentPreferencesAction(
  rawInput: unknown
): Promise<ActionResult<UpdateProfileInput>> {
  const parsed = preferencesUpdateSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false, error: "One or more preference fields are invalid." };
  }
  try {
    await updateStudentPreferencesService(parsed.data);
    await recomputeMatchesAfterProfileChange();
    revalidatePath("/profile");
    return { ok: true };
  } catch {
    return { ok: false, error: toActionError(new Error("update failed")) };
  }
}

export async function updateFinancialAidAction(
  rawInput: unknown
): Promise<ActionResult<UpdateProfileInput>> {
  const parsed = financialAidUpdateSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false, error: "One or more budget fields are invalid." };
  }
  try {
    await updateStudentProfileService(parsed.data);
    await recomputeMatchesAfterProfileChange();
    revalidatePath("/profile");
    return { ok: true };
  } catch {
    return { ok: false, error: toActionError(new Error("update failed")) };
  }
}

export async function updateInternationalProfileAction(
  rawInput: unknown
): Promise<ActionResult<UpdateProfileInput>> {
  const parsed = internationalProfileUpdateSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false, error: "One or more international fields are invalid." };
  }
  try {
    await updateStudentProfileService(parsed.data);
    await recomputeMatchesAfterProfileChange();
    revalidatePath("/profile");
    return { ok: true };
  } catch {
    return { ok: false, error: toActionError(new Error("update failed")) };
  }
}