"use server";

import { updateRecommendationStatus as updateRecommendationStatusService } from "@/lib/services/recommendation.service";
import { recommendationStatusSchema } from "@/lib/validation/schemas";
import { revalidatePath } from "next/cache";

export async function updateRecommendationStatusAction(rawInput: unknown) {
  const parsed = recommendationStatusSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false, error: "Invalid recommendation reference." };
  }
  try {
    const updated = await updateRecommendationStatusService(parsed.data.id, parsed.data.status);
    if (!updated) return { ok: false, error: "That recommendation no longer exists." };
    revalidatePath("/journey");
    return { ok: true };
  } catch {
    return { ok: false, error: "Unable to update this recommendation right now." };
  }
}