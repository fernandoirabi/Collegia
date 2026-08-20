// ============================================================
// COLLEGIA — Development Seed
//
// Populates the database with clearly-labeled DEMO data.
// Every College row is created with isDemoData=true and
// verificationStatus=DEMO so real verified data can replace it.
//
// This seed is idempotent: re-running it updates existing rows
// rather than duplicating them.
// ============================================================

import { PrismaClient } from "@prisma/client";
import { seedMajors } from "./seed-data/majors";
import { seedColleges, type SeedCollege } from "./seed-data/colleges";
import { seedCollegesExtra } from "./seed-data/colleges-extra";
import { seedCollegesPathway } from "./seed-data/colleges-pathway";
import {
  computeMatch,
  collegeToEngineCollege,
  type EngineProfile,
} from "../src/lib/services/match.engine";
import type { CollegeWithRelations } from "../src/lib/services/college.service";

const prisma = new PrismaClient();

const DATA_YEAR = 2026;

function parseDeadline(monthDay: string, year = 2026): Date {
  const [m, d] = monthDay.split("-").map((n) => parseInt(n, 10));
  return new Date(Date.UTC(year, m - 1, d));
}

function deadlineLabel(d: Date | null): string {
  if (!d) return "Rolling";
  return d.toLocaleDateString("en-US", { timeZone: "UTC", month: "long", day: "numeric" });
}

const IMAGES = [
  "/images/campus_boston.jpg",
  "/images/campus_florida.jpg",
  "/images/campus_nyc.jpg",
  "/images/campus_california.jpg",
  "/images/hero_campus.jpg",
];

function pickImage(seed: SeedCollege): string {
  return seed.image || IMAGES[seed.name.length % IMAGES.length];
}

function defaultSports(sizeCategory: string): string[] {
  if (sizeCategory === "SMALL") return ["Soccer", "Tennis", "Track & Field", "Swimming"];
  if (sizeCategory === "MEDIUM") return ["Basketball", "Soccer", "Tennis", "Track & Field"];
  return ["Football", "Basketball", "Soccer", "Swimming"];
}

function defaultClubs(sizeCategory: string): number {
  if (sizeCategory === "SMALL") return 120;
  if (sizeCategory === "MEDIUM") return 300;
  return 800;
}

async function seedMajorsData() {
  for (const major of seedMajors) {
    await prisma.major.upsert({
      where: { name: major.name },
      update: { category: major.category },
      create: { name: major.name, category: major.category },
    });
  }
  const all = await prisma.major.findMany();
  return new Map(all.map((m) => [m.name, m.id]));
}

async function seedCollege(seed: SeedCollege, majorIdByName: Map<string, string>) {
  const image = pickImage(seed);
  const strongProgramIds = (seed.strongPrograms || [])
    .map((name) => majorIdByName.get(name))
    .filter((id): id is string => Boolean(id));

  const existing = await prisma.college.findUnique({ where: { slug: seed.slug } });

  const college = await prisma.college.upsert({
    where: { slug: seed.slug },
    update: {
      name: seed.name,
      shortName: seed.shortName ?? null,
      website: seed.website ?? null,
      city: seed.city,
      state: seed.state,
      stateCode: seed.stateCode,
      region: seed.region,
      type: seed.type,
      setting: seed.setting,
      sizeCategory: seed.sizeCategory,
      undergraduateEnrollment: seed.undergradEnrollment,
      acceptanceRate: seed.acceptanceRate,
      avgGpa: seed.avgGpa,
      satRangeMin: seed.satRange[0],
      satRangeMax: seed.satRange[1],
      actRangeMin: seed.actRange[0],
      actRangeMax: seed.actRange[1],
      graduationRate: seed.graduationRate,
      studentFacultyRatio: seed.studentFacultyRatio,
      tuitionInState: seed.tuitionInState ?? null,
      tuitionOutOfState: seed.tuitionOutOfState ?? null,
      tuitionInternational: seed.tuitionInternational,
      roomAndBoard: seed.roomAndBoard,
      estimatedTotalCostInternational:
        seed.estimatedTotalCost ?? seed.tuitionInternational + seed.roomAndBoard,
      internationalAidAvailable: seed.intlAid,
      meritScholarshipsAvailable: seed.meritScholarships ?? null,
      needBasedAidAvailable: seed.needBasedAid ?? null,
      meetsFullNeed: seed.meetsFullNeed ?? null,
      avgAidInternational: seed.avgAid ?? null,
      internationalPercentage: seed.intlPercentage,
      internationalPopulation: seed.intlPopulation ?? Math.round(seed.intlPercentage / 100 * seed.undergradEnrollment),
      englishProficiencyRequirement: seed.toeflMin ? `TOEFL ${seed.toeflMin}+ / IELTS ${seed.ieltsMin ?? 6.5}+` : null,
      toeflMinimum: seed.toeflMin ?? null,
      ieltsMinimum: seed.ieltsMin ?? null,
      i20Support: true,
      optAvailable: true,
      housing: seed.housing ?? "On-campus housing available",
      clubsCount: seed.clubs ?? defaultClubs(seed.sizeCategory),
      sports: seed.sports ?? defaultSports(seed.sizeCategory),
      greekLife: seed.greekLife ?? seed.type === "PUBLIC",
      image,
      coverImage: image,
      tags: seed.tags,
      featured: seed.featured ?? false,
      isDemoData: true,
      dataSource: "COLLEGIA demo dataset (not verified)",
      dataSourceUrl: null,
      dataCollectedAt: new Date(),
      dataYear: DATA_YEAR,
      verificationStatus: "DEMO",
    },
    create: {
      slug: seed.slug,
      name: seed.name,
      shortName: seed.shortName ?? null,
      website: seed.website ?? null,
      city: seed.city,
      state: seed.state,
      stateCode: seed.stateCode,
      region: seed.region,
      type: seed.type,
      setting: seed.setting,
      sizeCategory: seed.sizeCategory,
      undergraduateEnrollment: seed.undergradEnrollment,
      acceptanceRate: seed.acceptanceRate,
      avgGpa: seed.avgGpa,
      satRangeMin: seed.satRange[0],
      satRangeMax: seed.satRange[1],
      actRangeMin: seed.actRange[0],
      actRangeMax: seed.actRange[1],
      graduationRate: seed.graduationRate,
      studentFacultyRatio: seed.studentFacultyRatio,
      tuitionInState: seed.tuitionInState ?? null,
      tuitionOutOfState: seed.tuitionOutOfState ?? null,
      tuitionInternational: seed.tuitionInternational,
      roomAndBoard: seed.roomAndBoard,
      estimatedTotalCostInternational:
        seed.estimatedTotalCost ?? seed.tuitionInternational + seed.roomAndBoard,
      internationalAidAvailable: seed.intlAid,
      meritScholarshipsAvailable: seed.meritScholarships ?? null,
      needBasedAidAvailable: seed.needBasedAid ?? null,
      meetsFullNeed: seed.meetsFullNeed ?? null,
      avgAidInternational: seed.avgAid ?? null,
      internationalPercentage: seed.intlPercentage,
      internationalPopulation: seed.intlPopulation ?? Math.round(seed.intlPercentage / 100 * seed.undergradEnrollment),
      englishProficiencyRequirement: seed.toeflMin ? `TOEFL ${seed.toeflMin}+ / IELTS ${seed.ieltsMin ?? 6.5}+` : null,
      toeflMinimum: seed.toeflMin ?? null,
      ieltsMinimum: seed.ieltsMin ?? null,
      i20Support: true,
      optAvailable: true,
      housing: seed.housing ?? "On-campus housing available",
      clubsCount: seed.clubs ?? defaultClubs(seed.sizeCategory),
      sports: seed.sports ?? defaultSports(seed.sizeCategory),
      greekLife: seed.greekLife ?? seed.type === "PUBLIC",
      image,
      coverImage: image,
      tags: seed.tags,
      featured: seed.featured ?? false,
      isDemoData: true,
      dataSource: "COLLEGIA demo dataset (not verified)",
      dataSourceUrl: null,
      dataCollectedAt: new Date(),
      dataYear: DATA_YEAR,
      verificationStatus: "DEMO",
    },
  });

  // Reset child relations so re-seeding stays consistent.
  if (existing) {
    await prisma.collegeMajor.deleteMany({ where: { collegeId: college.id } });
    await prisma.applicationDeadline.deleteMany({ where: { collegeId: college.id } });
    await prisma.collegeStatistic.deleteMany({ where: { collegeId: college.id } });
  }

  // Majors
  for (const majorId of strongProgramIds) {
    await prisma.collegeMajor.create({
      data: { collegeId: college.id, majorId, isStrongProgram: true, strength: 5 },
    });
  }

  // Deadlines
  const deadlineRows: { plan: "EARLY_ACTION" | "EARLY_DECISION" | "REGULAR_DECISION" | "ROLLING"; date: Date | null; label: string }[] = [];
  if (seed.earlyAction) {
    const d = parseDeadline(seed.earlyAction);
    deadlineRows.push({ plan: "EARLY_ACTION", date: d, label: deadlineLabel(d) });
  }
  if (seed.earlyDecision) {
    const d = parseDeadline(seed.earlyDecision);
    deadlineRows.push({ plan: "EARLY_DECISION", date: d, label: deadlineLabel(d) });
  }
  if (seed.regularDecision) {
    const d = parseDeadline(seed.regularDecision);
    deadlineRows.push({ plan: "REGULAR_DECISION", date: d, label: deadlineLabel(d) });
  }
  if (seed.rolling || (!seed.earlyAction && !seed.earlyDecision && !seed.regularDecision)) {
    deadlineRows.push({ plan: "ROLLING", date: null, label: "Rolling" });
  }
  for (const row of deadlineRows) {
    await prisma.applicationDeadline.create({
      data: {
        collegeId: college.id,
        plan: row.plan,
        date: row.date,
        deadlineDescription: row.label,
        isPriorityDeadline: row.plan === "EARLY_DECISION",
      },
    });
  }

  // Statistics snapshot (archival, for future verified data).
  await prisma.collegeStatistic.create({
    data: {
      collegeId: college.id,
      dataYear: DATA_YEAR,
      acceptanceRate: seed.acceptanceRate,
      avgGpa: seed.avgGpa,
      satRangeMin: seed.satRange[0],
      satRangeMax: seed.satRange[1],
      actRangeMin: seed.actRange[0],
      actRangeMax: seed.actRange[1],
      internationalPercentage: seed.intlPercentage,
      internationalPopulation: seed.intlPopulation ?? Math.round(seed.intlPercentage / 100 * seed.undergradEnrollment),
      graduationRate: seed.graduationRate,
      undergraduateEnrollment: seed.undergradEnrollment,
      isDemoData: true,
      dataSource: "COLLEGIA demo dataset (not verified)",
      dataSourceUrl: null,
      dataCollectedAt: new Date(),
      verificationStatus: "DEMO",
    },
  });

  return college;
}

async function seedDemoUser() {
  const user = await prisma.user.upsert({
    where: { email: "demo@collegia.app" },
    update: {
      firstName: "Aiko",
      lastName: "Tanaka",
      role: "STUDENT",
    },
    create: {
      email: "demo@collegia.app",
      firstName: "Aiko",
      lastName: "Tanaka",
      role: "STUDENT",
    },
  });

  await prisma.studentProfile.upsert({
    where: { userId: user.id },
    update: {
      firstName: "Aiko",
      lastName: "Tanaka",
      country: "Japan",
      isInternationalStudent: true,
      gpa: 3.6,
      gpaScale: 4.0,
      satScore: 1320,
      classYear: 2028,
      intendedMajor: "Engineering",
      applicationYear: 2027,
      intendedEnrollmentYear: 2028,
    },
    create: {
      userId: user.id,
      firstName: "Aiko",
      lastName: "Tanaka",
      country: "Japan",
      isInternationalStudent: true,
      gpa: 3.6,
      gpaScale: 4.0,
      satScore: 1320,
      classYear: 2028,
      intendedMajor: "Engineering",
      applicationYear: 2027,
      intendedEnrollmentYear: 2028,
    },
  });

  await prisma.collegePreference.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      preferredStates: [],
      preferredRegions: ["East Coast", "West Coast"],
      preferredSizes: ["Medium", "Large"],
      publicPrivate: [],
      settings: [],
      sports: ["Soccer", "Track & Field"],
      clubs: ["Robotics"],
      interests: ["Technology", "Robotics", "Sports"],
    },
  });

  await prisma.financialAidProfile.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      annualBudget: 35000,
      requiresFinancialAid: true,
      requiresScholarship: true,
      currency: "USD",
      fundingSource: "Family savings",
    },
  });

  await prisma.internationalProfile.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      country: "Japan",
      englishProficiencyTest: "TOEFL",
      englishProficiencyScore: 105,
      visaType: "F-1",
      needsI20Support: true,
    },
  });

  return user;
}

async function seedDemoSavedColleges(userId: string) {
  const featured = await prisma.college.findMany({
    where: { featured: true },
    orderBy: [{ featured: "desc" }, { name: "asc" }],
    take: 6,
  });
  const classifications = ["STRONG_MATCH", "TARGET", "TARGET", "REACH", "REACH", "STRONG_MATCH"] as const;
  const scores = [84, 72, 68, 55, 49, 87];

  for (let i = 0; i < Math.min(featured.length, 6); i++) {
    const college = featured[i];
    await prisma.savedCollege.upsert({
      where: { userId_collegeId: { userId, collegeId: college.id } },
      update: {
        matchClassification: classifications[i],
        matchScore: scores[i],
      },
      create: {
        userId,
        collegeId: college.id,
        matchClassification: classifications[i],
        matchScore: scores[i],
        savedAt: new Date(),
      },
    });
  }

  // Remove any saved colleges that are no longer part of the demo list
  // so re-seeding stays deterministic.
  await prisma.savedCollege.deleteMany({
    where: { userId, NOT: { collegeId: { in: featured.slice(0, 6).map((c) => c.id) } } },
  });
}

async function seedDemoGoals(userId: string) {
  const goals = [
    {
      title: "Reach 1400 SAT",
      description: "Focus on Math section — aim for 750+ to boost your score significantly.",
      currentValue: 1320,
      targetValue: 1400,
      unit: "points",
      category: "TESTING",
      priority: "HIGH",
    },
    {
      title: "Strengthen GPA",
      description: "Maintain strong grades in your remaining semesters. Focus on science and math.",
      currentValue: 3.6,
      targetValue: 3.8,
      unit: "GPA",
      category: "ACADEMIC",
      priority: "HIGH",
    },
    {
      title: "Build Extracurriculars",
      description: "Add 1-2 meaningful activities aligned with Engineering. Consider IEEE, hackathons, or research.",
      currentValue: 2,
      targetValue: 4,
      unit: "activities",
      category: "EXTRACURRICULAR",
      priority: "MEDIUM",
    },
  ] as const;

  const existing = await prisma.goal.findMany({ where: { userId } });
  if (existing.length > 0) return;

  for (const g of goals) {
    await prisma.goal.create({
      data: {
        userId,
        title: g.title,
        description: g.description,
        currentValue: g.currentValue,
        targetValue: g.targetValue,
        unit: g.unit,
        category: g.category,
        priority: g.priority,
        status: "ACTIVE",
      },
    });
  }
}

// ============================================================
// DEMO MATCH SCORE SEEDING
//
// Computes REAL Collegia Match v1 scores with the deterministic
// engine for the demo saved colleges using the demo student's
// profile. Rows are flagged isDemo=true (data quality, not the
// scoring itself) and the engineVersion is the official
// "collegia-match-v1".
// ============================================================

async function seedDemoMatchScores(userId: string) {
  const saved = await prisma.savedCollege.findMany({
    where: { userId },
    include: {
      college: {
        include: {
          majors: {
            select: {
              strength: true,
              isStrongProgram: true,
              major: { select: { name: true, category: true } },
            },
          },
          deadlines: { select: { plan: true, deadlineDescription: true, date: true } },
        },
      },
    },
  });

  const [profile, preferences, financial, international] = await Promise.all([
    prisma.studentProfile.findUnique({ where: { userId } }),
    prisma.collegePreference.findUnique({ where: { userId } }),
    prisma.financialAidProfile.findUnique({ where: { userId } }),
    prisma.internationalProfile.findUnique({ where: { userId } }),
  ]);

  let intendedMajorCategory: string | null = null;
  if (profile?.intendedMajor) {
    const major = await prisma.major.findUnique({ where: { name: profile.intendedMajor } });
    intendedMajorCategory = major?.category ?? null;
  }

  const engineProfile: EngineProfile = {
    gpa: profile?.gpa ?? null,
    gpaScale: profile?.gpaScale ?? null,
    sat: profile?.satScore ?? null,
    act: profile?.actScore ?? null,
    intendedMajor: profile?.intendedMajor ?? null,
    intendedMajorCategory,
    preferredStates: preferences?.preferredStates ?? [],
    preferredRegions: preferences?.preferredRegions ?? [],
    preferredSizes: preferences?.preferredSizes ?? [],
    publicPrivate: preferences?.publicPrivate ?? [],
    preferredSettings: preferences?.settings ?? [],
    sports: preferences?.sports ?? [],
    clubs: preferences?.clubs ?? [],
    interests: preferences?.interests ?? [],
    annualBudget: financial?.annualBudget ?? null,
    requiresFinancialAid: financial?.requiresFinancialAid ?? null,
    requiresScholarship: financial?.requiresScholarship ?? null,
    isInternationalStudent: profile?.isInternationalStudent ?? false,
    englishProficiencyScore: international?.englishProficiencyScore ?? null,
    ieltsScore: international?.ieltsScore ?? null,
  };

  for (const row of saved) {
    const college = row.college as unknown as CollegeWithRelations;
    const result = computeMatch(engineProfile, collegeToEngineCollege(college));

    await prisma.$transaction(async (tx) => {
      const existing = await tx.matchScore.findUnique({
        where: { userId_collegeId: { userId, collegeId: row.college.id } },
        select: { matchScore: true, classification: true },
      });

      const changed =
        !existing || existing.matchScore !== result.score || existing.classification !== result.classification;

      const matchScore = await tx.matchScore.upsert({
        where: { userId_collegeId: { userId, collegeId: row.college.id } },
        update: {
          matchScore: result.score,
          classification: result.classification,
          engineVersion: result.engineVersion,
          isDemo: true,
          computedAt: new Date(),
        },
        create: {
          userId,
          collegeId: row.college.id,
          matchScore: result.score,
          classification: result.classification,
          engineVersion: result.engineVersion,
          isDemo: true,
          computedAt: new Date(),
        },
      });

      await tx.matchDimensionScore.deleteMany({ where: { matchScoreId: matchScore.id } });
      await tx.matchDimensionScore.createMany({
        data: result.dimensions.map((d) => ({
          matchScoreId: matchScore.id,
          dimension: d.dimension,
          label: d.label,
          score: d.score,
          confidence: d.confidence,
          reasons: d.reasons,
        })),
      });

      if (changed) {
        await tx.matchHistory.create({
          data: {
            userId,
            collegeId: row.college.id,
            matchScore: result.score,
            classification: result.classification,
            engineVersion: result.engineVersion,
            isDemo: true,
          },
        });
      }

      await tx.savedCollege.update({
        where: { userId_collegeId: { userId, collegeId: row.college.id } },
        data: { matchScore: result.score, matchClassification: result.classification },
      });
    });
  }
}

async function seedDemoRecommendations(userId: string) {
  const existing = await prisma.recommendation.findMany({ where: { userId } });
  if (existing.length > 0) return;

  const goals = await prisma.goal.findMany({ where: { userId } });
  const goalByTitle = new Map(goals.map((g) => [g.title, g.id]));

  const recommendations: {
    category: "ACADEMIC" | "TESTING" | "EXTRACURRICULAR" | "FINANCIAL" | "INTERNATIONAL" | "COLLEGE_LIST" | "GENERAL";
    title: string;
    description: string;
    suggestedAction: string;
    potentialImpact: number;
    goalTitle?: string;
  }[] = [
    {
      category: "TESTING",
      title: "Improve SAT score",
      description: "Your current SAT is below the typical range at several of your Target colleges.",
      suggestedAction: "Focus on Math section practice — aiming for 1400+ can strengthen your Academic Fit.",
      potentialImpact: 5,
      goalTitle: "Reach 1400 SAT",
    },
    {
      category: "EXTRACURRICULAR",
      title: "Strengthen extracurricular profile",
      description: "Colleges look for meaningful engagement aligned with your intended major.",
      suggestedAction: "Add a relevant project, competition, leadership activity, internship, or other meaningful experience related to Engineering.",
      potentialImpact: 4,
      goalTitle: "Build Extracurriculars",
    },
    {
      category: "FINANCIAL",
      title: "Research financial aid",
      description: "Your budget is below the estimated cost of attendance for many colleges on your list.",
      suggestedAction: "Explore colleges with stronger international merit aid opportunities and budget-conscious options.",
      potentialImpact: 3,
    },
  ];

  for (const rec of recommendations) {
    await prisma.recommendation.create({
      data: {
        userId,
        category: rec.category,
        title: rec.title,
        description: rec.description,
        suggestedAction: rec.suggestedAction,
        potentialImpact: rec.potentialImpact,
        status: "OPEN",
        source: "improvement-engine",
        goalId: rec.goalTitle ? (goalByTitle.get(rec.goalTitle) ?? null) : null,
      },
    });
  }
}

async function main() {
  console.log("Seeding majors...");
  const majorIdByName = await seedMajorsData();
  console.log(`  ${majorIdByName.size} majors ready.`);

  console.log("Seeding colleges...");
  const seen = new Set<string>();
  const allSeeds: SeedCollege[] = [];
  for (const seed of [...seedColleges, ...seedCollegesExtra, ...seedCollegesPathway]) {
    if (seen.has(seed.slug)) {
      console.warn(`  WARN: duplicate slug skipped: ${seed.slug}`);
      continue;
    }
    seen.add(seed.slug);
    allSeeds.push(seed);
  }
  let count = 0;
  for (const seed of allSeeds) {
    await seedCollege(seed, majorIdByName);
    count += 1;
  }
  console.log(`  ${count} colleges seeded.`);

  console.log("Seeding demo user...");
  const user = await seedDemoUser();
  console.log("  Demo user ready:", user.email);

  await seedDemoSavedColleges(user.id);
  console.log("  Demo saved colleges ready.");

  await seedDemoGoals(user.id);
  console.log("  Demo goals ready.");

  await seedDemoMatchScores(user.id);
  console.log("  Demo match scores ready.");

  await seedDemoRecommendations(user.id);
  console.log("  Demo recommendations ready.");

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
