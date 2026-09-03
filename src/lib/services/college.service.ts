import { prisma } from "@/lib/db/prisma";
import { getCollegeImage } from "@/data/college-images";
import type { College } from "@/types";
import type { Prisma, College as PrismaCollege, CollegeRegion, ApplicationPlan } from "@prisma/client";

export type CollegeWithRelations = PrismaCollege & {
  majors: {
    major: { name: string; category: string | null };
    strength: number | null;
    isStrongProgram: boolean;
  }[];
  deadlines: { plan: ApplicationPlan; deadlineDescription: string | null; date: Date | null }[];
};

const REGION_ENUM_TO_LABEL: Record<string, string> = {
  NORTHEAST: "Northeast",
  EAST_COAST: "East Coast",
  MIDWEST: "Midwest",
  SOUTH: "South",
  SOUTHWEST: "Southwest",
  WEST_COAST: "West Coast",
  OTHER: "Other",
};

export const REGION_LABEL_TO_ENUM: Record<string, CollegeRegion> = {
  "East Coast": "EAST_COAST",
  "West Coast": "WEST_COAST",
  "Midwest": "MIDWEST",
  "South": "SOUTH",
  "Northeast": "NORTHEAST",
  "Southwest": "SOUTHWEST",
};

export function formatDeadline(date: Date | null): string {
  if (!date) return "Rolling";
  return date.toLocaleDateString("en-US", { timeZone: "UTC", month: "long", day: "numeric" });
}

export function mapCollegeToUI(c: CollegeWithRelations): College {
  const regular = c.deadlines.find((d) => d.plan === "REGULAR_DECISION");
  const earlyDecision = c.deadlines.find((d) => d.plan === "EARLY_DECISION");
  const rolling = c.deadlines.find((d) => d.plan === "ROLLING");

  const intlPop = c.internationalPopulation ?? 0;

  // A curated per-college campus photo (from Wikimedia Commons) takes priority
  // for the large cover treatment, falling back to the seeded/regional image and
  // finally the shared hero. `image` stays as-is for small card thumbnails.
  const coverImage = getCollegeImage(c.slug) ?? c.coverImage ?? c.image ?? "/images/hero_campus.jpg";

  return {
    id: c.id,
    slug: c.slug,
    name: c.name,
    shortName: c.shortName ?? c.name,
    location: {
      city: c.city,
      state: c.state,
      stateCode: c.stateCode,
    },
    type: c.type === "PUBLIC" ? "Public" : "Private",
    size: c.sizeCategory === "LARGE" ? "Large" : c.sizeCategory === "MEDIUM" ? "Medium" : "Small",
    setting: c.setting === "URBAN" ? "Urban" : c.setting === "RURAL" ? "Rural" : "Suburban",
    admissions: {
      acceptanceRate: c.acceptanceRate ?? 0,
      avgGPA: c.avgGpa ?? 0,
      satRange: [c.satRangeMin ?? 0, c.satRangeMax ?? 0],
      actRange: [c.actRangeMin ?? 0, c.actRangeMax ?? 0],
      applicationDeadline: regular ? formatDeadline(regular.date) : rolling ? "Rolling" : "Rolling",
      earlyDecisionDeadline: earlyDecision ? formatDeadline(earlyDecision.date) : undefined,
    },
    academics: {
      strongPrograms: c.majors.map((m) => m.major.name),
      graduationRate: c.graduationRate ?? 0,
      studentFacultyRatio: c.studentFacultyRatio ?? "—",
    },
    cost: {
      tuitionInternational: c.tuitionInternational ?? 0,
      roomAndBoard: c.roomAndBoard ?? 0,
      totalCost: c.estimatedTotalCostInternational ?? (c.tuitionInternational ?? 0) + (c.roomAndBoard ?? 0),
    },
    financial: {
      meetsFullNeed: c.meetsFullNeed ?? false,
      internationalAid: c.internationalAidAvailable ?? false,
      avgAidAmount: c.avgAidInternational ?? undefined,
    },
    international: {
      internationalPercentage: c.internationalPercentage ?? 0,
      countriesRepresented: c.internationalPopulation
        ? Math.min(140, Math.max(40, Math.round(c.internationalPopulation / 55)))
        : 0,
      i20Support: c.i20Support ?? false,
      optAvailable: c.optAvailable ?? false,
    },
    campusLife: {
      housing: c.housing ?? "—",
      clubs: c.clubsCount ?? 0,
      sports: c.sports ?? [],
      greekLife: c.greekLife ?? false,
    },
    image: c.image ?? "/images/hero_campus.jpg",
    coverImage,
    tags: c.tags ?? [],
    featured: c.featured,
  };
}

export const collegeInclude = {
  majors: {
    select: {
      strength: true,
      isStrongProgram: true,
      major: { select: { name: true, category: true } },
    },
  },
  deadlines: {
    select: { plan: true, deadlineDescription: true, date: true },
  },
} satisfies Prisma.CollegeInclude;

export async function getCollegeBySlug(slug: string): Promise<College | null> {
  const college = await prisma.college.findUnique({
    where: { slug },
    include: collegeInclude,
  });
  if (!college) return null;
  return mapCollegeToUI(college);
}

export async function getCollegeById(id: string): Promise<College | null> {
  const college = await prisma.college.findUnique({
    where: { id },
    include: collegeInclude,
  });
  if (!college) return null;
  return mapCollegeToUI(college);
}

export async function getFeaturedColleges(limit = 4): Promise<College[]> {
  const colleges = await prisma.college.findMany({
    where: { featured: true },
    orderBy: { name: "asc" },
    take: limit,
    include: collegeInclude,
  });
  return colleges.map(mapCollegeToUI);
}

export async function getAllColleges(): Promise<College[]> {
  const colleges = await prisma.college.findMany({
    orderBy: { name: "asc" },
    include: collegeInclude,
  });
  return colleges.map(mapCollegeToUI);
}

export interface CollegeSearchFilters {
  q?: string;
  states?: string[];
  regions?: string[]; // display labels, e.g. "East Coast"
  types?: ("Public" | "Private")[];
  majors?: string[];
  sizes?: ("Small" | "Medium" | "Large")[];
  maxTuition?: number | null;
}

export async function searchColleges(filters: CollegeSearchFilters): Promise<College[]> {
  const where: Prisma.CollegeWhereInput = {};

  if (filters.q) {
    where.OR = [
      { name: { contains: filters.q, mode: "insensitive" } },
      { city: { contains: filters.q, mode: "insensitive" } },
      { state: { contains: filters.q, mode: "insensitive" } },
      { tags: { has: filters.q } },
    ];
  }

  if (filters.states && filters.states.length > 0) {
    where.stateCode = { in: filters.states };
  }

  if (filters.regions && filters.regions.length > 0) {
    const enums = filters.regions
      .map((label) => REGION_LABEL_TO_ENUM[label])
      .filter((e): e is CollegeRegion => Boolean(e));
    if (enums.length > 0) where.region = { in: enums };
  }

  if (filters.types && filters.types.length > 0) {
    where.type = {
      in: filters.types.map((t) => (t === "Public" ? "PUBLIC" : "PRIVATE")),
    };
  }

  if (filters.sizes && filters.sizes.length > 0) {
    where.sizeCategory = {
      in: filters.sizes.map((s) => (s === "Small" ? "SMALL" : s === "Medium" ? "MEDIUM" : "LARGE")),
    };
  }

  if (filters.maxTuition && filters.maxTuition > 0) {
    where.tuitionInternational = { lte: filters.maxTuition };
  }

  if (filters.majors && filters.majors.length > 0) {
    where.majors = {
      some: { major: { name: { in: filters.majors } } },
    };
  }

  const colleges = await prisma.college.findMany({
    where,
    orderBy: [{ featured: "desc" }, { name: "asc" }],
    include: collegeInclude,
  });

  return colleges.map(mapCollegeToUI);
}