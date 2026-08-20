import { test } from "node:test";
import assert from "node:assert/strict";
import {
  analyzeProfileGaps,
  findTestingGap,
  findAcademicGap,
  findFinancialGap,
  findInternationalGap,
  potentialImpactForGap,
  type GapFinding,
} from "../src/lib/services/recommendation.service";
import { computeMatch } from "../src/lib/services/match.engine";
import type { EngineCollege, EngineProfile } from "../src/lib/services/match.engine";

function makeProfile(o: Partial<EngineProfile> = {}): EngineProfile {
  return {
    gpa: 3.6,
    gpaScale: 4.0,
    sat: 1320,
    act: null,
    intendedMajor: "Engineering",
    intendedMajorCategory: "STEM",
    preferredStates: [],
    preferredRegions: ["East Coast"],
    preferredSizes: ["Medium"],
    publicPrivate: [],
    preferredSettings: [],
    sports: [],
    clubs: [],
    interests: ["Technology"],
    annualBudget: 35000,
    requiresFinancialAid: true,
    requiresScholarship: true,
    isInternationalStudent: true,
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

test("gaps: SAT below range produces a testing gap", () => {
  const gap = findTestingGap(makeProfile(), [makeCollege()]);
  assert.ok(gap);
  assert.equal(gap.category, "TESTING");
  assert.match(gap.title, /SAT/i);
  assert.equal(gap.collegeId, "col1");
});

test("gaps: no testing gap when SAT is within range", () => {
  const gap = findTestingGap(makeProfile({ sat: 1500 }), [makeCollege()]);
  assert.equal(gap, null);
});

test("gaps: GPA below average produces an academic gap", () => {
  const gap = findAcademicGap(makeProfile({ gpa: 3.4 }), [makeCollege()]);
  assert.ok(gap);
  assert.equal(gap.category, "ACADEMIC");
});

test("gaps: financial gap when cost > budget", () => {
  const gap = findFinancialGap(makeProfile({ annualBudget: 30000 }), [makeCollege()]);
  assert.ok(gap);
  assert.equal(gap.category, "FINANCIAL");
  assert.match(gap.title, /financial aid/i);
});

test("gaps: no financial gap when budget covers cost", () => {
  const gap = findFinancialGap(makeProfile({ annualBudget: 80000 }), [makeCollege()]);
  assert.equal(gap, null);
});

test("gaps: international gap when English requirement unpublished for student", () => {
  const gap = findInternationalGap(makeProfile({ englishProficiencyScore: null }), [makeCollege()]);
  assert.ok(gap);
  assert.equal(gap.category, "INTERNATIONAL");
});

test("gaps: no international gap when student has a recorded score", () => {
  const gap = findInternationalGap(makeProfile({ englishProficiencyScore: 105 }), [makeCollege()]);
  assert.equal(gap, null);
});

test("gaps: no international gap for domestic student", () => {
  const gap = findInternationalGap(
    makeProfile({ isInternationalStudent: false, englishProficiencyScore: null }),
    [makeCollege()]
  );
  assert.equal(gap, null);
});

test("gaps: analyzeProfileGaps returns gaps in priority order", () => {
  const gaps = analyzeProfileGaps(
    makeProfile({ gpa: 3.4, sat: 1200, annualBudget: 30000, englishProficiencyScore: null }),
    [makeCollege()]
  );
  assert.ok(gaps.length > 0);
  const categories = gaps.map((g) => g.category);
  assert.equal(categories[0], "ACADEMIC");
  assert.ok(categories.includes("TESTING"));
});

test("impact: simulated improvement always equals recomputed difference", () => {
  const profile = makeProfile();
  const college = makeCollege();
  const current = computeMatch(profile, college).score;
  const gap = findTestingGap(profile, [college]) as GapFinding;
  const impact = potentialImpactForGap(profile, college, gap.mutate);
  const simulated = computeMatch(gap.mutate(profile), college).score;
  assert.equal(simulated - current, impact);
});

test("impact: financial gap produces a positive impact (cost > budget)", () => {
  const profile = makeProfile({ annualBudget: 30000 });
  const college = makeCollege();
  const gap = findFinancialGap(profile, [college]) as GapFinding;
  const impact = potentialImpactForGap(profile, college, gap.mutate);
  assert.ok(impact > 0, `expected positive impact, got ${impact}`);
});

test("impact: GPA gap produces a positive impact", () => {
  const profile = makeProfile({ gpa: 3.4 });
  const college = makeCollege();
  const gap = findAcademicGap(profile, [college]) as GapFinding;
  const impact = potentialImpactForGap(profile, college, gap.mutate);
  assert.ok(impact > 0, `expected positive impact, got ${impact}`);
});

test("impact: simulated SAT at range min raises score deterministically", () => {
  const profile = makeProfile({ sat: 1200 });
  const college = makeCollege();
  const gap = findTestingGap(profile, [college]) as GapFinding;
  const mutated = gap.mutate(profile);
  assert.equal(mutated.sat, 1280); // min(satRangeMin=1390, sat+80=1280)
});