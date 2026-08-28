import { test } from "node:test";
import assert from "node:assert/strict";
import { seedColleges } from "../prisma/seed-data/colleges";
import { seedCollegesExtra } from "../prisma/seed-data/colleges-extra";
import { seedCollegesPathway } from "../prisma/seed-data/colleges-pathway";
import type { SeedCollege } from "../prisma/seed-data/colleges";
import { computeMatch, type EngineCollege, type EngineProfile } from "../src/lib/services/match.engine";
import { buildBalancedList, type BalancedList } from "../src/lib/services/college-list-builder.service";
import {
  computeAcademicRelevance,
  institutionalSelectivityBand,
  type RelevancePool,
  type InstitutionalSelectivityBand,
} from "../src/lib/services/academic-relevance.service";

// ============================================================
// Regression: academic/selectivity relevance decides the pool,
// personal fit only ranks within it. A high Match Score must never
// turn a dramatically overqualified (or underqualified) college into
// a primary Target/Likely.
// ============================================================

function seedToEngine(s: SeedCollege): EngineCollege {
  return {
    id: s.slug,
    name: s.name,
    acceptanceRate: s.acceptanceRate,
    avgGpa: s.avgGpa,
    gpaScale: 4.0,
    satRangeMin: s.satRange[0],
    satRangeMax: s.satRange[1],
    actRangeMin: s.actRange[0],
    actRangeMax: s.actRange[1],
    graduationRate: s.graduationRate,
    estimatedTotalCost: s.estimatedTotalCost ?? s.tuitionInternational + s.roomAndBoard,
    internationalAidAvailable: s.intlAid,
    meritScholarshipsAvailable: s.meritScholarships ?? null,
    needBasedAidAvailable: s.needBasedAid ?? null,
    meetsFullNeed: s.meetsFullNeed ?? null,
    avgAidInternational: s.avgAid ?? null,
    region: s.region,
    stateCode: s.stateCode,
    setting: s.setting,
    sizeCategory: s.sizeCategory,
    type: s.type,
    housing: s.housing ?? null,
    sports: s.sports ?? [],
    tags: s.tags,
    clubsCount: s.clubs ?? null,
    internationalPercentage: s.intlPercentage,
    internationalPopulation: s.intlPopulation ?? null,
    i20Support: true,
    optAvailable: true,
    toeflMinimum: s.toeflMin ?? null,
    ieltsMinimum: s.ieltsMin ?? null,
    majors: (s.strongPrograms ?? []).map((name) => ({ name, category: null, strength: 5 })),
  };
}

const seen = new Set<string>();
const CATALOG: EngineCollege[] = [];
for (const s of [...seedColleges, ...seedCollegesExtra, ...seedCollegesPathway]) {
  if (seen.has(s.slug)) continue;
  seen.add(s.slug);
  CATALOG.push(seedToEngine(s));
}

function collegeByName(name: string): EngineCollege {
  const c = CATALOG.find((c) => c.name === name);
  assert.ok(c, `missing catalog college: ${name}`);
  return c;
}

function makeProfile(o: Partial<EngineProfile> = {}): EngineProfile {
  return {
    gpa: 3.6,
    gpaScale: 4.0,
    sat: 1320,
    act: null,
    intendedMajor: "Engineering",
    intendedMajorCategory: "STEM",
    preferredStates: [],
    preferredRegions: [],
    preferredSizes: [],
    publicPrivate: [],
    preferredSettings: [],
    sports: [],
    clubs: [],
    interests: ["Technology"],
    annualBudget: 50000,
    requiresFinancialAid: null,
    requiresScholarship: null,
    isInternationalStudent: false,
    englishProficiencyScore: null,
    ieltsScore: null,
    ...o,
  };
}

const STRONG = makeProfile({ gpa: 4.0, sat: 1600, intendedMajor: "Engineering", intendedMajorCategory: "STEM", annualBudget: 70000, preferredRegions: ["Northeast"] });
const MID = makeProfile({ gpa: 3.5, sat: 1400, intendedMajor: "Engineering", intendedMajorCategory: "STEM", annualBudget: 60000 });
const WEAK = makeProfile({ gpa: 2.0, sat: 1100, intendedMajor: "Business", intendedMajorCategory: "Business", annualBudget: 30000, preferredRegions: ["South"] });

function build(profile: EngineProfile): BalancedList {
  return buildBalancedList(profile, CATALOG.map((college) => ({ college, result: computeMatch(profile, college) })));
}

const PRIMARY = ["dream", "reach", "target", "likely"] as const;

function primaryIds(list: BalancedList): string[] {
  return PRIMARY.flatMap((t) => list[t].map((e) => e.college.name));
}

function poolFor(profile: EngineProfile, name: string): RelevancePool {
  return computeAcademicRelevance(profile, collegeByName(name)).pool;
}

function institutionalBandFor(profile: EngineProfile, name: string): InstitutionalSelectivityBand | null {
  return computeAcademicRelevance(profile, collegeByName(name)).institutionalBand;
}

// The originally reported bug: a 4.0 / 1600 student had Albany State,
// Bemidji, Bennett and Bethune-Cookman as Target and Arizona State,
// Auburn and Clemson as Likely because high Match Scores overrode
// academic/selectivity relevance.

test("1. the originally-reported overqualified schools are NEVER primary tiers for a 4.0/1600 profile", () => {
  const list = build(STRONG);
  const bugSchools = [
    "Albany State University",
    "Bennett College",
    "Bethune-Cookman University",
    "Bemidji State University",
    "Arizona State University",
    "Auburn University",
    "Clemson University",
  ];
  const inPrimary = primaryIds(list).filter((n) => bugSchools.includes(n));
  assert.deepEqual(inPrimary, [], `bug schools leaked into primary tiers: ${inPrimary.join(", ")}`);
});

test("2. every overqualified school lands in the SAFETY pool for a 4.0/1600 profile", () => {
  for (const name of [
    "Albany State University",
    "Bennett College",
    "Bethune-Cookman University",
    "Bemidji State University",
    "Arizona State University",
    "Auburn University",
    "Clemson University",
  ]) {
    assert.equal(poolFor(STRONG, name), "SAFETY", `${name} should be SAFETY for a 4.0/1600 profile`);
  }
});

test("3. the Safety tier is explicit, separated, and honestly explained", () => {
  const list = build(STRONG);
  assert.ok(list.safety.length > 0, "a 4.0/1600 profile should surface Safety options");
  for (const entry of list.safety) {
    assert.ok(entry.safetyNote, "every Safety entry must explain why it is a safety option");
    assert.match(entry.safetyNote, /safety option/);
    assert.doesNotMatch(entry.safetyNote, /chance|probabil|guarantee|odds/i);
  }
});

test("4. the Safety tier never appears for a weak profile", () => {
  const list = build(WEAK);
  assert.equal(list.safety.length, 0, "a 2.0/1100 student is never overqualified for anything");
});

test("5. highly selective colleges stay Reach (never Target/Likely) for a strong profile", () => {
  const list = build(STRONG);
  const gtTargetLike = [...list.target, ...list.likely].some((e) => e.college.name === "Georgia Institute of Technology");
  assert.equal(gtTargetLike, false, "Georgia Tech (17%) must never be Target/Likely");
  assert.equal(poolFor(STRONG, "Georgia Institute of Technology"), "AMBITIOUS", "Georgia Tech is a genuine Reach, not a Target");
  assert.ok(list.reach.length > 0, "a 4.0/1600 profile should have a non-empty Reach");
});

test("6. a mid profile keeps genuine open-admission schools as honest Likely", () => {
  const list = build(MID);
  assert.ok(list.likely.some((e) => e.college.name === "Arizona State University"), "ASU (90%, avg 3.5) is a legitimate Likely for a 3.5/1400 profile");
});

test("7. a weak profile still gets realistic options plus the Pathway tier", () => {
  const list = build(WEAK);
  assert.ok(list.pathway.length > 0, "Pathway should be surfaced for a 2.0/1100 profile");
  assert.ok(list.likely.some((e) => e.college.name === "Bennett College"), "Bennett (85% admit, at-bar) is an honest Likely for a 2.0 profile");
  assert.ok(list.target.some((e) => e.college.name === "Bethune-Cookman University"), "Bethune-Cookman is an at-the-edge Target for a 2.0 profile");
});

test("8. relevance pools are data-driven, not hardcoded per university", () => {
  assert.equal(poolFor(STRONG, "Arizona State University"), "SAFETY"); // 90% admit
  assert.equal(poolFor(STRONG, "Georgia Institute of Technology"), "AMBITIOUS"); // 17% admit
  assert.equal(poolFor(MID, "Bethune-Cookman University"), "SAFETY"); // 3.5 above a 2.6 bar
  assert.equal(poolFor(WEAK, "Bennett College"), "REALISTIC"); // at/above the bar of an open-admission school
});

test("9. institutional selectivity bands follow multi-factor thresholds", () => {
  // These test the new multi-factor institutional selectivity system
  // The exact bands depend on the full catalog data (acceptance rate + GPA + SAT + graduation rate)
  const asu = collegeByName("Arizona State University");
  const gt = collegeByName("Georgia Institute of Technology");
  const harvard = collegeByName("Harvard University");
  const mit = collegeByName("MIT");
  const stanford = collegeByName("Stanford University");
  const yale = collegeByName("Yale University");
  const princeton = collegeByName("Princeton University");
  const columbia = collegeByName("Columbia University");
  const penn = collegeByName("University of Pennsylvania");
  const duke = collegeByName("Duke University");
  const vanderbilt = collegeByName("Vanderbilt University");
  const rice = collegeByName("Rice University");
  const northwestern = collegeByName("Northwestern University");
  const uchicago = collegeByName("University of Chicago");
  const dartmouth = collegeByName("Dartmouth College");
  const brown = collegeByName("Brown University");
  const jhu = collegeByName("Johns Hopkins University");

  // Ultra-elite schools (HYPSM + UChicago + Duke-class)
  assert.ok(institutionalSelectivityBand(harvard) === "ULTRA_ELITE" || institutionalSelectivityBand(harvard) === "VERY_HIGH");
  assert.ok(institutionalSelectivityBand(mit) === "ULTRA_ELITE" || institutionalSelectivityBand(mit) === "VERY_HIGH");
  assert.ok(institutionalSelectivityBand(stanford) === "ULTRA_ELITE" || institutionalSelectivityBand(stanford) === "VERY_HIGH");
  assert.ok(institutionalSelectivityBand(yale) === "ULTRA_ELITE" || institutionalSelectivityBand(yale) === "VERY_HIGH");
  assert.ok(institutionalSelectivityBand(princeton) === "ULTRA_ELITE" || institutionalSelectivityBand(princeton) === "VERY_HIGH");
  assert.ok(institutionalSelectivityBand(columbia) === "ULTRA_ELITE" || institutionalSelectivityBand(columbia) === "VERY_HIGH");
  assert.ok(institutionalSelectivityBand(penn) === "ULTRA_ELITE" || institutionalSelectivityBand(penn) === "VERY_HIGH");
  assert.ok(institutionalSelectivityBand(duke) === "ULTRA_ELITE" || institutionalSelectivityBand(duke) === "VERY_HIGH");
  assert.ok(institutionalSelectivityBand(uchicago) === "ULTRA_ELITE" || institutionalSelectivityBand(uchicago) === "VERY_HIGH");

  // Georgia Tech should be VERY_HIGH or HIGH (17% admit, 4.0 GPA, 1370 SAT)
  assert.ok(
    institutionalSelectivityBand(gt) === "VERY_HIGH" ||
    institutionalSelectivityBand(gt) === "HIGH",
    `Georgia Tech band: ${institutionalSelectivityBand(gt)}`
  );

  // ASU should be ACCESSIBLE or MODERATE (90% admit, 3.5 GPA)
  assert.ok(
    institutionalSelectivityBand(asu) === "ACCESSIBLE" ||
    institutionalSelectivityBand(asu) === "MODERATE",
    `ASU band: ${institutionalSelectivityBand(asu)}`
  );
});

test("10. preference differences re-order the same academic universe, never a different one", () => {
  const eng = build(makeProfile({ gpa: 4.0, sat: 1600, intendedMajor: "Engineering", intendedMajorCategory: "STEM", annualBudget: 70000, preferredRegions: ["Northeast"], preferredSizes: ["Large"], publicPrivate: ["PRIVATE"] }));
  const bus = build(makeProfile({ gpa: 4.0, sat: 1600, intendedMajor: "Business", intendedMajorCategory: "Business", annualBudget: 70000, preferredRegions: ["South"], preferredSizes: ["Large"], publicPrivate: ["PUBLIC"] }));
  const engIds = primaryIds(eng);
  const busIds = primaryIds(bus);
  assert.notDeepEqual(engIds, busIds, "ordering should differ with different preferences");
  const hasElite = (l: BalancedList) =>
    l.dream.some((e) => (e.college.avgGpa ?? 0) >= 3.9 && (e.college.satRangeMin ?? 0) >= 1450);
  assert.ok(hasElite(eng), "an elite school must survive in the engineering list");
  assert.ok(hasElite(bus), "an elite school must survive in the business list");
});

test("11. the builder stays deterministic and duplicate-free", () => {
  const a = build(STRONG);
  const b = build(STRONG);
  assert.deepEqual(a, b);
  const flat = [...a.dream, ...a.reach, ...a.target, ...a.likely, ...a.safety, ...a.pathway].map((e) => e.college.id);
  assert.equal(new Set(flat).size, flat.length, "no college may appear in more than one tier");
});

test("12. safety entries carry institutional selectivity and academic-position context", () => {
  const list = build(STRONG);
  for (const entry of list.safety) {
    assert.equal(entry.relevancePool, "SAFETY");
    assert.ok(entry.institutionalBand, "safety entries should expose their institutional selectivity band");
    assert.ok(["ABOVE", "WELL_ABOVE"].includes(entry.academicPosition ?? ""), "safety entries are overqualified");
  }
});