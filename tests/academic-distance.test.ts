import { test } from "node:test";
import assert from "node:assert/strict";
import { computeMatch } from "../src/lib/services/match.engine";
import type { EngineCollege, EngineProfile } from "../src/lib/services/match.engine";
import {
  computeGpaGap,
  computeSatGap,
  computeAcademicDistance,
  selectivityLabel,
  selectivityAdmissionMessage,
  gpaBandScale,
} from "../src/lib/services/academic-distance.service";
import { buildBalancedList, type BalancedList } from "../src/lib/services/college-list-builder.service";

function makeProfile(o: Partial<EngineProfile> = {}): EngineProfile {
  return {
    gpa: 3.6,
    gpaScale: 4.0,
    sat: 1320,
    act: null,
    intendedMajor: "Business",
    intendedMajorCategory: "Business",
    preferredStates: [],
    preferredRegions: ["South"],
    preferredSizes: ["Large"],
    publicPrivate: [],
    preferredSettings: [],
    sports: [],
    clubs: [],
    interests: ["Technology"],
    annualBudget: 30000,
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
    acceptanceRate: 40,
    avgGpa: 3.8,
    gpaScale: 4.0,
    satRangeMin: 1450,
    satRangeMax: 1550,
    actRangeMin: 33,
    actRangeMax: 35,
    estimatedTotalCost: 28000,
    internationalAidAvailable: true,
    meritScholarshipsAvailable: true,
    needBasedAidAvailable: true,
    meetsFullNeed: true,
    avgAidInternational: 38000,
    region: "SOUTH",
    stateCode: "GA",
    setting: "SUBURBAN",
    sizeCategory: "LARGE",
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
    majors: [{ name: "Business", category: "Business", strength: 5 }],
    ...o,
  };
}

function assertGapNear(actual: number | null, expected: number): void {
  assert.ok(actual != null, `expected gap ${expected}, got null`);
  assert.ok(Math.abs(actual - expected) < 1e-9, `expected gap ~${expected}, got ${actual}`);
}

// ============================================================
// GPA BANDS  (the section-12 matrix: student vs 3.8 average)
// ============================================================

test("gpa bands: 2.0 vs 3.8 is VERY_FAR_BELOW", () => {
  const g = computeGpaGap(makeProfile({ gpa: 2.0 }), makeCollege());
  assert.equal(g.available, true);
  assertGapNear(g.gpaGap, -1.8);
  assert.equal(g.band, "VERY_FAR_BELOW");
});

test("gpa bands: 2.5 vs 3.8 is VERY_FAR_BELOW", () => {
  const g = computeGpaGap(makeProfile({ gpa: 2.5 }), makeCollege());
  assertGapNear(g.gpaGap, -1.3);
  assert.equal(g.band, "VERY_FAR_BELOW");
});

test("gpa bands: 3.0 vs 3.8 is FAR_BELOW", () => {
  const g = computeGpaGap(makeProfile({ gpa: 3.0 }), makeCollege());
  assertGapNear(g.gpaGap, -0.8);
  assert.equal(g.band, "FAR_BELOW");
});

test("gpa bands: 3.5 vs 3.8 is NEAR_RANGE (Target-able)", () => {
  const g = computeGpaGap(makeProfile({ gpa: 3.5 }), makeCollege());
  assertGapNear(g.gpaGap, -0.3);
  assert.equal(g.band, "NEAR_RANGE");
});

test("gpa bands: 3.7 vs 3.8 is NEAR_RANGE", () => {
  const g = computeGpaGap(makeProfile({ gpa: 3.7 }), makeCollege());
  assertGapNear(g.gpaGap, -0.1);
  assert.equal(g.band, "NEAR_RANGE");
});

test("gpa bands: 3.9 vs 3.8 is ABOVE_RANGE", () => {
  const g = computeGpaGap(makeProfile({ gpa: 3.9 }), makeCollege());
  assertGapNear(g.gpaGap, 0.1);
  assert.equal(g.band, "ABOVE_RANGE");
});

test("gpa bands: 4.0 vs 3.8 is ABOVE_RANGE", () => {
  const g = computeGpaGap(makeProfile({ gpa: 4.0 }), makeCollege());
  assertGapNear(g.gpaGap, 0.2);
  assert.equal(g.band, "ABOVE_RANGE");
});

test("gpa bands: 3.4 vs 3.8 is BELOW_RANGE", () => {
  const g = computeGpaGap(makeProfile({ gpa: 3.4 }), makeCollege());
  assert.equal(g.band, "BELOW_RANGE");
});

test("gpa bands: 2.0 vs 2.8-average college is BELOW_RANGE (not a dramatic mismatch)", () => {
  const g = computeGpaGap(makeProfile({ gpa: 2.0 }), makeCollege({ avgGpa: 2.8 }));
  assertGapNear(g.gpaGap, -0.8);
  assert.equal(g.band, "BELOW_RANGE");
});

test("gpa band scale widens for less selective colleges", () => {
  assert.ok(gpaBandScale(3.8) < gpaBandScale(2.8), "selective colleges should use a narrower GPA scale");
});

// ============================================================
// SAT BANDS  (the section-12 matrix: student vs 1450-1550)
// ============================================================

const SAT_RANGE = { satRangeMin: 1450, satRangeMax: 1550 } as const;

test("sat bands: 1100 vs 1450-1550 is VERY_FAR_BELOW", () => {
  const s = computeSatGap(makeProfile({ sat: 1100 }), makeCollege(SAT_RANGE));
  assert.equal(s.band, "VERY_FAR_BELOW");
});

test("sat bands: 1250 vs 1450-1550 is FAR_BELOW", () => {
  const s = computeSatGap(makeProfile({ sat: 1250 }), makeCollege(SAT_RANGE));
  assert.equal(s.band, "FAR_BELOW");
});

test("sat bands: 1350 vs 1450-1550 is BELOW_RANGE", () => {
  const s = computeSatGap(makeProfile({ sat: 1350 }), makeCollege(SAT_RANGE));
  assert.equal(s.band, "BELOW_RANGE");
});

test("sat bands: 1450 vs 1450-1550 is WITHIN_RANGE", () => {
  const s = computeSatGap(makeProfile({ sat: 1450 }), makeCollege(SAT_RANGE));
  assert.equal(s.band, "WITHIN_RANGE");
});

test("sat bands: 1550 vs 1450-1550 is WITHIN_RANGE", () => {
  const s = computeSatGap(makeProfile({ sat: 1550 }), makeCollege(SAT_RANGE));
  assert.equal(s.band, "WITHIN_RANGE");
});

test("sat bands: 1380 vs 1350-1480 is WITHIN_RANGE (realistic)", () => {
  const s = computeSatGap(
    makeProfile({ sat: 1380 }),
    makeCollege({ satRangeMin: 1350, satRangeMax: 1480 })
  );
  assert.equal(s.band, "WITHIN_RANGE");
});

test("sat bands: 1500 vs 1350-1480 is ABOVE_RANGE", () => {
  const s = computeSatGap(
    makeProfile({ sat: 1500 }),
    makeCollege({ satRangeMin: 1350, satRangeMax: 1480 })
  );
  assert.equal(s.band, "ABOVE_RANGE");
});

// ============================================================
// COMBINED ACADEMIC DISTANCE + REALISM GATE
// ============================================================

test("gate: 2.0 GPA / 1100 SAT vs 3.8 / 1450-1550 is an academic mismatch", () => {
  const d = computeAcademicDistance(makeProfile({ gpa: 2.0, sat: 1100 }), makeCollege());
  assert.equal(d.isAcademicMismatch, true);
  assert.equal(d.isAcademicallyCompetitive, false);
  assert.equal(d.combinedBand, "VERY_FAR_BELOW");
  assert.match(d.message, /significantly below/);
});

test("gate: 2.9 GPA / 1500 SAT vs 3.8 / 1450-1550 remains an academic mismatch", () => {
  const d = computeAcademicDistance(makeProfile({ gpa: 2.9, sat: 1500 }), makeCollege());
  assert.equal(d.isAcademicMismatch, true);
  assert.equal(d.combinedBand, "VERY_FAR_BELOW");
});

test("gate: 3.5 GPA / 1500 SAT vs 3.8 / 1450-1550 is NOT a mismatch (Target-able)", () => {
  const d = computeAcademicDistance(makeProfile({ gpa: 3.5, sat: 1500 }), makeCollege());
  assert.equal(d.isAcademicMismatch, false);
});

test("gate: 3.75 GPA / 1450 SAT vs 3.8 / 1450-1550 is NOT a mismatch", () => {
  const d = computeAcademicDistance(makeProfile({ gpa: 3.75, sat: 1450 }), makeCollege());
  assert.equal(d.isAcademicMismatch, false);
});

test("gate: 4.0 GPA / 1580 SAT vs 3.8 / 1450-1550 is academically competitive", () => {
  const d = computeAcademicDistance(makeProfile({ gpa: 4.0, sat: 1580 }), makeCollege());
  assert.equal(d.isAcademicMismatch, false);
  assert.equal(d.isAcademicallyCompetitive, true);
});

test("gate: strong GPA does NOT mask a dramatically low SAT", () => {
  const d = computeAcademicDistance(
    makeProfile({ gpa: 4.0, sat: 1000 }),
    makeCollege({ satRangeMin: 1450, satRangeMax: 1550 })
  );
  assert.equal(d.isAcademicMismatch, true);
});

test("gate: no academic data never blocks a college", () => {
  const d = computeAcademicDistance(
    makeProfile({ gpa: null, sat: null, act: null }),
    makeCollege()
  );
  assert.equal(d.isAcademicMismatch, false);
  assert.equal(d.combinedBand, null);
});

// ============================================================
// SELECTIVITY VS ACADEMIC FIT
// ============================================================

test("selectivity: message for a competitive student at an elite college", () => {
  const msg = selectivityAdmissionMessage(3.5);
  assert.match(msg, /extremely selective/);
  assert.doesNotMatch(msg, /chance|guarantee|probabil/i);
});

test("selectivity: label tiers", () => {
  assert.equal(selectivityLabel(4), "extremely selective");
  assert.equal(selectivityLabel(15), "highly selective");
  assert.equal(selectivityLabel(35), "selective");
  assert.equal(selectivityLabel(80), "competitive");
});

// ============================================================
// LIST BUILDER INTEGRATION
// ============================================================

const ENG = { name: "Engineering", category: "STEM", strength: 5 };
const BUS = { name: "Business", category: "Business", strength: 5 };
const BUS4 = { name: "Business", category: "Business", strength: 4 };

const CATALOG: EngineCollege[] = [
  makeCollege({
    id: "selective-u",
    name: "Selective U",
    acceptanceRate: 20,
    avgGpa: 3.8,
    satRangeMin: 1450,
    satRangeMax: 1550,
    estimatedTotalCost: 30000,
    region: "SOUTH",
    majors: [BUS, ENG],
  }),
  makeCollege({
    id: "elite-u",
    name: "Elite U",
    acceptanceRate: 4,
    avgGpa: 4.0,
    satRangeMin: 1490,
    satRangeMax: 1580,
    estimatedTotalCost: 80000,
    region: "NORTHEAST",
    majors: [ENG],
  }),
  makeCollege({
    id: "accessible-u",
    name: "Accessible U",
    acceptanceRate: 75,
    avgGpa: 2.9,
    satRangeMin: 1050,
    satRangeMax: 1250,
    estimatedTotalCost: 28000,
    region: "SOUTH",
    majors: [BUS4],
  }),
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

function tierOf(list: BalancedList, id: string): string | null {
  for (const t of ["dream", "reach", "target", "likely", "pathway"] as const) {
    if (list[t].some((e) => e.college.id === id)) return t;
  }
  return null;
}

const WEAK = makeProfile({ gpa: 2.0, sat: 1100, intendedMajor: "Business", intendedMajorCategory: "Business", annualBudget: 30000, preferredRegions: ["South"] });
const STRONG = makeProfile({ gpa: 4.0, sat: 1580, intendedMajor: "Engineering", intendedMajorCategory: "STEM", annualBudget: 80000, preferredRegions: ["Northeast"] });

test("builder: a 3.8-average college is NOT Target/Strong/Likely for a 2.0 student", () => {
  const list = build(WEAK);
  const tier = tierOf(list, "selective-u");
  assert.equal(tier, "dream", `expected selective-u to be Dream for a 2.0/1100 student, got ${tier}`);
  const entry = list.dream.find((e) => e.college.id === "selective-u");
  assert.ok(entry);
  assert.equal(entry.academic.isAcademicMismatch, true);
  assert.equal(entry.academicPositionBand, "VERY_FAR_BELOW");
  assert.match(entry.mainRisk, /significantly below/);
});

test("builder: the same 3.8-average college is realistic (not forced to Dream) for a 4.0 student", () => {
  const list = build(STRONG);
  const tier = tierOf(list, "selective-u");
  assert.ok(
    tier === "reach" || tier === "target" || tier === "likely",
    `expected selective-u to be a realistic tier for a 4.0/1580 student, got ${tier}`
  );
  const entry = [...list.reach, ...list.target, ...list.likely].find(
    (e) => e.college.id === "selective-u"
  );
  assert.ok(entry);
  assert.equal(entry.academic.isAcademicMismatch, false);
});

test("builder: an elite college stays Dream for a 4.0 student because of selectivity", () => {
  const list = build(STRONG);
  const entry = list.dream.find((e) => e.college.id === "elite-u");
  assert.ok(entry, "elite-u should appear in the Dream tier for a strong student");
  assert.equal(entry.academic.isAcademicMismatch, false);
  assert.equal(entry.academic.isAcademicallyCompetitive, true);
  assert.match(entry.mainRisk, /extremely selective|highly selective/);
});

test("builder: the same elite college is Dream-eligible for a 2.0 student, but only for academic-mismatch reasons", () => {
  const list = build(WEAK);
  // Weak profiles cap Dream at 1 and pick the strongest-fitting dream, so
  // the honesty guarantee is that whatever lands in Dream is an academic
  // mismatch — and an elite college is never shown in a realistic tier.
  assert.ok(list.dream.length <= 1, "weak profile caps Dream at 1");
  for (const entry of list.dream) {
    assert.equal(entry.academic.isAcademicMismatch, true);
    assert.match(entry.academic.message, /significantly below/);
  }
  const tier = tierOf(list, "elite-u");
  assert.ok(
    tier === "dream" || tier === null,
    `elite-u must only ever be Dream (never realistic) for a 2.0 student, got ${tier}`
  );
});

test("builder: a weak student's realistic option is the low-bar college, not the 3.8 college", () => {
  const list = build(WEAK);
  const tier = tierOf(list, "accessible-u");
  assert.ok(
    tier === "reach" || tier === "target" || tier === "likely",
    `expected accessible-u to be realistic for a 2.0 student, got ${tier}`
  );
});

test("builder: high match score cannot override a severe academic mismatch", () => {
  // selective-u scores high on major/financial/location for WEAK, but
  // its engine classification must not place it in a realistic tier.
  const inRealistic =
    tierOf(build(WEAK), "selective-u") === "reach" ||
    tierOf(build(WEAK), "selective-u") === "target" ||
    tierOf(build(WEAK), "selective-u") === "likely";
  assert.equal(inRealistic, false);
});

// ============================================================
// HONEST IMPROVEMENTS (no impossible "2.0 -> 3.8" guidance)
// ============================================================

test("improvements: a 2.0 student is never told to raise GPA to 3.8", () => {
  const list = build(WEAK);
  const entry = list.dream.find((e) => e.college.id === "selective-u");
  assert.ok(entry);
  for (const imp of entry.improvements) {
    assert.doesNotMatch(imp.action, /Raise your GPA from 2\.00 toward 3\.80/);
    assert.doesNotMatch(imp.action, /toward 3\.80/);
  }
  const gpaImp = entry.improvements.find((i) => i.title === "Strengthen GPA");
  assert.ok(gpaImp, "expected an academic improvement item");
  assert.match(gpaImp.action, /significantly below/);
  assert.match(gpaImp.action, /more competitive/);
});

test("improvements: a realistic GPA gap suggests a near-term target, not the full leap", () => {
  const profile = makeProfile({ gpa: 3.6, sat: 1450, annualBudget: 30000 });
  const college = makeCollege({ avgGpa: 3.8, satRangeMin: 1450, satRangeMax: 1550 });
  const list = buildBalancedList(profile, scored(profile, [college]));
  const flat = [...list.dream, ...list.reach, ...list.target, ...list.likely, ...list.pathway];
  const entry = flat.find((e) => e.college.id === college.id);
  assert.ok(entry);
  const gpaImp = entry.improvements.find((i) => i.title === "Strengthen GPA");
  assert.ok(gpaImp);
  assert.match(gpaImp.action, /toward 3\.80 this year/);
});

test("improvements: a 1100-vs-1450 SAT gap is framed as long-term, not a near-term jump", () => {
  const list = build(WEAK);
  const entry = list.dream.find((e) => e.college.id === "selective-u");
  assert.ok(entry);
  const satImp = entry.improvements.find((i) => i.title === "Improve SAT score");
  assert.ok(satImp);
  assert.match(satImp.action, /well below/);
  assert.doesNotMatch(satImp.action, /toward 1450/);
});

// ============================================================
// PROFILE A vs PROFILE B academic-position separation
// ============================================================

test("section 12: 4.0/1580 keeps elite colleges as Dream; 2.0/1100 never makes them Target", () => {
  const weak = build(WEAK);
  const strong = build(STRONG);
  for (const id of ["elite-u", "selective-u"]) {
    const weakTier = tierOf(weak, id);
    const strongTier = tierOf(strong, id);
    assert.ok(weakTier === "dream" || weakTier === null, `${id} must not be realistic for a 2.0 student (got ${weakTier})`);
    assert.ok(
      strongTier === "dream" || strongTier === "reach" || strongTier === "target" || strongTier === "likely",
      `${id} should be present for a 4.0 student (got ${strongTier})`
    );
  }
});