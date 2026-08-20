import { z } from "zod";

export const REGION_LABELS = [
  "East Coast",
  "West Coast",
  "Midwest",
  "South",
  "Northeast",
  "Southwest",
] as const;

export const SIZE_LABELS = ["Small", "Medium", "Large"] as const;
export const TYPE_LABELS = ["Public", "Private"] as const;
export const SETTING_LABELS = ["Urban", "Suburban", "Rural"] as const;

export const profileUpdateSchema = z.object({
  // Identity
  firstName: z.string().trim().max(80).nullable().optional(),
  lastName: z.string().trim().max(80).nullable().optional(),
  country: z.string().trim().max(80).nullable().optional(),
  isInternationalStudent: z.boolean().optional(),

  // Academics
  gpa: z.number().min(0).max(5).nullable().optional(),
  gpaScale: z.number().min(1).max(5).nullable().optional(),
  satScore: z.number().int().min(400).max(1600).nullable().optional(),
  actScore: z.number().int().min(1).max(36).nullable().optional(),
  classYear: z.number().int().min(2000).max(2100).nullable().optional(),
  intendedMajor: z.string().trim().max(120).nullable().optional(),

  // Application
  applicationYear: z.number().int().min(2024).max(2100).nullable().optional(),
  intendedEnrollmentYear: z.number().int().min(2025).max(2100).nullable().optional(),
});

export const preferencesUpdateSchema = z.object({
  preferredStates: z.array(z.string().trim().max(40)).max(20).optional(),
  preferredRegions: z.array(z.string().trim().max(40)).max(10).optional(),
  preferredSizes: z.array(z.enum(SIZE_LABELS)).max(3).optional(),
  publicPrivate: z.array(z.enum(TYPE_LABELS)).max(2).optional(),
  settings: z.array(z.enum(SETTING_LABELS)).max(3).optional(),
  sports: z.array(z.string().trim().max(60)).max(20).optional(),
  clubs: z.array(z.string().trim().max(60)).max(20).optional(),
  interests: z.array(z.string().trim().max(60)).max(20).optional(),
  annualBudget: z.number().int().min(0).max(1_000_000).nullable().optional(),
  requiresFinancialAid: z.boolean().nullable().optional(),
  requiresScholarship: z.boolean().nullable().optional(),
});

export const financialAidUpdateSchema = z.object({
  annualBudget: z.number().int().min(0).max(1_000_000).nullable().optional(),
  requiresFinancialAid: z.boolean().nullable().optional(),
  requiresScholarship: z.boolean().nullable().optional(),
  currency: z.string().trim().max(8).optional(),
  fundingSource: z.string().trim().max(120).nullable().optional(),
});

export const internationalProfileUpdateSchema = z.object({
  country: z.string().trim().max(80).nullable().optional(),
  englishProficiencyTest: z.string().trim().max(40).nullable().optional(),
  englishProficiencyScore: z.number().int().min(0).max(160).nullable().optional(),
  ieltsScore: z.number().min(0).max(9).nullable().optional(),
  visaType: z.string().trim().max(20).nullable().optional(),
  needsI20Support: z.boolean().nullable().optional(),
});

export const saveCollegeSchema = z.object({
  collegeId: z.string().min(1).max(64),
});

export const removeSavedCollegeSchema = z.object({
  collegeId: z.string().min(1).max(64),
});

export const searchCollegesSchema = z.object({
  q: z.string().trim().max(120).optional(),
  states: z.array(z.string().trim().max(2)).max(20).optional(),
  regions: z.array(z.enum(REGION_LABELS)).max(6).optional(),
  types: z.array(z.enum(TYPE_LABELS)).max(2).optional(),
  majors: z.array(z.string().trim().max(80)).max(10).optional(),
  sizes: z.array(z.enum(SIZE_LABELS)).max(3).optional(),
  maxTuition: z.number().int().min(0).max(1_000_000).nullable().optional(),
});

export const GOAL_CATEGORIES = ["ACADEMIC", "TESTING", "EXTRACURRICULAR", "APPLICATION", "FINANCIAL"] as const;
export const GOAL_PRIORITIES = ["HIGH", "MEDIUM", "LOW"] as const;

export const createGoalSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(300).nullable().optional(),
  currentValue: z.number().nullable().optional(),
  targetValue: z.number().positive().nullable().optional(),
  unit: z.string().trim().max(20).nullable().optional(),
  category: z.enum(GOAL_CATEGORIES).optional(),
  priority: z.enum(GOAL_PRIORITIES).optional(),
});

export const updateGoalSchema = z.object({
  id: z.string().min(1).max(64),
  currentValue: z.number().nullable().optional(),
  targetValue: z.number().positive().nullable().optional(),
});

export const goalIdSchema = z.object({
  id: z.string().min(1).max(64),
});

export const recommendationStatusSchema = z.object({
  id: z.string().min(1).max(64),
  status: z.enum(["DONE", "DISMISSED"]),
});
