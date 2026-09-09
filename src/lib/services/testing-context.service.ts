// ============================================================
// COLLEGIA — TESTING CONTEXT + TEST-OPTIONAL INTELLIGENCE
//
// An isolated, purely additive layer. Its ONLY job is to help a
// student interpret their own testing situation for a given college.
//
//   - It never changes the Match Score.
//   - It never changes a tier (Dream/Reach/Target/Likely/Safety/Pathway).
//   - It never fabricates a student SAT/ACT (missing stays null).
//   - It only reports a test-optional benefit when the college's
//     testing policy is backed by reliable institutional data.
//
// The Match Engine answers: "How well does this college fit the
// student's profile?"  This layer answers: "How should the student
// interpret their testing situation for this college?"
//
// These responsibilities are intentionally separate and must not be
// mixed.
// ============================================================

// ------------------------------------------------------------------
// TESTING POLICY  (institutional data)
// ------------------------------------------------------------------
//
// `UNKNOWN` means no reliable institutional policy is available. Colleges in
// the catalog without a tracked policy resolve to UNKNOWN and are never
// claimed to be test-optional. The layer honors TEST_OPTIONAL / TEST_FLEXIBLE /
// TEST_REQUIRED wherever reliable institutional data has been seeded, and
// reports UNKNOWN otherwise.
export type TestingPolicy = "TEST_OPTIONAL" | "TEST_FLEXIBLE" | "TEST_REQUIRED" | "UNKNOWN";

// ------------------------------------------------------------------
// STUDENT SAT STATUS  (derived from the student's own profile)
// ------------------------------------------------------------------
export type SatStatus =
  | "NOT_PROVIDED" // no SAT or ACT submitted
  | "SUBMITTED_STRONG"
  | "SUBMITTED_MODERATE"
  | "SUBMITTED_LOW";

export interface TestingContext {
  satStatus: SatStatus;
  testingPolicy: TestingPolicy;
  /** True if the student has submitted an SAT or ACT score. */
  hasSubmittedTest: boolean;
  /** True only when the college has a reliable test-optional/flexible
   *  policy AND the student is realistically better off not emphasizing
   *  a test score. Never true merely because the student omitted a test. */
  isTestOptionalOpportunity: boolean;
  /** A human-readable, neutral context line (null when there is nothing
   *  meaningful to surface). Purely informative — additive only. */
  reason: string | null;
}

// Score thresholds used to categorize a submitted SAT/ACT as strong,
// moderate, or low relative to the overall applicant pool.
export const STRONG_SAT = 1300;
export const MODERATE_SAT = 1000;
export const STRONG_ACT = 29;
export const MODERATE_ACT = 24;

/** A strong cumulative GPA used to decide whether grades are the
 *  student's strongest asset versus a below-par test score. */
export const STRONG_GPA = 3.5;

function satStatusOf(hasAnyTest: boolean, sat: number | null, act: number | null): SatStatus {
  if (!hasAnyTest) return "NOT_PROVIDED";
  const bestSat = sat ?? null;
  const goodSat = bestSat != null && bestSat >= STRONG_SAT;
  const goodAct = act != null && act >= STRONG_ACT;
  if (goodSat || goodAct) return "SUBMITTED_STRONG";

  const fairSat = bestSat != null && bestSat >= MODERATE_SAT;
  const fairAct = act != null && act >= MODERATE_ACT;
  if (fairSat || fairAct) return "SUBMITTED_MODERATE";

  return "SUBMITTED_LOW";
}

// ------------------------------------------------------------------
// TEST-OPTIONAL RANKING BONUS  (ordering only — never scoring/tiers)
// ------------------------------------------------------------------
//
// When a student has NOT submitted any test score (SAT null + ACT null)
// and a college's testing policy is reliably TEST_OPTIONAL / TEST_FLEXIBLE,
// that college is contextually easier to apply to without a score. This
// small, non-zero bonus is used ONLY as a tie-break/ordering nudge WITHIN
// an already-assigned ambition tier.
//
// It NEVER changes the Match Score, a tier, dimension scores, or weights.
// It returns 0 whenever the opportunity does not reliably apply:
//   - the student has submitted any test, OR
//   - the college's policy is not tracked (UNKNOWN/null), OR
//   - the GPAs are not reliably comparable (scales differ/unknown), OR
//   - the student's GPA is below the college's reported average
//     (we only prioritize test-optional when the student is otherwise
//     academically competitive on GPA).
export const SAT_NULL_TEST_OPTIONAL_BONUS = 2;

export function testOptionalRankingBonus(
  profile: { gpa: number | null; gpaScale: number | null; sat: number | null; act: number | null },
  college: { testingPolicy?: TestingPolicy | null; avgGpa: number | null; gpaScale: number | null }
): number {
  // No test submitted is the precondition.
  if (profile.sat != null || profile.act != null) return 0;

  const policy: TestingPolicy = college.testingPolicy ?? "UNKNOWN";
  if (!isTestOptionalOrFlexible(policy)) return 0;

  // Only reward a test-optional college when the student is academically
  // competitive on GPA. Do not assume a scale: if either GPA scale is
  // unknown or they differ, we cannot reliably claim compatibility.
  if (profile.gpa == null || college.avgGpa == null) return 0;
  if (profile.gpaScale == null || college.gpaScale == null) return 0;
  if (Math.abs(profile.gpaScale - college.gpaScale) >= 0.001) return 0;
  if (profile.gpa < college.avgGpa) return 0;

  return SAT_NULL_TEST_OPTIONAL_BONUS;
}

function isTestOptionalOrFlexible(policy: TestingPolicy): boolean {
  return policy === "TEST_OPTIONAL" || policy === "TEST_FLEXIBLE";
}

// ------------------------------------------------------------------
// TEST-OPTIONAL PRIORITY RANK  (ordering key — never scoring/tiers)
// ------------------------------------------------------------------
//
// For a student who has NOT submitted any test score (SAT + ACT both null),
// this returns a small integer RANK (0 = highest priority) capturing how
// "testing-friendly" a college is for that student. It is used by the
// College List Builder ONLY as the PRIMARY sorting key WITHIN an already
// assigned ambition tier. Match Score is still the secondary criterion
// within each rank, so the Match Engine remains the source of truth for
// tier and fit.
//
// Priority ladder (lower number = surfaced first), consistent with the
// teacher's brief:
//   0 — TEST_OPTIONAL / TEST_FLEXIBLE  with a strongly-aligned GPA  (gpa >= avgGpa)
//   1 — TEST_OPTIONAL / TEST_FLEXIBLE  with a reasonably-aligned GPA (within TEST_OPTIONAL_GPA_BAND of avgGpa)
//   2 — TEST_OPTIONAL / TEST_FLEXIBLE  with a weaker or non-comparable GPA
//   3 — UNKNOWN testing policy         (never claimed test-optional)
//   4 — TEST_REQUIRED
//
// It NEVER changes the Match Score, tier, dimension scores, or weights.
// It NEVER fabricates a student SAT/ACT, and NEVER compares a null test
// score against a college's average SAT (no numeric formula touches it).
//
// Returns null when the student submitted any test score: there is no
// re-prioritization, so ordering reverts to Match Score + diversity only.
export type TestingPriorityRank = 0 | 1 | 2 | 3 | 4;

/** GPA points within which a test-optional college counts as "reasonably
 *  aligned" (rank 1) for the student. Below the average by more than this
 *  band drops to rank 2. A documented heuristic, not a data claim. */
export const TEST_OPTIONAL_GPA_BAND = 0.2;

export function testOptionalPriorityRank(
  profile: { gpa: number | null; gpaScale: number | null; sat: number | null; act: number | null },
  college: { testingPolicy?: TestingPolicy | null; avgGpa: number | null; gpaScale: number | null }
): TestingPriorityRank | null {
  // A student who submitted a test is not re-prioritized by testing policy:
  // their own score already speaks for the application.
  if (profile.sat != null || profile.act != null) return null;

  const policy: TestingPolicy = college.testingPolicy ?? "UNKNOWN";

  if (!isTestOptionalOrFlexible(policy)) {
    return policy === "UNKNOWN" ? 3 : 4;
  }

  // Test-optional/flexible: rank is sub-divided by how well the student's
  // GPA aligns with the college's reported average. We never assume the
  // GPA scale; if either scale is unknown or they differ, we cannot
  // reliably claim compatibility and fall back to rank 2.
  if (profile.gpa == null || college.avgGpa == null) return 2;
  if (profile.gpaScale == null || college.gpaScale == null) return 2;
  if (Math.abs(profile.gpaScale - college.gpaScale) >= 0.001) return 2;

  if (profile.gpa >= college.avgGpa) return 0; // strongly aligned
  if (profile.gpa >= college.avgGpa - TEST_OPTIONAL_GPA_BAND) return 1; // reasonably aligned
  return 2; // test-optional but below the reported academic bar
}

/**
 * Build the testing context for a profile against a single college.
 *
 * Null-safe: a missing GPA or missing SAT is never assumed to be a
 * fabricated value, and this function never throws on `gpa: null`
 * (GPA is only consulted for the optional strong-GPA branch, guarded
 * by `profile.gpa != null`).
 */
export function computeTestingContext(
  profile: { gpa: number | null; sat: number | null; act: number | null },
  college: { testingPolicy?: TestingPolicy | null; avgGpa: number | null }
): TestingContext {
  const policy: TestingPolicy = college.testingPolicy ?? "UNKNOWN";
  const hasSubmittedTest = profile.sat != null || profile.act != null;
  const satStatus = satStatusOf(hasSubmittedTest, profile.sat, profile.act);
  const strongGpa = profile.gpa != null && profile.gpa >= STRONG_GPA;

  const policyIsOptional = isTestOptionalOrFlexible(policy);

  // --- Test-Optional / Flexible: opportunity only with reliable policy ---
  if (policyIsOptional && !hasSubmittedTest) {
    return {
      satStatus,
      testingPolicy: policy,
      hasSubmittedTest,
      isTestOptionalOpportunity: true,
      reason:
        "Test-Optional Opportunity — you haven't submitted a test score, and this college lets you apply without one.",
    };
  }

  if (policyIsOptional && strongGpa && (satStatus === "SUBMITTED_LOW" || satStatus === "SUBMITTED_MODERATE")) {
    return {
      satStatus,
      testingPolicy: policy,
      hasSubmittedTest,
      isTestOptionalOpportunity: true,
      reason:
        "Strong GPA, Test-Optional Advantage — your grades are stronger than your standardized test profile. Because this college is test-optional, consider whether submitting your SAT/ACT best represents your application. Only you and your counselor can weigh that choice.",
    };
  }

  // --- Strong GPA + strong SAT: no opportunity, nothing special to say ---
  if (policyIsOptional && strongGpa && satStatus === "SUBMITTED_STRONG") {
    return {
      satStatus,
      testingPolicy: policy,
      hasSubmittedTest,
      isTestOptionalOpportunity: false,
      reason: null,
    };
  }

  // --- Required policy + no test submitted: flag the requirement ---
  if (policy === "TEST_REQUIRED" && !hasSubmittedTest) {
    return {
      satStatus,
      testingPolicy: policy,
      hasSubmittedTest,
      isTestOptionalOpportunity: false,
      reason:
        "Testing Requirement — this college requires standardized test scores, so an SAT or ACT may be necessary for your application.",
    };
  }

  // --- Everything else: no special context (policy unknown, or the
  //     student's submitted score is already competitive). ---
  return {
    satStatus,
    testingPolicy: policy,
    hasSubmittedTest,
    isTestOptionalOpportunity: false,
    reason: null,
  };
}
