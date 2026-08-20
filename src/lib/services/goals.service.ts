// ============================================================
// COLLEGIA — GOALS SERVICE
//
// CRUD for student improvement goals (the IMPROVE part of the
// DISCOVER → MATCH → IMPROVE → JOURNEY loop).
// ============================================================

import { prisma } from "@/lib/db/prisma";
import { getCurrentUserId } from "@/lib/auth/current-user";
import type { GoalCategory, GoalPriority, GoalStatus } from "@prisma/client";

const CATEGORY_LABEL: Record<string, string> = {
  ACADEMIC: "Academic",
  TESTING: "Testing",
  EXTRACURRICULAR: "Extracurricular",
  APPLICATION: "Application",
  FINANCIAL: "Financial",
};

const PRIORITY_LABEL: Record<string, string> = {
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
};

export interface GoalView {
  id: string;
  title: string;
  description: string | null;
  current: number | null;
  target: number | null;
  unit: string | null;
  category: string;
  priority: string;
  status: GoalStatus;
  progress: number;
  completed: boolean;
  dueDate: Date | null;
}

function toView(g: {
  id: string;
  title: string;
  description: string | null;
  currentValue: number | null;
  targetValue: number | null;
  unit: string | null;
  category: GoalCategory;
  priority: GoalPriority;
  status: GoalStatus;
  dueDate: Date | null;
}): GoalView {
  const progress =
    g.currentValue != null && g.targetValue != null && g.targetValue > 0
      ? Math.max(0, Math.min(100, Math.round((g.currentValue / g.targetValue) * 100)))
      : 0;
  return {
    id: g.id,
    title: g.title,
    description: g.description,
    current: g.currentValue,
    target: g.targetValue,
    unit: g.unit,
    category: CATEGORY_LABEL[g.category] ?? g.category,
    priority: PRIORITY_LABEL[g.priority] ?? g.priority,
    status: g.status,
    progress,
    completed: g.status === "COMPLETED" || (g.currentValue != null && g.targetValue != null && g.currentValue >= g.targetValue),
    dueDate: g.dueDate,
  };
}

export async function getGoals(): Promise<GoalView[]> {
  const userId = await getCurrentUserId();
  const goals = await prisma.goal.findMany({
    where: { userId },
    orderBy: [{ status: "asc" }, { priority: "asc" }, { createdAt: "asc" }],
  });
  return goals.map(toView);
}

export interface CreateGoalInput {
  title: string;
  description?: string | null;
  currentValue?: number | null;
  targetValue?: number | null;
  unit?: string | null;
  category?: GoalCategory;
  priority?: GoalPriority;
  dueDate?: Date | null;
}

export async function createGoal(input: CreateGoalInput): Promise<GoalView> {
  const userId = await getCurrentUserId();
  const goal = await prisma.goal.create({
    data: {
      userId,
      title: input.title,
      description: input.description ?? null,
      currentValue: input.currentValue ?? null,
      targetValue: input.targetValue ?? null,
      unit: input.unit ?? null,
      category: input.category ?? "ACADEMIC",
      priority: input.priority ?? "MEDIUM",
      dueDate: input.dueDate ?? null,
    },
  });
  return toView(goal);
}

export interface UpdateGoalInput {
  title?: string;
  description?: string | null;
  currentValue?: number | null;
  targetValue?: number | null;
  unit?: string | null;
  category?: GoalCategory;
  priority?: GoalPriority;
  status?: GoalStatus;
  dueDate?: Date | null;
}

export async function updateGoal(id: string, input: UpdateGoalInput): Promise<GoalView | null> {
  const userId = await getCurrentUserId();
  const existing = await prisma.goal.findFirst({ where: { id, userId } });
  if (!existing) return null;

  const goal = await prisma.goal.update({
    where: { id },
    data: {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.currentValue !== undefined ? { currentValue: input.currentValue } : {}),
      ...(input.targetValue !== undefined ? { targetValue: input.targetValue } : {}),
      ...(input.unit !== undefined ? { unit: input.unit } : {}),
      ...(input.category !== undefined ? { category: input.category } : {}),
      ...(input.priority !== undefined ? { priority: input.priority } : {}),
      ...(input.status !== undefined ? { status: input.status, completedAt: input.status === "COMPLETED" ? new Date() : null } : {}),
      ...(input.dueDate !== undefined ? { dueDate: input.dueDate } : {}),
    },
  });
  return toView(goal);
}

export async function completeGoal(id: string): Promise<GoalView | null> {
  return updateGoal(id, { status: "COMPLETED" });
}

export async function deleteGoal(id: string): Promise<boolean> {
  const userId = await getCurrentUserId();
  const existing = await prisma.goal.findFirst({ where: { id, userId } });
  if (!existing) return false;
  await prisma.goal.delete({ where: { id } });
  return true;
}