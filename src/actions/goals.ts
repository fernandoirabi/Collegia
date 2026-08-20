"use server";

import {
  createGoal as createGoalService,
  updateGoal as updateGoalService,
  completeGoal as completeGoalService,
  deleteGoal as deleteGoalService,
  type GoalView,
} from "@/lib/services/goals.service";
import { createGoalSchema, updateGoalSchema, goalIdSchema } from "@/lib/validation/schemas";
import { revalidatePath } from "next/cache";

export interface GoalActionResult {
  ok: boolean;
  data?: GoalView;
  error?: string;
}

export async function createGoalAction(rawInput: unknown): Promise<GoalActionResult> {
  const parsed = createGoalSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false, error: "One or more goal fields are invalid." };
  }
  try {
    const goal = await createGoalService(parsed.data);
    revalidatePath("/journey/goals");
    revalidatePath("/journey");
    return { ok: true, data: goal };
  } catch {
    return { ok: false, error: "Unable to create this goal right now." };
  }
}

export async function updateGoalAction(rawInput: unknown): Promise<GoalActionResult> {
  const parsed = updateGoalSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false, error: "One or more goal fields are invalid." };
  }
  try {
    const goal = await updateGoalService(parsed.data.id, {
      currentValue: parsed.data.currentValue,
      targetValue: parsed.data.targetValue,
    });
    if (!goal) return { ok: false, error: "That goal no longer exists." };
    revalidatePath("/journey/goals");
    revalidatePath("/journey");
    return { ok: true, data: goal };
  } catch {
    return { ok: false, error: "Unable to update this goal right now." };
  }
}

export async function completeGoalAction(rawInput: unknown): Promise<GoalActionResult> {
  const parsed = goalIdSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false, error: "Invalid goal reference." };
  }
  try {
    const goal = await completeGoalService(parsed.data.id);
    if (!goal) return { ok: false, error: "That goal no longer exists." };
    revalidatePath("/journey/goals");
    revalidatePath("/journey");
    return { ok: true, data: goal };
  } catch {
    return { ok: false, error: "Unable to complete this goal right now." };
  }
}

export async function deleteGoalAction(rawInput: unknown): Promise<GoalActionResult> {
  const parsed = goalIdSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false, error: "Invalid goal reference." };
  }
  try {
    const deleted = await deleteGoalService(parsed.data.id);
    if (!deleted) return { ok: false, error: "That goal no longer exists." };
    revalidatePath("/journey/goals");
    revalidatePath("/journey");
    return { ok: true };
  } catch {
    return { ok: false, error: "Unable to delete this goal right now." };
  }
}