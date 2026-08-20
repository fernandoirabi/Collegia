import { prisma } from "@/lib/db/prisma";
import { getCurrentUserId } from "@/lib/auth/current-user";
import type { Prisma } from "@prisma/client";

const REGION_ENUM_TO_LABEL: Record<string, string> = {
  NORTHEAST: "Northeast",
  EAST_COAST: "East Coast",
  MIDWEST: "Midwest",
  SOUTH: "South",
  SOUTHWEST: "Southwest",
  WEST_COAST: "West Coast",
};

function normalizeRegionLabel(value: string): string {
  return REGION_ENUM_TO_LABEL[value] ?? value;
}

export interface StudentProfileView {
  id: string;
  userId: string;
  firstName: string | null;
  lastName: string | null;
  name: string;
  country: string | null;
  isInternationalStudent: boolean;
  gpa: number | null;
  gpaScale: number | null;
  satScore: number | null;
  actScore: number | null;
  classYear: number | null;
  intendedMajor: string | null;
  applicationYear: number | null;
  intendedEnrollmentYear: number | null;
  preferences: {
    preferredStates: string[];
    preferredRegions: string[];
    preferredSizes: string[];
    publicPrivate: string[];
    settings: string[];
    sports: string[];
    clubs: string[];
    interests: string[];
  };
  financialAid: {
    annualBudget: number | null;
    requiresFinancialAid: boolean | null;
    requiresScholarship: boolean | null;
    currency: string | null;
    fundingSource: string | null;
  };
  international: {
    englishProficiencyTest: string | null;
    englishProficiencyScore: number | null;
    ieltsScore: number | null;
    visaType: string | null;
    needsI20Support: boolean | null;
  };
}

export async function getStudentProfile(): Promise<StudentProfileView | null> {
  const userId = await getCurrentUserId();

  const [profile, preferences, financialAid, international] = await Promise.all([
    prisma.studentProfile.findUnique({ where: { userId } }),
    prisma.collegePreference.findUnique({ where: { userId } }),
    prisma.financialAidProfile.findUnique({ where: { userId } }),
    prisma.internationalProfile.findUnique({ where: { userId } }),
  ]);

  if (!profile) return null;

  return {
    id: profile.id,
    userId,
    firstName: profile.firstName,
    lastName: profile.lastName,
    name: [profile.firstName, profile.lastName].filter(Boolean).join(" ") || "Student",
    country: profile.country,
    isInternationalStudent: profile.isInternationalStudent,
    gpa: profile.gpa,
    gpaScale: profile.gpaScale,
    satScore: profile.satScore,
    actScore: profile.actScore,
    classYear: profile.classYear,
    intendedMajor: profile.intendedMajor,
    applicationYear: profile.applicationYear,
    intendedEnrollmentYear: profile.intendedEnrollmentYear,
    preferences: {
      preferredStates: preferences?.preferredStates ?? [],
      preferredRegions: (preferences?.preferredRegions ?? []).map(normalizeRegionLabel),
      preferredSizes: preferences?.preferredSizes ?? [],
      publicPrivate: preferences?.publicPrivate ?? [],
      settings: preferences?.settings ?? [],
      sports: preferences?.sports ?? [],
      clubs: preferences?.clubs ?? [],
      interests: preferences?.interests ?? [],
    },
    financialAid: {
      annualBudget: financialAid?.annualBudget ?? null,
      requiresFinancialAid: financialAid?.requiresFinancialAid ?? null,
      requiresScholarship: financialAid?.requiresScholarship ?? null,
      currency: financialAid?.currency ?? "USD",
      fundingSource: financialAid?.fundingSource ?? null,
    },
    international: {
      englishProficiencyTest: international?.englishProficiencyTest ?? null,
      englishProficiencyScore: international?.englishProficiencyScore ?? null,
      ieltsScore: international?.ieltsScore ?? null,
      visaType: international?.visaType ?? null,
      needsI20Support: international?.needsI20Support ?? null,
    },
  };
}

export interface UpdateProfileInput {
  // StudentProfile
  firstName?: string | null;
  lastName?: string | null;
  country?: string | null;
  isInternationalStudent?: boolean;
  gpa?: number | null;
  gpaScale?: number | null;
  satScore?: number | null;
  actScore?: number | null;
  classYear?: number | null;
  intendedMajor?: string | null;
  applicationYear?: number | null;
  intendedEnrollmentYear?: number | null;
  // Preferences
  preferredStates?: string[];
  preferredRegions?: string[];
  preferredSizes?: string[];
  publicPrivate?: string[];
  settings?: string[];
  sports?: string[];
  clubs?: string[];
  interests?: string[];
  // Financial aid
  annualBudget?: number | null;
  requiresFinancialAid?: boolean | null;
  requiresScholarship?: boolean | null;
  fundingSource?: string | null;
  // International
  englishProficiencyTest?: string | null;
  englishProficiencyScore?: number | null;
  ieltsScore?: number | null;
  visaType?: string | null;
  needsI20Support?: boolean | null;
}

export async function createStudentProfile(input: UpdateProfileInput): Promise<StudentProfileView> {
  const userId = await getCurrentUserId();

  const profileData: Prisma.StudentProfileCreateInput = {
    user: { connect: { id: userId } },
  };
  const preferenceData: Prisma.CollegePreferenceCreateInput = { user: { connect: { id: userId } } };
  const financialData: Prisma.FinancialAidProfileCreateInput = { user: { connect: { id: userId } } };
  const internationalData: Prisma.InternationalProfileCreateInput = { user: { connect: { id: userId } } };

  const profile = await prisma.studentProfile.create({ data: profileData });
  await prisma.collegePreference.create({ data: preferenceData });
  await prisma.financialAidProfile.create({ data: financialData });
  await prisma.internationalProfile.create({ data: internationalData });

  await applyProfileFields(profile.id, input);
  return getStudentProfile() as Promise<StudentProfileView>;
}

export async function updateStudentProfile(input: UpdateProfileInput): Promise<StudentProfileView> {
  const userId = await getCurrentUserId();

  const profile = await prisma.studentProfile.findUnique({ where: { userId } });
  if (!profile) return createStudentProfile(input);

  await applyProfileFields(profile.id, input);
  return getStudentProfile() as Promise<StudentProfileView>;
}

async function applyProfileFields(profileId: string, input: UpdateProfileInput) {
  const profileData: Prisma.StudentProfileUncheckedUpdateInput = {};
  const preferenceData: Prisma.CollegePreferenceUncheckedCreateInput = {} as Prisma.CollegePreferenceUncheckedCreateInput;
  const financialData: Prisma.FinancialAidProfileUncheckedCreateInput = {} as Prisma.FinancialAidProfileUncheckedCreateInput;
  const internationalData: Prisma.InternationalProfileUncheckedCreateInput = {} as Prisma.InternationalProfileUncheckedCreateInput;

  const profileKeys = [
    "firstName", "lastName", "country", "isInternationalStudent", "gpa", "gpaScale",
    "satScore", "actScore", "classYear", "intendedMajor", "applicationYear", "intendedEnrollmentYear",
  ] as const;
  const preferenceKeys = [
    "preferredStates", "preferredRegions", "preferredSizes", "publicPrivate",
    "settings", "sports", "clubs", "interests",
  ] as const;
  const financialKeys = ["annualBudget", "requiresFinancialAid", "requiresScholarship", "fundingSource"] as const;
  const internationalKeys = [
    "englishProficiencyTest", "englishProficiencyScore", "ieltsScore", "visaType", "needsI20Support",
  ] as const;

  for (const key of profileKeys) {
    if (key in input) (profileData as Record<string, unknown>)[key] = input[key];
  }
  for (const key of preferenceKeys) {
    if (key in input) (preferenceData as Record<string, unknown>)[key] = input[key];
  }
  for (const key of financialKeys) {
    if (key in input) (financialData as Record<string, unknown>)[key] = input[key];
  }
  for (const key of internationalKeys) {
    if (key in input) (internationalData as Record<string, unknown>)[key] = input[key];
  }

  if (Object.keys(profileData).length > 0) {
    await prisma.studentProfile.update({ where: { id: profileId }, data: profileData });
  }

  const userId = (await prisma.studentProfile.findUnique({ where: { id: profileId } }))?.userId;
  if (!userId) return;

  if (Object.keys(preferenceData).length > 0) {
    await prisma.collegePreference.upsert({
      where: { userId },
      update: { ...preferenceData, userId },
      create: { ...preferenceData, userId },
    });
  }
  if (Object.keys(financialData).length > 0) {
    await prisma.financialAidProfile.upsert({
      where: { userId },
      update: { ...financialData, userId },
      create: { ...financialData, userId },
    });
  }
  if (Object.keys(internationalData).length > 0) {
    await prisma.internationalProfile.upsert({
      where: { userId },
      update: { ...internationalData, userId },
      create: { ...internationalData, userId },
    });
  }
}

export async function getStudentPreferences() {
  const view = await getStudentProfile();
  if (!view) return null;
  return view.preferences;
}

export async function updateStudentPreferences(input: {
  preferredStates?: string[];
  preferredRegions?: string[];
  preferredSizes?: string[];
  publicPrivate?: string[];
  settings?: string[];
  sports?: string[];
  clubs?: string[];
  interests?: string[];
  annualBudget?: number | null;
  requiresFinancialAid?: boolean | null;
  requiresScholarship?: boolean | null;
}) {
  return updateStudentProfile(input);
}