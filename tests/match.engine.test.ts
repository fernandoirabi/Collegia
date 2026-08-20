import { test } from "node:test";
import assert from "node:assert/strict";
import {
  computeMatch,
  scoreAcademic,
  scoreMajor,
  scoreFinancial,
  scoreLocation,
  scorePreference,
  scoreInternational,
  scoreInterest,
  finalMatchScore,
  classifyMatch,
  MATCH_ENGINE_VERSION,
  MATCH_DIMENSIONS,
  DIMENSION_WEIGHTS,
  type EngineProfile,
  type EngineCollege,
  type DimensionResult,
} from "../src/lib/services/match.engine";

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
    preferredSizes: ["Medium", "Large"],
    publicPrivate: [],
    preferredSettings: [],
    sports: [],
    clubs: [],
    interests: ["Technology"],
    annualBudget: 35000,
    requiresFinancialAid: true,
    requiresScholarship: true,
    isInternationalStudent: true,
    englishProficiencyScore: 105,
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
    sports: ["Football", "Basketball"],
    tags: ["Research"],
    clubsCount: 230,
    internationalPercentage: 12,
    internationalPopulation: 1200,
    i20Support: true,
    optAvailable: true,
    toeflMinimum: 100,
    ieltsMinimum: 7.5,
    majors: [
      { name: "Engineering", category: "STEM", strength: 5 },
      { name: "Business", category: "Business", strength: 4 },
    ],
    ...o,
  };
}

// ============================================================
// ACADEMIC FIT
// ============================================================

test("academic: strong profile (GPA at avg, SAT within range) => 95 HIGH", () => {
  const r = scoreAcademic(
    makeProfile({ gpa: 3.9, sat: 1500 }),
    makeCollege()
  );
  assert.equal(r.score, 95);
  assert.equal(r.confidence, "HIGH");
});

test("academic: average profile (GPA below 0.1, SAT below min) => 75 HIGH", () => {
  const r = scoreAcademic(
    makeProfile({ gpa: 3.8, sat: 1320 }),
    makeCollege()
  );
  assert.equal(r.score, 75);
  assert.equal(r.confidence, "HIGH");
});

test("academic: weak profile => lower score", () => {
  const r = scoreAcademic(makeProfile({ gpa: 3.4, sat: 1000 }), makeCollege());
  assert.ok(r.score < 70);
});

test("academic: missing GPA + test data => 70 LIMITED", () => {
  const r = scoreAcademic(makeProfile({ gpa: null, sat: null, act: null }), makeCollege());
  assert.equal(r.score, 70);
  assert.equal(r.confidence, "LIMITED");
});

test("academic: GPA distance buckets below avg", () => {
  const noTest = { sat: null, act: null } as const;
  assert.equal(scoreAcademic(makeProfile({ gpa: 3.82, ...noTest }), makeCollege()).score, 80);
  assert.equal(scoreAcademic(makeProfile({ gpa: 3.8, ...noTest }), makeCollege()).score, 65);
  assert.equal(scoreAcademic(makeProfile({ gpa: 3.69, ...noTest }), makeCollege()).score, 45);
});

test("academic: GPA above avg increases gradually up to 100", () => {
  const r = scoreAcademic(makeProfile({ gpa: 4.2, sat: null, act: null }), makeCollege());
  assert.equal(r.score, 100);
});

test("academic: SAT below range uses proportional penalty, floor >= 0", () => {
  const low = scoreAcademic(makeProfile({ sat: 400 }), makeCollege());
  assert.ok(low.score >= 0 && low.score < 95);
});

test("academic: incompatible GPA scales => GPA treated as unknown, test only", () => {
  const r = scoreAcademic(
    makeProfile({ gpa: 3.9, gpaScale: 100, sat: 1500 }),
    makeCollege()
  );
  assert.equal(r.score, 95);
  assert.equal(r.confidence, "MEDIUM");
  assert.ok(r.reasons.some((x) => x.includes("scales")));
});

test("academic: college provides neither SAT nor ACT => no penalty (GPA only)", () => {
  const r = scoreAcademic(
    makeProfile({ gpa: 3.9, sat: 1320, act: 30 }),
    makeCollege({ satRangeMin: null, satRangeMax: null, actRangeMin: null, actRangeMax: null })
  );
  assert.equal(r.score, 95);
  assert.equal(r.confidence, "MEDIUM");
});

// ============================================================
// MAJOR FIT
// ============================================================

test("major: exact major strength 5 => 100", () => {
  const r = scoreMajor(makeProfile(), makeCollege());
  assert.equal(r.score, 100);
});

test("major: exact major strength 3 => 90", () => {
  const r = scoreMajor(
    makeProfile(),
    makeCollege({ majors: [{ name: "Engineering", category: "STEM", strength: 3 }] })
  );
  assert.equal(r.score, 90);
});

test("major: related major/category strength 5 => 85", () => {
  const r = scoreMajor(
    makeProfile(),
    makeCollege({ majors: [{ name: "Mechanical Engineering", category: "STEM", strength: 5 }] })
  );
  assert.equal(r.score, 85);
});

test("major: no related program => 40", () => {
  const r = scoreMajor(
    makeProfile(),
    makeCollege({ majors: [{ name: "Business", category: "Business", strength: 4 }] })
  );
  assert.equal(r.score, 40);
});

test("major: no majors recorded => 0", () => {
  const r = scoreMajor(makeProfile(), makeCollege({ majors: [] }));
  assert.equal(r.score, 0);
});

test("major: no intended major => 70 LIMITED", () => {
  const r = scoreMajor(
    makeProfile({ intendedMajor: null, intendedMajorCategory: null }),
    makeCollege()
  );
  assert.equal(r.score, 70);
  assert.equal(r.confidence, "LIMITED");
});

test("major: exact major with null strength => 90 (standard program)", () => {
  const r = scoreMajor(
    makeProfile(),
    makeCollege({ majors: [{ name: "Engineering", category: "STEM", strength: null }] })
  );
  assert.equal(r.score, 90);
});

// ============================================================
// FINANCIAL FIT
// ============================================================

test("financial: cost <= budget => 100", () => {
  const r = scoreFinancial(makeProfile({ annualBudget: 78000 }), makeCollege());
  assert.equal(r.score, 100);
});

test("financial: cost tiers", () => {
  const noAid = {
    internationalAidAvailable: null,
    meritScholarshipsAvailable: null,
    needBasedAidAvailable: null,
    meetsFullNeed: null,
  };
  const cost = (v: number) =>
    scoreFinancial(makeProfile({ annualBudget: 35000 }), makeCollege({ estimatedTotalCost: v, ...noAid })).score;
  assert.equal(cost(35000), 100); // <= budget
  assert.equal(cost(38500), 90); // up to 10% above
  assert.equal(cost(42000), 75); // 10-25%
  assert.equal(cost(50000), 55); // 25-50%
  assert.equal(cost(60000), 35); // 50-100%
  assert.equal(cost(75000), 20); // >100%
});

test("financial: aid adjustments capped at 100", () => {
  const r = scoreFinancial(makeProfile({ annualBudget: 35000 }), makeCollege({ estimatedTotalCost: 36000 }));
  assert.equal(r.score, 100); // 90 + 5 + 5 + 3 + 7
});

test("financial: no aid data => neutral, lower confidence", () => {
  const r = scoreFinancial(
    makeProfile({ annualBudget: 35000 }),
    makeCollege({
      estimatedTotalCost: 35000,
      internationalAidAvailable: null,
      meritScholarshipsAvailable: null,
      needBasedAidAvailable: null,
      meetsFullNeed: null,
    })
  );
  assert.equal(r.score, 100);
  assert.equal(r.confidence, "LIMITED");
});

test("financial: missing budget/cost => 70 LIMITED", () => {
  const r = scoreFinancial(makeProfile({ annualBudget: null }), makeCollege());
  assert.equal(r.score, 70);
  assert.equal(r.confidence, "LIMITED");
});

// ============================================================
// LOCATION FIT
// ============================================================

test("location: preferred state => 100", () => {
  const r = scoreLocation(makeProfile({ preferredStates: ["MA"] }), makeCollege());
  assert.equal(r.score, 100);
});

test("location: preferred region => 90", () => {
  const r = scoreLocation(makeProfile({ preferredRegions: ["Northeast"] }), makeCollege());
  assert.equal(r.score, 90);
});

test("location: no geographic preference => 75", () => {
  const r = scoreLocation(
    makeProfile({ preferredStates: [], preferredRegions: [] }),
    makeCollege()
  );
  assert.equal(r.score, 75);
});

test("location: preferences but college outside => 60", () => {
  const r = scoreLocation(
    makeProfile({ preferredStates: ["CA"], preferredRegions: ["West Coast"] }),
    makeCollege({ region: "SOUTHWEST", stateCode: "TX" })
  );
  assert.equal(r.score, 60);
});

test("location: setting adjustment +/-5", () => {
  const base = makeProfile({ preferredRegions: ["Northeast"], preferredSettings: ["Urban"] });
  assert.equal(scoreLocation(base, makeCollege()).score, 85); // 90 - 5
  const sub = makeProfile({ preferredRegions: ["Northeast"], preferredSettings: ["Suburban"] });
  assert.equal(scoreLocation(sub, makeCollege()).score, 95); // 90 + 5
});

// ============================================================
// COLLEGE PREFERENCE FIT
// ============================================================

test("preference: exact type/size/setting matches", () => {
  const r = scorePreference(
    makeProfile({ publicPrivate: ["Private"], preferredSizes: ["Medium"], preferredSettings: ["Suburban"] }),
    makeCollege()
  );
  assert.equal(r.score, 100);
});

test("preference: mismatches => 60", () => {
  const r = scorePreference(
    makeProfile({ publicPrivate: ["Public"], preferredSizes: ["Small"], preferredSettings: ["Urban"] }),
    makeCollege()
  );
  assert.equal(r.score, 60);
});

test("preference: no preferences => 75", () => {
  const r = scorePreference(makeProfile({ publicPrivate: [], preferredSizes: [], preferredSettings: [] }), makeCollege());
  assert.equal(r.score, 75);
});

test("preference: unknown college value => 75 for that component", () => {
  const r = scorePreference(
    makeProfile({ publicPrivate: ["Private"], preferredSizes: [], preferredSettings: [] }),
    makeCollege({ type: null })
  );
  assert.equal(r.score, 75);
});

// ============================================================
// INTERNATIONAL FIT
// ============================================================

test("international: full support => 100", () => {
  const r = scoreInternational(makeProfile(), makeCollege());
  assert.equal(r.score, 100);
  assert.equal(r.confidence, "HIGH");
});

test("international: I-20 unavailable => substantially reduced", () => {
  const r = scoreInternational(makeProfile(), makeCollege({ i20Support: false }));
  assert.ok(r.score < 60);
});

test("international: data largely unknown => 70 LIMITED", () => {
  const r = scoreInternational(
    makeProfile(),
    makeCollege({
      i20Support: null,
      internationalAidAvailable: null,
      internationalPercentage: null,
      optAvailable: null,
      toeflMinimum: null,
      ieltsMinimum: null,
    })
  );
  assert.equal(r.score, 70);
  assert.equal(r.confidence, "LIMITED");
});

test("international: incomplete but supportive => 70-100 range", () => {
  const r = scoreInternational(
    makeProfile(),
    makeCollege({
      internationalAidAvailable: null,
      internationalPercentage: null,
      optAvailable: null,
      toeflMinimum: null,
      ieltsMinimum: null,
    })
  );
  assert.ok(r.score >= 70 && r.score <= 100);
});

// ============================================================
// INTEREST / LIFESTYLE FIT
// ============================================================

test("interest: no interests => 75", () => {
  const r = scoreInterest(makeProfile({ interests: [] }), makeCollege());
  assert.equal(r.score, 75);
});

test("interest: matching interest adds +5", () => {
  const r = scoreInterest(makeProfile({ interests: ["Football"] }), makeCollege());
  assert.equal(r.score, 80);
});

test("interest: multiple matches cap at 100", () => {
  const r = scoreInterest(
    makeProfile({ interests: ["Football", "Basketball", "Research", "A", "B", "C", "D", "E"] }),
    makeCollege()
  );
  assert.equal(r.score, 100);
});

// ============================================================
// FINAL WEIGHTED SCORE + CLASSIFICATION
// ============================================================

test("final: spec example (88,95,65,90,80,92,85) => 84", () => {
  const dims: DimensionResult[] = [
    { dimension: "academic", label: "", score: 88, confidence: "HIGH", reasons: [] },
    { dimension: "major", label: "", score: 95, confidence: "HIGH", reasons: [] },
    { dimension: "financial", label: "", score: 65, confidence: "HIGH", reasons: [] },
    { dimension: "location", label: "", score: 90, confidence: "HIGH", reasons: [] },
    { dimension: "collegePreference", label: "", score: 80, confidence: "HIGH", reasons: [] },
    { dimension: "international", label: "", score: 92, confidence: "HIGH", reasons: [] },
    { dimension: "interests", label: "", score: 85, confidence: "HIGH", reasons: [] },
  ];
  assert.equal(finalMatchScore(dims), 84);
});

test("final: weights sum to 1.00", () => {
  const sum = MATCH_DIMENSIONS.reduce((a, d) => a + DIMENSION_WEIGHTS[d], 0);
  assert.ok(Math.abs(sum - 1) < 1e-9);
});

test("classification: boundaries 59/60/79/80/100", () => {
  assert.equal(classifyMatch(59), "REACH");
  assert.equal(classifyMatch(60), "TARGET");
  assert.equal(classifyMatch(79), "TARGET");
  assert.equal(classifyMatch(80), "STRONG_MATCH");
  assert.equal(classifyMatch(100), "STRONG_MATCH");
});

// ============================================================
// COMPUTE MATCH (integration)
// ============================================================

test("computeMatch: deterministic + contract", () => {
  const p = makeProfile();
  const c = makeCollege();
  const a = computeMatch(p, c);
  const b = computeMatch(p, c);
  assert.deepStrictEqual(a, b);
  assert.equal(a.engineVersion, MATCH_ENGINE_VERSION);
  assert.equal(a.dimensions.length, 7);
  for (const d of a.dimensions) {
    assert.ok(d.score >= 0 && d.score <= 100);
    assert.ok(["HIGH", "MEDIUM", "LIMITED"].includes(d.confidence));
  }
  assert.ok(a.score >= 0 && a.score <= 100);
});

test("computeMatch: demo profile vs selective private college => TARGET band", () => {
  const r = computeMatch(makeProfile(), makeCollege());
  assert.equal(r.classification, "TARGET");
  assert.ok(r.score >= 60 && r.score <= 79);
});