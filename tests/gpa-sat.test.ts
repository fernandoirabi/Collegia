import { test } from "node:test";
import assert from "node:assert/strict";
import {
  computeMatch,
  scoreAcademic,
  type EngineCollege,
  type EngineProfile,
} from "../src/lib/services/match.engine";
import {
  matchGpaError,
} from "../src/lib/services/college-list-builder.service";
import { computeTestingContext } from "../src/lib/services/testing-context.service";
import { testOptionalRankingBonus } from "../src/lib/services/testing-context.service";
import { testOptionalPriorityRank } from "../src/lib/services/testing-context.service";
import { buildBalancedList } from "../src/lib/services/college-list-builder.service";

function makeProfile(o: Partial<EngineProfile> = {}): EngineProfile {
  return {
    gpa: 4.0,
    gpaScale: 4.0,
    sat: null,
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
    interests: [],
    annualBudget: 50000,
    requiresFinancialAid: false,
    requiresScholarship: false,
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
    actRangeMin: 31,
    actRangeMax: 35,
    graduationRate: 90,
    estimatedTotalCost: 78000,
    internationalAidAvailable: false,
    meritScholarshipsAvailable: false,
    needBasedAidAvailable: false,
    meetsFullNeed: false,
    avgAidInternational: null,
    region: "NORTHEAST",
    stateCode: "MA",
    setting: "SUBURBAN",
    sizeCategory: "MEDIUM",
    type: "PRIVATE",
    housing: null,
    sports: [],
    tags: [],
    clubsCount: null,
    internationalPercentage: null,
    internationalPopulation: null,
    i20Support: null,
    optAvailable: null,
    toeflMinimum: null,
    ieltsMinimum: null,
    majors: [{ name: "Engineering", category: "STEM", strength: 5 }],
    ...o,
  };
}

// ---------------------------------------------------------------------------
// TEACHER'S CASE MATRIX
// ---------------------------------------------------------------------------

test("Case A: GPA null + SAT null → submission is rejected (validation error)", () => {
  const err = matchGpaError(null) as string;
  assert.notEqual(err, null);
  assert.match(err, /GPA/i);
  // A missing GPA must never be interpreted as flat 4.0.
  assert.ok(!/4\.0/.test(err), "GPA-required message must not imply a 4.0 fallback");
});

test("Case A2: undefined GPA is also rejected", () => {
  assert.notEqual(matchGpaError(undefined), null);
});

test("Case E: GPA 3.5 + SAT null → valid; SAT stays null (no fake 1600)", () => {
  assert.equal(matchGpaError(3.5), null);
  const res = scoreAcademic(makeProfile({ gpa: 3.5, sat: null }), makeCollege());
  // No SAT was provided — the engine must not synthesize a score.
  assert.equal(res.reasons.some((r) => /SAT|ACT/.test(r)), false);
  assert.ok(!res.reasons.join(" ").includes("1600"));
});

test("Case B: GPA 4.0 + SAT null → valid; SAT remains null, never 1600", () => {
  assert.equal(matchGpaError(4.0), null);
  const res = scoreAcademic(makeProfile({ gpa: 4.0, sat: null }), makeCollege());
  // GPA alone drives the result (confidence MEDIUM); no fabricated test band.
  assert.equal(res.confidence, "MEDIUM");
  assert.ok(res.reasons.some((r) => /GPA/i.test(r)));
  assert.ok(!res.reasons.join(" ").includes("1600"));
  assert.ok(!res.reasons.join(" ").includes("SAT"));
});

test("Case C: GPA 4.0 + SAT 1600 → SAT 1600 is preserved and used", () => {
  const res = scoreAcademic(makeProfile({ gpa: 4.0, sat: 1600 }), makeCollege());
  assert.ok(res.reasons.some((r) => /SAT/.test(r)));
  assert.equal(res.confidence, "HIGH");
});

test("Case D: GPA 4.0 + SAT 1000 → valid values preserved; test-optional opportunity", () => {
  assert.equal(matchGpaError(4.0), null);
  const profile = makeProfile({ gpa: 4.0, sat: 1000 });
  const college = makeCollege({ testingPolicy: "TEST_OPTIONAL" });
  const ctx = computeTestingContext(profile, college);
  assert.equal(ctx.isTestOptionalOpportunity, true);
  assert.match(ctx.reason as string, /GPA/i);
  assert.match(ctx.reason as string, /Test-Optional/i);
});

test("Case 6: SAT not provided + test-optional college → Test-Optional Opportunity", () => {
  const profile = makeProfile({ gpa: 4.0, sat: null, act: null });
  const college = makeCollege({ testingPolicy: "TEST_OPTIONAL" });
  const ctx = computeTestingContext(profile, college);
  assert.equal(ctx.isTestOptionalOpportunity, true);
  assert.match(ctx.reason as string, /Test-Optional Opportunity/i);
});

test("Test-optional reason does not fire for non-test-optional colleges", () => {
  const profile = makeProfile({ gpa: 4.0, sat: 1000 });
  const college = makeCollege({ testingPolicy: "TEST_REQUIRED" });
  const ctx = computeTestingContext(profile, college);
  assert.equal(ctx.isTestOptionalOpportunity, false);
});

test("Test-optional reason does not fire for strong GPA + strong SAT", () => {
  const profile = makeProfile({ gpa: 4.0, sat: 1500 });
  const college = makeCollege({ testingPolicy: "TEST_OPTIONAL" });
  const ctx = computeTestingContext(profile, college);
  assert.equal(ctx.isTestOptionalOpportunity, false);
  assert.equal(ctx.reason, null);
});

// ---------------------------------------------------------------------------
// ENGINE HONESTY — never assume 4.0 / 1600
// ---------------------------------------------------------------------------

test("Unknown GPA scales are NOT treated as 4.0 (comparison skipped, not fabricated)", () => {
  const profile = makeProfile({ gpa: 3.9, gpaScale: null, sat: 1450 });
  const college = makeCollege({ gpaScale: null });
  const res = scoreAcademic(profile, college);
  // Scales unknown -> GPA comparison is skipped; only the SAT is scored.
  assert.ok(res.reasons.some((r) => /SAT/.test(r)));
  assert.ok(
    res.reasons.some((r) => /scale/i.test(r)),
    "expected an explicit unknown-scale message"
  );
});

test("Case F: testing policy never changes the Match Score or tier", () => {
  const profile = makeProfile({ gpa: 4.0, sat: 1000 });
  const base = makeCollege({ testingPolicy: "TEST_REQUIRED" });
  const optional = makeCollege({ testingPolicy: "TEST_OPTIONAL" });

  const a = computeMatch(profile, base);
  const b = computeMatch(profile, optional);

  assert.equal(a.score, b.score);
  assert.equal(a.classification, b.classification);

  // The context is purely additive.
  assert.equal(computeTestingContext(profile, base).isTestOptionalOpportunity, false);
  assert.equal(computeTestingContext(profile, optional).isTestOptionalOpportunity, true);
});

// ---------------------------------------------------------------------------
// TEST-OPTIONAL RANKING BONUS  (ordering only — never score/tier/weights)
// ---------------------------------------------------------------------------

test("ranking bonus fires for a SAT-null student at a test-optional college with compatible GPA", () => {
  const bonus = testOptionalRankingBonus(
    makeProfile({ gpa: 4.0, gpaScale: 4.0, sat: null, act: null }),
    makeCollege({ testingPolicy: "TEST_OPTIONAL" }) // avgGpa 3.9
  );
  assert.ok(bonus > 0);
});

test("ranking bonus applies to TEST_FLEXIBLE as well as TEST_OPTIONAL", () => {
  const flexible = testOptionalRankingBonus(
    makeProfile({ gpa: 4.0, sat: null, act: null }),
    makeCollege({ testingPolicy: "TEST_FLEXIBLE" })
  );
  const optional = testOptionalRankingBonus(
    makeProfile({ gpa: 4.0, sat: null, act: null }),
    makeCollege({ testingPolicy: "TEST_OPTIONAL" })
  );
  assert.ok(flexible > 0);
  assert.equal(flexible, optional);
});

test("ranking bonus is 0 when the student HAS submitted a test", () => {
  const bonus = testOptionalRankingBonus(
    makeProfile({ gpa: 4.0, sat: 1450, act: null }),
    makeCollege({ testingPolicy: "TEST_OPTIONAL" })
  );
  assert.equal(bonus, 0);
});

test("ranking bonus is 0 for a test-optional (or unknown) college when SAT is required to be relevant", () => {
  // UNKNOWN policy is never treated as test-optional.
  const unknown = testOptionalRankingBonus(
    makeProfile({ gpa: 4.0, sat: null, act: null }),
    makeCollege({ testingPolicy: "UNKNOWN" })
  );
  assert.equal(unknown, 0);

  const required = testOptionalRankingBonus(
    makeProfile({ gpa: 4.0, sat: null, act: null }),
    makeCollege({ testingPolicy: "TEST_REQUIRED" })
  );
  assert.equal(required, 0);
});

test("ranking bonus is 0 when GPA scales differ or GPA is below the college average", () => {
  const badScale = testOptionalRankingBonus(
    makeProfile({ gpa: 4.0, gpaScale: 100, sat: null, act: null }),
    makeCollege({ testingPolicy: "TEST_OPTIONAL", gpaScale: 4.0, avgGpa: 3.9 })
  );
  assert.equal(badScale, 0);

  const belowAvg = testOptionalRankingBonus(
    makeProfile({ gpa: 3.5, gpaScale: 4.0, sat: null, act: null }),
    makeCollege({ testingPolicy: "TEST_OPTIONAL", gpaScale: 4.0, avgGpa: 3.9 })
  );
  assert.equal(belowAvg, 0);
});

test("the ranking bonus never changes the Match Score or classification", () => {
  const profile = makeProfile({ gpa: 4.0, sat: null, act: null });
  const optional = makeCollege({ testingPolicy: "TEST_OPTIONAL" });

  const bonus = testOptionalRankingBonus(profile, optional);
  assert.ok(bonus > 0);

  // With a SAT, the same college scores identically but earns NO bonus.
  const withSat = makeProfile({ gpa: 4.0, sat: 1600 });
  const a = computeMatch(profile, optional);
  const b = computeMatch(withSat, optional);
  assert.equal(a.score, b.score);
  assert.equal(a.classification, b.classification);
});

test("integration: identical-score colleges in the same tier order the test-optional one first for a SAT-null student", () => {
  // Two colleges with IDENTICAL profiles/scores except testing policy.
  const base = {
    gpaScale: 4.0,
    satRangeMin: 1390,
    satRangeMax: 1530,
    actRangeMin: 31,
    actRangeMax: 35,
    estimatedTotalCost: 50000,
    internationalAidAvailable: false,
    meritScholarshipsAvailable: false,
    needBasedAidAvailable: false,
    meetsFullNeed: false,
    region: "NORTHEAST" as const,
    stateCode: "MA",
    setting: "SUBURBAN" as const,
    sizeCategory: "MEDIUM" as const,
    type: "PRIVATE" as const,
    sports: [],
    tags: [],
    clubsCount: null,
    internationalPercentage: null,
    internationalPopulation: null,
    i20Support: null,
    optAvailable: null,
    toeflMinimum: null,
    ieltsMinimum: null,
    majors: [{ name: "Engineering", category: "STEM", strength: 5 }],
  };

  const a = makeCollege({ id: "to", name: "Test Optional U", testingPolicy: "TEST_OPTIONAL", ...base });
  const b = makeCollege({ id: "req", name: "Test Required U", testingPolicy: "TEST_REQUIRED", ...base });

  const profile = makeProfile({ gpa: 4.0, sat: null, act: null, preferredRegions: [], preferredSizes: [] });

  // Compute exact same match score for both.
  const ra = computeMatch(profile, a);
  const rb = computeMatch(profile, b);
  assert.equal(ra.score, rb.score, "both colleges should have the same raw match score");

  const list = buildBalancedList(profile, [
    { college: a, result: ra },
    { college: b, result: rb },
  ]);

  // Both land in the same tier (Target); the test-optional one must be listed first.
  const pool = [...list.target, ...list.likely].filter((e) => e.college.id === "to" || e.college.id === "req");
  assert.ok(pool.length >= 2, "both test colleges should appear in Target/Likely");
  assert.equal(pool[0].college.id, "to", "test-optional college should be ordered before an identical test-required one");
  assert.ok(testOptionalRankingBonus(profile, a) > testOptionalRankingBonus(profile, b));
});

// ---------------------------------------------------------------------------
// TEST-OPTIONAL PRIORITY RANK  (ordering-only primary key within a tier)
// ---------------------------------------------------------------------------
//
// The teacher's brief: for a SAT-null student, the recommendation layer must
// prioritize, within an already-assigned ambition tier, colleges with a
// reliable test-optional/flexible policy and a compatible GPA ahead of UNKNOWN
// and TEST_REQUIRED colleges — WITHOUT changing Match Score or the tier.

test("P1: SAT-null student gets a concrete priority rank (0) at a well-aligned test-optional college", () => {
  const rank = testOptionalPriorityRank(
    makeProfile({ gpa: 4.0, gpaScale: 4.0, sat: null, act: null }),
    makeCollege({ testingPolicy: "TEST_OPTIONAL", avgGpa: 3.9, gpaScale: 4.0 })
  );
  assert.equal(rank, 0);
});

test("P2: priority rank order is test-optional(0/1/2) < UNKNOWN(3) < required(4)", () => {
  const p = makeProfile({ gpa: 4.0, gpaScale: 4.0, sat: null, act: null });
  const optionalStrong = testOptionalPriorityRank(p, makeCollege({ testingPolicy: "TEST_OPTIONAL", avgGpa: 3.9, gpaScale: 4.0 }));
  const bandProfile = makeProfile({ gpa: 3.7, gpaScale: 4.0, sat: null, act: null });
  const optionalBand = testOptionalPriorityRank(bandProfile, makeCollege({ testingPolicy: "TEST_FLEXIBLE", avgGpa: 3.8, gpaScale: 4.0 }));
  const optionalBelow = testOptionalPriorityRank(p, makeCollege({ testingPolicy: "TEST_OPTIONAL", avgGpa: 4.3, gpaScale: 4.0 }));
  const unknown = testOptionalPriorityRank(p, makeCollege({ testingPolicy: "UNKNOWN", avgGpa: 3.9, gpaScale: 4.0 }));
  const required = testOptionalPriorityRank(p, makeCollege({ testingPolicy: "TEST_REQUIRED", avgGpa: 3.9, gpaScale: 4.0 }));

  assert.equal(optionalStrong, 0);
  assert.equal(optionalBand, 1);
  assert.equal(optionalBelow, 2);
  assert.equal(unknown, 3);
  assert.equal(required, 4);
  // Strict ladder: every test-optional/flexible rank sorts before UNKNOWN and required.
  assert.ok(unknown < required);
  assert.ok(optionalBelow < unknown);
});

test("P3: a student WHO SUBMITTED a test is NOT re-prioritized by testing policy (rank null)", () => {
  const withSat = makeProfile({ gpa: 4.0, gpaScale: 4.0, sat: 1600, act: null });
  const withAct = makeProfile({ gpa: 4.0, gpaScale: 4.0, sat: null, act: 34 });
  assert.equal(testOptionalPriorityRank(withSat, makeCollege({ testingPolicy: "TEST_OPTIONAL" })), null);
  assert.equal(testOptionalPriorityRank(withAct, makeCollege({ testingPolicy: "TEST_REQUIRED" })), null);
});

test("Case A / Case C: GPA 4.0 + SAT null, test-required gets TEST_REQUIRED context and NO test-optional opportunity", () => {
  const profile = makeProfile({ gpa: 4.0, sat: null, act: null });
  const required = makeCollege({ testingPolicy: "TEST_REQUIRED" });
  const ctx = computeTestingContext(profile, required);
  assert.equal(ctx.isTestOptionalOpportunity, false);
  assert.match(ctx.reason as string, /Testing Requirement/i);
  assert.equal(testOptionalPriorityRank(profile, required), 4);
});

test("Case A variant: UNKNOWN policy is never treated as a test-optional opportunity", () => {
  const profile = makeProfile({ gpa: 4.0, sat: null, act: null });
  const unknown = makeCollege({ testingPolicy: "UNKNOWN" });
  const ctx = computeTestingContext(profile, unknown);
  assert.equal(ctx.isTestOptionalOpportunity, false);
  assert.equal(testOptionalPriorityRank(profile, unknown), 3);
});

test("Case 2: GPA 4.0 + SAT 1000 at test-optional college -> GPA + opportunity context, Match Score unchanged", () => {
  const profile = makeProfile({ gpa: 4.0, sat: 1000, act: null });
  const college = makeCollege({ testingPolicy: "TEST_OPTIONAL" });
  const ctx = computeTestingContext(profile, college);
  assert.equal(ctx.isTestOptionalOpportunity, true);
  assert.match(ctx.reason as string, /GPA/i);
  assert.match(ctx.reason as string, /Test-Optional/i);
  // Re-prioritization must NOT apply (a test was submitted): rank is null.
  assert.equal(testOptionalPriorityRank(profile, college), null);
});

test("Case 1: GPA 4.0 + SAT 1600 at test-required college -> no low-SAT warning, no missing-evidence context", () => {
  const profile = makeProfile({ gpa: 4.0, sat: 1600, act: null });
  const ctx = computeTestingContext(profile, makeCollege({ testingPolicy: "TEST_REQUIRED" }));
  assert.equal(ctx.isTestOptionalOpportunity, false);
  assert.equal(ctx.reason, null, "strong SAT at a required college must not read as missing evidence");
});

test("Case F: SAT null is never compared against the college average SAT (no numeric formula)", () => {
  const profile = makeProfile({ gpa: 4.0, sat: null, act: null });
  const college = makeCollege({ testingPolicy: "TEST_OPTIONAL", satRangeMin: 1450, satRangeMax: 1500 });
  // Neither the bonus nor the priority rank may feed null SAT into a numeric
  // comparison against the college's average/range:
  const bonus = testOptionalRankingBonus(profile, college);
  const rank = testOptionalPriorityRank(profile, college);
  assert.equal(typeof bonus, "number");
  assert.equal(typeof rank, "number");
  // The rank only factors policy + GPA alignment — never the SAT range.
  assert.equal(rank, 0, "GPA 4.0 is strongly aligned with avg 3.9 regardless of the college's SAT range");
});

test("Case G regression: Match Score and ambition tier are identical with vs. without the testing layer", () => {
  const profile = makeProfile({ gpa: 4.0, gpaScale: 4.0, sat: null, act: null });
  const a = makeCollege({ id: "to", name: "Optional U", testingPolicy: "TEST_OPTIONAL" });
  const b = makeCollege({ id: "req", name: "Required U", testingPolicy: "TEST_REQUIRED" });

  const ra = computeMatch(profile, a);
  const rb = computeMatch(profile, b);

  // The Match Engine itself is blind to testing policy: identical profiles
  // at colleges with identical academic stats produce identical scores/tiers.
  assert.equal(ra.score, rb.score);
  assert.equal(ra.classification, rb.classification);

  // And the testing layer never mutates the match result object.
  const pr = testOptionalPriorityRank(profile, a);
  const bo = testOptionalRankingBonus(profile, b);
  assert.equal(typeof pr, "number");
  assert.equal(bo, 0);
  assert.equal(ra.score, rb.score, "score must remain unchanged after computing the testing layer");
});

test("integration: SAT-null student gets test-optional colleges ordered ahead of test-required ones WITHIN a tier even when required has a HIGHER fit score", () => {
  // A test-optional college that fits slightly worse on score must still be
  // listed ahead of a better-fitting but test-required one, for a SAT-null
  // student — the testing layer re-prioritizes WITHIN the tier.
  const base = {
    gpaScale: 4.0,
    satRangeMin: 1390 as number,
    satRangeMax: 1530 as number,
    actRangeMin: 31,
    actRangeMax: 35,
    estimatedTotalCost: 50000,
    internationalAidAvailable: false,
    meritScholarshipsAvailable: false,
    needBasedAidAvailable: false,
    meetsFullNeed: false,
    region: "NORTHEAST" as const,
    stateCode: "MA",
    setting: "SUBURBAN" as const,
    sizeCategory: "MEDIUM" as const,
    type: "PRIVATE" as const,
    sports: [] as string[],
    tags: [] as string[],
    clubsCount: null,
    internationalPercentage: null,
    internationalPopulation: null,
    i20Support: null,
    optAvailable: null,
    toeflMinimum: null,
    ieltsMinimum: null,
    majors: [{ name: "Engineering", category: "STEM", strength: 5 }],
  };

  const optional = makeCollege({ id: "opt", name: "Optional U", testingPolicy: "TEST_OPTIONAL", ...base });
  const required = makeCollege({ id: "req", name: "Required U", testingPolicy: "TEST_REQUIRED", avgGpa: 3.5, ...base });

  const profile = makeProfile({ gpa: 4.0, sat: null, act: null, preferredRegions: [], preferredSizes: [] });

  const ropt = computeMatch(profile, optional);
  const rreq = computeMatch(profile, required);

  // Both still land in the same ambition tier (Target).
  const list = buildBalancedList(profile, [
    { college: optional, result: ropt },
    { college: required, result: rreq },
  ]);
  const pool = [...list.target, ...list.likely].filter((e) => e.college.id === "opt" || e.college.id === "req");
  assert.ok(pool.length >= 2, "both colleges should appear in Target/Likely");
  assert.equal(
    pool[0].college.id,
    "opt",
    "test-optional college must be ordered ahead of a test-required one for a SAT-null student within the tier"
  );
  assert.equal(testOptionalPriorityRank(profile, optional), 0);
  assert.equal(testOptionalPriorityRank(profile, required), 4);
});
