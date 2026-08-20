import { test } from "node:test";
import assert from "node:assert/strict";
import { computeMatch } from "../src/lib/services/match.engine";
import type { EngineCollege, EngineProfile } from "../src/lib/services/match.engine";
import {
  buildBalancedList,
  computeAcademicPosition,
  type BalancedList,
} from "../src/lib/services/college-list-builder.service";

function makeProfile(o: Partial<EngineProfile> = {}): EngineProfile {
  return {
    gpa: 3.6,
    gpaScale: 4.0,
    sat: 1320,
    act: null,
    intendedMajor: "Engineering",
    intendedMajorCategory: "STEM",
    preferredStates: [],
    preferredRegions: ["Northeast"],
    preferredSizes: ["Large"],
    publicPrivate: [],
    preferredSettings: [],
    sports: [],
    clubs: [],
    interests: ["Technology"],
    annualBudget: 50000,
    requiresFinancialAid: true,
    requiresScholarship: true,
    isInternationalStudent: false,
    englishProficiencyScore: null,
    ieltsScore: null,
    ...o,
  };
}

function makeCollege(o: Partial<EngineCollege> = {}): EngineCollege {
  return {
    id: "col1",
    name: "Test College",
    avgGpa: 3.9,
    gpaScale: 4.0,
    satRangeMin: 1390,
    satRangeMax: 1530,
    actRangeMin: 33,
    actRangeMax: 35,
    estimatedTotalCost: 78000,
    internationalAidAvailable: true,
    meritScholarshipsAvailable: true,
    needBasedAidAvailable: true,
    meetsFullNeed: true,
    avgAidInternational: 38000,
    region: "NORTHEAST",
    stateCode: "MA",
    setting: "SUBURBAN",
    sizeCategory: "MEDIUM",
    type: "PRIVATE",
    housing: "Guaranteed 4 years",
    sports: ["Football"],
    tags: ["Research"],
    clubsCount: 230,
    internationalPercentage: 12,
    internationalPopulation: 1200,
    i20Support: true,
    optAvailable: true,
    toeflMinimum: 100,
    ieltsMinimum: 7.5,
    majors: [{ name: "Engineering", category: "STEM", strength: 5 }],
    ...o,
  };
}

const ENG = { name: "Engineering", category: "STEM", strength: 5 };
const ENG4 = { name: "Engineering", category: "STEM", strength: 4 };
const ENG3 = { name: "Engineering", category: "STEM", strength: 3 };
const ENG2 = { name: "Engineering", category: "STEM", strength: 2 };
const ENG1 = { name: "Engineering", category: "STEM", strength: 1 };
const BUS = { name: "Business", category: "Business", strength: 5 };
const BUS4 = { name: "Business", category: "Business", strength: 4 };
const BUS3 = { name: "Business", category: "Business", strength: 3 };
const BUS2 = { name: "Business", category: "Business", strength: 2 };

// A small but diverse catalog: elite, mid, and low-bar colleges
// spread across regions, sizes, and types.
const CATALOG: EngineCollege[] = [
  makeCollege({ id: "columbia", name: "Columbia University", avgGpa: 4.0, satRangeMin: 1490, satRangeMax: 1580, estimatedTotalCost: 92000, region: "NORTHEAST", sizeCategory: "LARGE", type: "PRIVATE", majors: [ENG, BUS4] }),
  makeCollege({ id: "cornell", name: "Cornell University", avgGpa: 3.9, satRangeMin: 1470, satRangeMax: 1560, estimatedTotalCost: 92000, region: "NORTHEAST", sizeCategory: "LARGE", type: "PRIVATE", majors: [ENG, BUS4] }),
  makeCollege({ id: "northwestern", name: "Northwestern University", avgGpa: 4.0, satRangeMin: 1470, satRangeMax: 1560, estimatedTotalCost: 86000, region: "MIDWEST", sizeCategory: "LARGE", type: "PRIVATE", majors: [ENG4, BUS] }),
  makeCollege({ id: "williams", name: "Williams College", avgGpa: 4.0, satRangeMin: 1490, satRangeMax: 1570, estimatedTotalCost: 90000, region: "NORTHEAST", sizeCategory: "SMALL", type: "PRIVATE", internationalAidAvailable: false, i20Support: false, optAvailable: false, internationalPercentage: 8, majors: [ENG1, BUS2] }),
  makeCollege({ id: "nyu", name: "New York University", avgGpa: 3.9, satRangeMin: 1390, satRangeMax: 1510, estimatedTotalCost: 88000, region: "NORTHEAST", sizeCategory: "LARGE", type: "PRIVATE", majors: [ENG3, BUS] }),
  makeCollege({ id: "georgiatech", name: "Georgia Institute of Technology", avgGpa: 4.0, satRangeMin: 1370, satRangeMax: 1530, estimatedTotalCost: 36000, region: "SOUTH", sizeCategory: "LARGE", type: "PUBLIC", majors: [ENG, BUS4] }),
  makeCollege({ id: "florida", name: "University of Florida", avgGpa: 4.1, satRangeMin: 1330, satRangeMax: 1490, estimatedTotalCost: 26000, region: "SOUTH", sizeCategory: "LARGE", type: "PUBLIC", majors: [ENG4, BUS] }),
  makeCollege({ id: "michiganstate", name: "Michigan State University", avgGpa: 3.7, satRangeMin: 1120, satRangeMax: 1320, estimatedTotalCost: 32000, region: "MIDWEST", sizeCategory: "LARGE", type: "PUBLIC", majors: [ENG3, BUS4] }),
  makeCollege({ id: "asu", name: "Arizona State University", avgGpa: 3.5, satRangeMin: 1120, satRangeMax: 1340, estimatedTotalCost: 33000, region: "WEST_COAST", sizeCategory: "LARGE", type: "PUBLIC", majors: [ENG3, BUS4] }),
  makeCollege({ id: "sdsu", name: "San Diego State University", avgGpa: 3.7, satRangeMin: 1090, satRangeMax: 1320, estimatedTotalCost: 36000, region: "WEST_COAST", sizeCategory: "LARGE", type: "PUBLIC", i20Support: false, internationalPercentage: 5, majors: [ENG2, BUS3] }),
  makeCollege({ id: "lsu", name: "Louisiana State University", avgGpa: 3.5, satRangeMin: 1080, satRangeMax: 1320, estimatedTotalCost: 42000, region: "SOUTH", sizeCategory: "LARGE", type: "PUBLIC", majors: [ENG3, BUS4] }),
  makeCollege({ id: "temple", name: "Temple University", avgGpa: 3.4, satRangeMin: 1070, satRangeMax: 1290, estimatedTotalCost: 47000, region: "NORTHEAST", sizeCategory: "LARGE", type: "PUBLIC", majors: [ENG3, BUS4] }),
  makeCollege({ id: "delta", name: "Delta State University", avgGpa: 2.8, satRangeMin: 900, satRangeMax: 1100, estimatedTotalCost: 22000, region: "SOUTH", sizeCategory: "MEDIUM", type: "PUBLIC", majors: [ENG2, BUS4] }),
  makeCollege({ id: "citycc", name: "City Community College", avgGpa: 2.8, satRangeMin: 850, satRangeMax: 1050, estimatedTotalCost: 12000, region: "SOUTH", sizeCategory: "MEDIUM", type: "PUBLIC", tags: ["Community College", "2-Year"], majors: [ENG2, BUS4] }),
];

function scored(profile: EngineProfile, catalog: EngineCollege[]) {
  return catalog.map((college) => ({
    college,
    result: computeMatch(profile, college),
  }));
}

function build(profile: EngineProfile): BalancedList {
  return buildBalancedList(profile, scored(profile, CATALOG));
}

function ids(list: BalancedList): string[] {
  return [...list.dream, ...list.reach, ...list.target, ...list.likely, ...list.pathway].map((e) => e.college.id);
}

function tierIds(list: BalancedList, tier: "dream" | "reach" | "target" | "likely" | "pathway"): string[] {
  return list[tier].map((e) => e.college.id);
}

const STUDENT_A = makeProfile({ gpa: 4.0, sat: 1600, intendedMajor: "Engineering", intendedMajorCategory: "STEM", annualBudget: 70000, preferredRegions: ["Northeast"], preferredSizes: ["Large"] });
const STUDENT_B = makeProfile({ gpa: 2.0, sat: 1100, intendedMajor: "Business", intendedMajorCategory: "Business", annualBudget: 30000, preferredRegions: ["South"], preferredSizes: ["Large"] });

test("1. radically different profiles produce different lists in every tier", () => {
  const a = build(STUDENT_A);
  const b = build(STUDENT_B);
  assert.notDeepEqual(ids(a), ids(b));
  for (const tier of ["dream", "reach", "target", "likely"] as const) {
    assert.notDeepEqual(tierIds(a, tier), tierIds(b, tier));
  }
});

test("2. major choice changes the list (Engineering vs Business)", () => {
  const eng = build(makeProfile({ gpa: 3.8, sat: 1450, intendedMajor: "Engineering", intendedMajorCategory: "STEM", annualBudget: 60000 }));
  const bus = build(makeProfile({ gpa: 3.8, sat: 1450, intendedMajor: "Business", intendedMajorCategory: "Business", annualBudget: 60000 }));
  assert.notDeepEqual(ids(eng), ids(bus));
});

test("3. budget changes the list (high vs low)", () => {
  const high = build(makeProfile({ gpa: 3.8, sat: 1450, intendedMajor: "Engineering", intendedMajorCategory: "STEM", annualBudget: 90000, preferredRegions: ["Northeast"] }));
  const low = build(makeProfile({ gpa: 3.8, sat: 1450, intendedMajor: "Engineering", intendedMajorCategory: "STEM", annualBudget: 25000, preferredRegions: ["Northeast"] }));
  assert.notDeepEqual(ids(high), ids(low));
});

test("4. region preference changes the list (Northeast vs South)", () => {
  const ne = build(makeProfile({ gpa: 3.8, sat: 1450, intendedMajor: "Engineering", intendedMajorCategory: "STEM", annualBudget: 60000, preferredRegions: ["Northeast"] }));
  const south = build(makeProfile({ gpa: 3.8, sat: 1450, intendedMajor: "Engineering", intendedMajorCategory: "STEM", annualBudget: 60000, preferredRegions: ["South"] }));
  assert.notDeepEqual(ids(ne), ids(south));
});

test("5. international students get a different list", () => {
  const strong = makeProfile({ gpa: 4.0, sat: 1500, intendedMajor: "Engineering", intendedMajorCategory: "STEM", annualBudget: 50000, preferredRegions: ["Northeast"], preferredSizes: ["Large"] });
  const mini = [
    makeCollege({ id: "mid1", name: "Regional State", avgGpa: 3.4, satRangeMin: 1080, satRangeMax: 1300, estimatedTotalCost: 40000, region: "SOUTH", sizeCategory: "LARGE", type: "PUBLIC", majors: [ENG3] }),
    makeCollege({ id: "mid2", name: "Sun Belt U", avgGpa: 3.5, satRangeMin: 1090, satRangeMax: 1320, estimatedTotalCost: 42000, region: "WEST_COAST", sizeCategory: "LARGE", type: "PUBLIC", majors: [ENG3], i20Support: false, internationalAidAvailable: false, optAvailable: false, internationalPercentage: 4 }),
  ];
  const domestic = buildBalancedList(strong, scored(strong, mini));
  const intl = buildBalancedList(
    makeProfile({ ...strong, isInternationalStudent: true, englishProficiencyScore: null, ieltsScore: null }),
    scored(makeProfile({ ...strong, isInternationalStudent: true, englishProficiencyScore: null, ieltsScore: null }), mini)
  );
  assert.notDeepEqual(tierIds(domestic, "likely"), tierIds(intl, "likely"));
});

test("6. the list contains multiple distinct tiers", () => {
  const list = build(STUDENT_A);
  const present = (["dream", "reach", "target", "likely", "pathway"] as const).filter((t) => list[t].length > 0);
  assert.ok(present.length >= 3, `expected at least 3 tiers, got ${present.join(", ")}`);
});

test("7. the builder is deterministic (same profile, same catalog)", () => {
  const a = build(STUDENT_A);
  const b = build(STUDENT_A);
  assert.deepEqual(a, b);
});

test("8. no college appears more than once across tiers", () => {
  const list = build(STUDENT_A);
  const flat = ids(list);
  assert.equal(new Set(flat).size, flat.length, "duplicate college found in list");
});

test("9. never frames results as admission probability or guarantee", () => {
  const banned = /chance|probabil|guarantee|odds|% (chance|likely)/i;
  const list = build(STUDENT_A);
  const texts: string[] = [];
  for (const entry of [...list.dream, ...list.reach, ...list.target, ...list.likely, ...list.pathway]) {
    texts.push(...entry.result.dimensions.flatMap((d) => d.reasons));
    texts.push(...entry.improvements.map((i) => `${i.title} ${i.action}`));
  }
  for (const t of texts) {
    assert.doesNotMatch(t, banned, `banned language found: "${t}"`);
  }
});

test("10. never uses safe-school terminology", () => {
  const list = build(STUDENT_B);
  const texts = [...list.dream, ...list.reach, ...list.target, ...list.likely, ...list.pathway].flatMap((e) => [
    ...e.result.dimensions.flatMap((d) => d.reasons),
    ...e.improvements.map((i) => `${i.title} ${i.action}`),
  ]);
  for (const t of texts) {
    assert.doesNotMatch(t, /safe school/i, `safe school language found: "${t}"`);
  }
});

test("11. likely colleges are ones where the student is clearly dominant academically", () => {
  const list = build(STUDENT_A);
  assert.ok(list.likely.length > 0, "expected likely colleges for a strong profile");
  for (const entry of list.likely) {
    const position = computeAcademicPosition(
      {
        gpa: 4.0, gpaScale: 4.0, sat: 1600, act: null,
        intendedMajor: "Engineering", intendedMajorCategory: "STEM",
        preferredStates: [], preferredRegions: ["Northeast"], preferredSizes: ["Large"],
        publicPrivate: [], preferredSettings: [], sports: [], clubs: [],
        interests: ["Technology"], annualBudget: 70000, requiresFinancialAid: true,
        requiresScholarship: true, isInternationalStudent: false,
        englishProficiencyScore: null, ieltsScore: null,
      },
      entry.college
    );
    assert.ok(position > 0.15, `${entry.college.name} should be a dominant fit (position ${position})`);
  }
});

test("12. dream colleges for a strong student are elite, not every low match score", () => {
  const list = build(STUDENT_A);
  assert.ok(list.dream.length >= 2 && list.dream.length <= 3, `expected 2-3 dream colleges, got ${list.dream.length}`);
  for (const entry of list.dream) {
    assert.ok(
      (entry.college.avgGpa ?? 0) >= 3.9 && (entry.college.satRangeMin ?? 0) >= 1450,
      `${entry.college.name} should be an elite dream, not a random low-match college`
    );
  }
});

test("13. a weak student gets a Pathway tier with community-college framing", () => {
  const withPathway = build(STUDENT_B);
  assert.ok(withPathway.pathway.length > 0, "expected Pathway colleges for a 2.0 student");
  for (const entry of withPathway.pathway) {
    assert.ok(entry.tier === "pathway");
    assert.ok(entry.pathwayNote, "pathway entry should explain the transfer pathway");
    assert.match(entry.pathwayNote, /community college/i);
    assert.doesNotMatch(entry.mainRisk, /impossible|dead end/i);
  }
});

test("14. a strong student is NOT given a Pathway tier", () => {
  const list = build(STUDENT_A);
  assert.equal(list.pathway.length, 0, "Pathway is only surfaced for weak profiles");
});

test("15. a weak student's realistic tiers never include a dramatic-mismatch college", () => {
  const list = build(STUDENT_B);
  for (const tier of ["reach", "target", "likely"] as const) {
    for (const entry of list[tier]) {
      assert.equal(entry.academic.isAcademicMismatch, false, `${entry.college.name} must not be ${tier} for a mismatched profile`);
    }
  }
});

// ---- Selectivity-aware tiering (Phase A5) ----
// These use acceptanceRate so the selectivity rules actually fire
// (the shared CATALOG above intentionally leaves it null).

const SELECTIVE: EngineCollege[] = [
  makeCollege({ id: "stanford", name: "Stanford University", avgGpa: 4.0, satRangeMin: 1490, satRangeMax: 1580, acceptanceRate: 4, estimatedTotalCost: 85000, region: "WEST_COAST", sizeCategory: "MEDIUM", type: "PRIVATE", majors: [ENG] }),
  makeCollege({ id: "georgiatech", name: "Georgia Institute of Technology", avgGpa: 4.0, satRangeMin: 1370, satRangeMax: 1530, acceptanceRate: 17, estimatedTotalCost: 36000, region: "SOUTH", sizeCategory: "LARGE", type: "PUBLIC", majors: [ENG] }),
  makeCollege({ id: "asu", name: "Arizona State University", avgGpa: 3.5, satRangeMin: 1120, satRangeMax: 1340, acceptanceRate: 80, estimatedTotalCost: 33000, region: "WEST_COAST", sizeCategory: "LARGE", type: "PUBLIC", majors: [ENG3] }),
  makeCollege({ id: "alabamaam", name: "Alabama A&M University", avgGpa: 2.8, satRangeMin: 850, satRangeMax: 1050, acceptanceRate: 90, estimatedTotalCost: 22000, region: "SOUTH", sizeCategory: "MEDIUM", type: "PUBLIC", majors: [ENG2, BUS4] }),
  makeCollege({ id: "citycc", name: "City Community College", avgGpa: 2.8, satRangeMin: 850, satRangeMax: 1050, acceptanceRate: 100, estimatedTotalCost: 12000, region: "SOUTH", sizeCategory: "MEDIUM", type: "PUBLIC", tags: ["Community College", "2-Year"], majors: [ENG2, BUS4] }),
];

function buildSelective(profile: EngineProfile): BalancedList {
  return buildBalancedList(profile, scored(profile, SELECTIVE));
}

test("16. a highly selective college (<25%) is never Likely, even for a competitive strong student", () => {
  const strong = makeProfile({ gpa: 4.0, sat: 1600, intendedMajor: "Engineering", intendedMajorCategory: "STEM", annualBudget: 70000 });
  const list = buildSelective(strong);
  const likelyIds = tierIds(list, "likely");
  assert.ok(!likelyIds.includes("stanford"), "Stanford (4%) must never appear in Likely");
  assert.ok(!likelyIds.includes("georgiatech"), "Georgia Tech (17%) must never appear in Likely");
});

test("17. an ultra-elite college (<=5%) is a Dream and a 6-24% school is a Reach for a strong student", () => {
  const strong = makeProfile({ gpa: 4.0, sat: 1600, intendedMajor: "Engineering", intendedMajorCategory: "STEM", annualBudget: 70000 });
  const list = buildSelective(strong);
  const dreamIds = tierIds(list, "dream");
  assert.ok(dreamIds.includes("stanford"), "Stanford (4%) should be a Dream");
  assert.ok(!dreamIds.includes("georgiatech"), "Georgia Tech (17%) is not ultra-elite and must not be a Dream");
  assert.ok(list.reach.length > 0, "a strong student should have a non-empty Reach");
  assert.ok(tierIds(list, "reach").includes("georgiatech"), "Georgia Tech (17%) should be a Reach for a strong student");
});

test("18. a weak student gets a realistic Likely from open-admission 4-year colleges (>=85%)", () => {
  const weak = makeProfile({ gpa: 2.0, sat: 1100, intendedMajor: "Engineering", intendedMajorCategory: "STEM", annualBudget: 30000 });
  const list = buildSelective(weak);
  const likelyIds = tierIds(list, "likely");
  assert.ok(likelyIds.includes("alabamaam"), "an open-admission 4-year college should be Likely for a weak student");
  assert.ok(tierIds(list, "pathway").includes("citycc"), "a community college should be Pathway for a weak student");
});

test("19. a strong student's Likely excludes dramatically weaker open-admission schools (relevance caps)", () => {
  const strong = makeProfile({ gpa: 4.0, sat: 1600, intendedMajor: "Engineering", intendedMajorCategory: "STEM", annualBudget: 70000 });
  const list = buildSelective(strong);
  const likelyIds = tierIds(list, "likely");
  assert.ok(!likelyIds.includes("alabamaam"), "a dramatically weaker open-admission college must not be Likely for a strong student");
});

test("20. list sizes adapt to profile strength (strong broader ambitious tiers, weak more Likely)", () => {
  const strong = makeProfile({ gpa: 4.0, sat: 1600, intendedMajor: "Engineering", intendedMajorCategory: "STEM", annualBudget: 70000 });
  const weak = makeProfile({ gpa: 2.0, sat: 1100, intendedMajor: "Engineering", intendedMajorCategory: "STEM", annualBudget: 30000 });
  const strongList = buildSelective(strong);
  const weakList = buildSelective(weak);
  assert.ok(strongList.dream.length <= 3 && strongList.reach.length <= 3 && strongList.target.length <= 4 && strongList.likely.length <= 3);
  assert.ok(weakList.dream.length <= 1, "weak profile caps Dream at 1");
  assert.ok(weakList.reach.length <= 2, "weak profile caps Reach at 2");
  assert.ok(weakList.target.length <= 3, "weak profile caps Target at 3");
  assert.ok(weakList.likely.length <= 4, "weak profile caps Likely at 4");
  assert.ok(weakList.pathway.length <= 2, "weak profile caps Pathway at 2");
});

test("21. a 2.5 GPA profile now surfaces a Pathway tier (gate moved to < 2.6)", () => {
  const borderline = makeProfile({ gpa: 2.5, sat: 1150, intendedMajor: "Engineering", intendedMajorCategory: "STEM", annualBudget: 30000 });
  const list = buildSelective(borderline);
  assert.ok(tierIds(list, "pathway").includes("citycc"), "2.5 GPA should surface the Pathway tier");
});