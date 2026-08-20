// ============================================================
// COLLEGIA — Pathway / Community College Seed Colleges
//
// 2-year community colleges and open-admission 4-year
// stepping-stone institutions. These give weak-academic profiles
// realistic, honest options: a 2.0 GPA student is below the
// reported bar of nearly every 4-year university, so the catalog
// includes legitimate transfer pathways instead of pretending
// those universities are realistic.
//
// Community colleges are tagged "Community College" and "2-Year".
// The Match List Builder uses those tags to build the "Pathway"
// tier (see college-list-builder.service.ts).
//
// Same contract as colleges.ts: DEMO placeholders only, seeded
// with isDemoData=true / verificationStatus=DEMO.
// ============================================================

import type { SeedCollege } from "./colleges";

const IMG = {
  boston: "/images/campus_boston.jpg",
  florida: "/images/campus_florida.jpg",
  nyc: "/images/campus_nyc.jpg",
  california: "/images/campus_california.jpg",
  hero: "/images/hero_campus.jpg",
};

function regionImage(region: SeedCollege["region"]): string {
  if (region === "WEST_COAST" || region === "SOUTHWEST") return IMG.california;
  if (region === "NORTHEAST" || region === "EAST_COAST") return IMG.boston;
  if (region === "SOUTH") return IMG.florida;
  return IMG.hero;
}

type PathwayInput = {
  name: string;
  slug: string;
  shortName?: string;
  city: string;
  state: string;
  stateCode: string;
  region: SeedCollege["region"];
  setting?: "URBAN" | "SUBURBAN" | "RURAL";
  sizeCategory?: "SMALL" | "MEDIUM" | "LARGE";
  undergradEnrollment: number;
  avgGpa: number;
  satRange: [number, number];
  actRange: [number, number];
  graduationRate: number;
  tuitionInternational: number;
  roomAndBoard: number;
  communityCollege?: boolean;
  intlPercentage?: number;
  strongPrograms: string[];
  tags: string[];
};

function p(i: PathwayInput): SeedCollege {
  const communityCollege = i.communityCollege ?? true;
  const baseTags = communityCollege
    ? ["Community College", "2-Year", "Associate Degree", "Transfer-friendly", "Open Admission"]
    : ["Open Admission", "Accessible"];
  return {
    name: i.name,
    slug: i.slug,
    shortName: i.shortName,
    city: i.city,
    state: i.state,
    stateCode: i.stateCode,
    region: i.region,
    type: "PUBLIC",
    setting: i.setting ?? "URBAN",
    sizeCategory: i.sizeCategory ?? "LARGE",
    undergradEnrollment: i.undergradEnrollment,
    acceptanceRate: 100,
    avgGpa: i.avgGpa,
    satRange: i.satRange,
    actRange: i.actRange,
    graduationRate: i.graduationRate,
    studentFacultyRatio: "20:1",
    tuitionInState: Math.round(i.tuitionInternational * 0.7),
    tuitionOutOfState: i.tuitionInternational,
    tuitionInternational: i.tuitionInternational,
    roomAndBoard: i.roomAndBoard,
    estimatedTotalCost: i.tuitionInternational + i.roomAndBoard,
    intlAid: true,
    meritScholarships: true,
    needBasedAid: true,
    meetsFullNeed: false,
    intlPercentage: i.intlPercentage ?? 4,
    toeflMin: 61,
    ieltsMin: 5.5,
    greekLife: false,
    website: `https://www.${i.slug}.edu`,
    image: regionImage(i.region),
    tags: [...baseTags, ...i.tags],
    strongPrograms: i.strongPrograms,
    rolling: true,
  };
}

// ============================================================
// COMMUNITY COLLEGES / 2-YEAR INSTITUTIONS
// ============================================================

const COMMUNITY_COLLEGES: SeedCollege[] = [
  p({
    name: "Miami Dade College", slug: "miami-dade-college", shortName: "MDC",
    city: "Miami", state: "Florida", stateCode: "FL", region: "SOUTH",
    undergradEnrollment: 45000, avgGpa: 2.9, satRange: [850, 1050], actRange: [15, 20],
    graduationRate: 38, tuitionInternational: 11000, roomAndBoard: 7500,
    intlPercentage: 8,
    tags: ["Florida", "Largest CC"],
    strongPrograms: ["Business", "Computer Science", "Nursing", "Health Sciences", "Communications", "Psychology"],
  }),
  p({
    name: "Broward College", slug: "broward-college", shortName: "Broward",
    city: "Fort Lauderdale", state: "Florida", stateCode: "FL", region: "SOUTH",
    undergradEnrollment: 35000, avgGpa: 2.8, satRange: [850, 1050], actRange: [15, 20],
    graduationRate: 40, tuitionInternational: 11000, roomAndBoard: 7500,
    intlPercentage: 5,
    tags: ["Florida", "Transfer"],
    strongPrograms: ["Business", "Nursing", "Health Sciences", "Criminal Justice", "Communications"],
  }),
  p({
    name: "Valencia College", slug: "valencia-college", shortName: "Valencia",
    city: "Orlando", state: "Florida", stateCode: "FL", region: "SOUTH",
    undergradEnrollment: 30000, avgGpa: 2.9, satRange: [860, 1060], actRange: [16, 21],
    graduationRate: 44, tuitionInternational: 11000, roomAndBoard: 7500,
    intlPercentage: 5,
    tags: ["Florida", "DirectConnect", "Transfer"],
    strongPrograms: ["Business", "Computer Science", "Nursing", "Engineering", "Communications"],
  }),
  p({
    name: "Hillsborough Community College", slug: "hillsborough-community-college", shortName: "HCC",
    city: "Tampa", state: "Florida", stateCode: "FL", region: "SOUTH",
    undergradEnrollment: 22000, avgGpa: 2.8, satRange: [840, 1040], actRange: [15, 20],
    graduationRate: 37, tuitionInternational: 10500, roomAndBoard: 7200,
    intlPercentage: 3,
    tags: ["Florida", "Transfer"],
    strongPrograms: ["Business", "Nursing", "Health Sciences", "Education", "Criminal Justice"],
  }),
  p({
    name: "Northern Virginia Community College", slug: "northern-virginia-community-college", shortName: "NOVA",
    city: "Annandale", state: "Virginia", stateCode: "VA", region: "EAST_COAST",
    undergradEnrollment: 45000, avgGpa: 2.9, satRange: [860, 1060], actRange: [16, 21],
    graduationRate: 41, tuitionInternational: 11500, roomAndBoard: 7600,
    intlPercentage: 7,
    tags: ["Virginia", "Transfer", "VCCS"],
    strongPrograms: ["Business", "Computer Science", "Engineering", "Nursing", "Cybersecurity"],
  }),
  p({
    name: "Montgomery College", slug: "montgomery-college", shortName: "Montgomery",
    city: "Rockville", state: "Maryland", stateCode: "MD", region: "EAST_COAST",
    undergradEnrollment: 25000, avgGpa: 2.9, satRange: [860, 1060], actRange: [16, 21],
    graduationRate: 42, tuitionInternational: 12000, roomAndBoard: 7800,
    intlPercentage: 6,
    tags: ["Maryland", "Transfer", "Washington DC Area"],
    strongPrograms: ["Business", "Computer Science", "Engineering", "Health Sciences", "Biology"],
  }),
  p({
    name: "Community College of Philadelphia", slug: "community-college-of-philadelphia", shortName: "CCP",
    city: "Philadelphia", state: "Pennsylvania", stateCode: "PA", region: "NORTHEAST",
    undergradEnrollment: 15000, avgGpa: 2.8, satRange: [830, 1030], actRange: [15, 20],
    graduationRate: 35, tuitionInternational: 12500, roomAndBoard: 7000,
    intlPercentage: 3,
    tags: ["Pennsylvania", "Urban", "Transfer"],
    strongPrograms: ["Business", "Nursing", "Health Sciences", "Criminal Justice", "Social Work"],
  }),
  p({
    name: "Bunker Hill Community College", slug: "bunker-hill-community-college", shortName: "BHCC",
    city: "Boston", state: "Massachusetts", stateCode: "MA", region: "NORTHEAST",
    setting: "URBAN", sizeCategory: "MEDIUM", undergradEnrollment: 9000,
    avgGpa: 2.8, satRange: [830, 1030], actRange: [15, 20],
    graduationRate: 34, tuitionInternational: 11000, roomAndBoard: 8000,
    intlPercentage: 8,
    tags: ["Massachusetts", "Urban", "Transfer"],
    strongPrograms: ["Business", "Computer Science", "Nursing", "Health Sciences", "Hospitality Management"],
  }),
  p({
    name: "Hudson County Community College", slug: "hudson-county-community-college", shortName: "HCCC",
    city: "Jersey City", state: "New Jersey", stateCode: "NJ", region: "NORTHEAST",
    setting: "URBAN", sizeCategory: "MEDIUM", undergradEnrollment: 8000,
    avgGpa: 2.7, satRange: [830, 1030], actRange: [15, 20],
    graduationRate: 33, tuitionInternational: 11500, roomAndBoard: 7500,
    intlPercentage: 6,
    tags: ["New Jersey", "NYC Area", "Transfer"],
    strongPrograms: ["Business", "Criminal Justice", "Nursing", "Communications", "Social Work"],
  }),
  p({
    name: "Cuyahoga Community College", slug: "cuyahoga-community-college", shortName: "Tri-C",
    city: "Cleveland", state: "Ohio", stateCode: "OH", region: "MIDWEST",
    undergradEnrollment: 22000, avgGpa: 2.7, satRange: [830, 1030], actRange: [15, 20],
    graduationRate: 32, tuitionInternational: 10000, roomAndBoard: 7000,
    intlPercentage: 3,
    tags: ["Ohio", "Transfer", "Urban"],
    strongPrograms: ["Business", "Nursing", "Engineering", "Health Sciences", "Social Work"],
  }),
  p({
    name: "Macomb Community College", slug: "macomb-community-college", shortName: "Macomb",
    city: "Warren", state: "Michigan", stateCode: "MI", region: "MIDWEST",
    undergradEnrollment: 21000, avgGpa: 2.7, satRange: [830, 1030], actRange: [15, 20],
    graduationRate: 31, tuitionInternational: 10000, roomAndBoard: 7000,
    intlPercentage: 3,
    tags: ["Michigan", "Transfer", "Detroit Area"],
    strongPrograms: ["Business", "Engineering", "Nursing", "Computer Science", "Criminal Justice"],
  }),
  p({
    name: "Harold Washington College", slug: "harold-washington-college", shortName: "Harold Washington",
    city: "Chicago", state: "Illinois", stateCode: "IL", region: "MIDWEST",
    setting: "URBAN", sizeCategory: "MEDIUM", undergradEnrollment: 10000,
    avgGpa: 2.6, satRange: [820, 1020], actRange: [15, 20],
    graduationRate: 30, tuitionInternational: 11500, roomAndBoard: 7500,
    intlPercentage: 4,
    tags: ["Illinois", "City Colleges of Chicago", "Transfer"],
    strongPrograms: ["Business", "Computer Science", "Communications", "Criminal Justice", "Design"],
  }),
  p({
    name: "Houston Community College", slug: "houston-community-college", shortName: "HCC",
    city: "Houston", state: "Texas", stateCode: "TX", region: "SOUTH",
    undergradEnrollment: 45000, avgGpa: 2.7, satRange: [830, 1030], actRange: [15, 20],
    graduationRate: 34, tuitionInternational: 10500, roomAndBoard: 7200,
    intlPercentage: 6,
    tags: ["Texas", "Transfer", "Houston"],
    strongPrograms: ["Business", "Computer Science", "Nursing", "Engineering", "Health Sciences"],
  }),
  p({
    name: "Lone Star College", slug: "lone-star-college", shortName: "Lone Star",
    city: "The Woodlands", state: "Texas", stateCode: "TX", region: "SOUTH",
    undergradEnrollment: 70000, avgGpa: 2.8, satRange: [840, 1040], actRange: [15, 20],
    graduationRate: 36, tuitionInternational: 10500, roomAndBoard: 7200,
    intlPercentage: 4,
    tags: ["Texas", "Transfer", "Houston Area"],
    strongPrograms: ["Business", "Nursing", "Engineering", "Computer Science", "Health Sciences"],
  }),
  p({
    name: "Austin Community College", slug: "austin-community-college", shortName: "ACC",
    city: "Austin", state: "Texas", stateCode: "TX", region: "SOUTH",
    undergradEnrollment: 50000, avgGpa: 2.8, satRange: [840, 1040], actRange: [15, 20],
    graduationRate: 35, tuitionInternational: 10500, roomAndBoard: 7300,
    intlPercentage: 5,
    tags: ["Texas", "Transfer", "Austin"],
    strongPrograms: ["Business", "Computer Science", "Nursing", "Engineering", "Design"],
  }),
  p({
    name: "El Paso Community College", slug: "el-paso-community-college", shortName: "EPCC",
    city: "El Paso", state: "Texas", stateCode: "TX", region: "SOUTHWEST",
    undergradEnrollment: 28000, avgGpa: 2.6, satRange: [820, 1020], actRange: [15, 20],
    graduationRate: 30, tuitionInternational: 10000, roomAndBoard: 7000,
    intlPercentage: 3,
    tags: ["Texas", "Transfer", "Border"],
    strongPrograms: ["Business", "Nursing", "Engineering", "Health Sciences", "Criminal Justice"],
  }),
  p({
    name: "Pima Community College", slug: "pima-community-college", shortName: "Pima",
    city: "Tucson", state: "Arizona", stateCode: "AZ", region: "SOUTHWEST",
    undergradEnrollment: 32000, avgGpa: 2.7, satRange: [830, 1030], actRange: [15, 20],
    graduationRate: 32, tuitionInternational: 9500, roomAndBoard: 6800,
    intlPercentage: 3,
    tags: ["Arizona", "Transfer", "Tucson"],
    strongPrograms: ["Business", "Nursing", "Computer Science", "Engineering", "Health Sciences"],
  }),
  p({
    name: "Santa Monica College", slug: "santa-monica-college", shortName: "SMC",
    city: "Santa Monica", state: "California", stateCode: "CA", region: "WEST_COAST",
    undergradEnrollment: 27000, avgGpa: 2.9, satRange: [860, 1060], actRange: [16, 21],
    graduationRate: 40, tuitionInternational: 11000, roomAndBoard: 9000,
    intlPercentage: 12,
    tags: ["California", "Transfer", "UCLA Pathway"],
    strongPrograms: ["Business", "Computer Science", "Film", "Design", "Psychology", "Economics"],
  }),
  p({
    name: "De Anza College", slug: "de-anza-college", shortName: "De Anza",
    city: "Cupertino", state: "California", stateCode: "CA", region: "WEST_COAST",
    undergradEnrollment: 21000, avgGpa: 2.9, satRange: [860, 1060], actRange: [16, 21],
    graduationRate: 41, tuitionInternational: 11000, roomAndBoard: 9000,
    intlPercentage: 14,
    tags: ["California", "Transfer", "Silicon Valley"],
    strongPrograms: ["Computer Science", "Business", "Engineering", "Design", "Mathematics"],
  }),
  p({
    name: "City College of San Francisco", slug: "city-college-of-san-francisco", shortName: "CCSF",
    city: "San Francisco", state: "California", stateCode: "CA", region: "WEST_COAST",
    undergradEnrollment: 30000, avgGpa: 2.7, satRange: [830, 1030], actRange: [15, 20],
    graduationRate: 33, tuitionInternational: 10500, roomAndBoard: 9000,
    intlPercentage: 9,
    tags: ["California", "Transfer", "San Francisco"],
    strongPrograms: ["Business", "Computer Science", "Health Sciences", "Design", "Hospitality Management"],
  }),
];

// ============================================================
// OPEN-ADMISSION 4-YEAR STEPPING STONES
// ============================================================

const OPEN_ADMISSION_FOUR_YEAR: SeedCollege[] = [
  p({
    name: "Purdue University Northwest", slug: "purdue-university-northwest", shortName: "PNW",
    city: "Hammond", state: "Indiana", stateCode: "IN", region: "MIDWEST",
    undergradEnrollment: 8000, avgGpa: 2.9, satRange: [920, 1130], actRange: [17, 23],
    graduationRate: 45, tuitionInternational: 20000, roomAndBoard: 9500,
    communityCollege: false, intlPercentage: 3,
    tags: ["Indiana", "Chicago Area", "STEM"],
    strongPrograms: ["Engineering", "Business", "Computer Science", "Nursing", "Health Sciences"],
  }),
  p({
    name: "Bemidji State University", slug: "bemidji-state-university", shortName: "Bemidji State",
    city: "Bemidji", state: "Minnesota", stateCode: "MN", region: "MIDWEST",
    setting: "RURAL", sizeCategory: "SMALL", undergradEnrollment: 4500,
    avgGpa: 3.0, satRange: [920, 1140], actRange: [17, 23],
    graduationRate: 49, tuitionInternational: 19000, roomAndBoard: 9000,
    communityCollege: false, intlPercentage: 2,
    tags: ["Minnesota", "Northern Lakes"],
    strongPrograms: ["Business", "Education", "Biology", "Criminal Justice", "Environmental Science"],
  }),
];

export const seedCollegesPathway: SeedCollege[] = [
  ...COMMUNITY_COLLEGES,
  ...OPEN_ADMISSION_FOUR_YEAR,
];