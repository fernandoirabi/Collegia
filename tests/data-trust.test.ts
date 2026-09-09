import { test } from "node:test";
import assert from "node:assert/strict";
import { mapCollegeToUI, type CollegeWithRelations } from "../src/lib/services/college.service";

// ============================================================
// DATA TRUST + FABRICATED STAT REMOVAL
//
// Launch Slice 2 surfaces whether a college profile is preview/demo
// data instead of quietly presenting it as verified truth, and stops
// inventing figures (e.g. countries represented) that are not stored.
// ============================================================

function makeCollege(o: Partial<CollegeWithRelations> = {}): CollegeWithRelations {
  return {
    id: "col1",
    slug: "test-u",
    name: "Test U",
    shortName: null,
    website: null,
    city: "Boston",
    state: "Massachusetts",
    stateCode: "MA",
    region: "NORTHEAST",
    latitude: null,
    longitude: null,
    type: "PRIVATE",
    setting: "SUBURBAN",
    sizeCategory: "MEDIUM",
    undergraduateEnrollment: null,
    campusSizeAcres: null,
    acceptanceRate: 20,
    avgGpa: 3.9,
    gpaScale: 4.0,
    satRangeMin: 1330,
    satRangeMax: 1490,
    actRangeMin: 30,
    actRangeMax: 34,
    testingPolicy: null,
    graduationRate: 90,
    studentFacultyRatio: null,
    tuitionInState: null,
    tuitionOutOfState: null,
    tuitionInternational: 55000,
    roomAndBoard: 16000,
    estimatedTotalCostInternational: 71000,
    internationalAidAvailable: false,
    meritScholarshipsAvailable: null,
    needBasedAidAvailable: null,
    meetsFullNeed: false,
    avgAidInternational: null,
    internationalPercentage: null,
    internationalPopulation: null,
    englishProficiencyRequirement: null,
    toeflMinimum: null,
    ieltsMinimum: null,
    i20Support: false,
    optAvailable: false,
    housing: null,
    clubsCount: null,
    greekLife: false,
    image: "/images/hero_campus.jpg",
    coverImage: null,
    tags: [],
    featured: false,
    isDemoData: false,
    dataSource: null,
    dataSourceUrl: null,
    dataCollectedAt: null,
    dataYear: null,
    verificationStatus: "VERIFIED",
    createdAt: new Date(),
    updatedAt: new Date(),
    sports: [],
    majors: [],
    deadlines: [],
    ...o,
  };
}

test("mapCollegeToUI passes through the trust indicators from the DB row", () => {
  const demo = mapCollegeToUI(makeCollege({ isDemoData: true, verificationStatus: "DEMO" }));
  assert.equal(demo.isDemoData, true);
  assert.equal(demo.verificationStatus, "DEMO");

  const unverified = mapCollegeToUI(makeCollege({ isDemoData: false, verificationStatus: "UNVERIFIED" }));
  assert.equal(unverified.isDemoData, false);
  assert.equal(unverified.verificationStatus, "UNVERIFIED");

  const verified = mapCollegeToUI(makeCollege({ isDemoData: false, verificationStatus: "VERIFIED" }));
  assert.equal(verified.verificationStatus, "VERIFIED");
});

test("countriesRepresented is exposed as null, never fabricated", () => {
  const ui = mapCollegeToUI(makeCollege());
  assert.equal(ui.international.countriesRepresented, null);
});

test("null stats are preserved as null after mapping (not coerced to 0 or average)", () => {
  const ui = mapCollegeToUI(
    makeCollege({
      internationalPercentage: null,
      avgAidInternational: null,
      graduationRate: null,
      studentFacultyRatio: null,
    })
  );
  assert.equal(ui.international.internationalPercentage, null);
  assert.equal(ui.financial.avgAidAmount, undefined);
  assert.equal(ui.academics.graduationRate, null);
});
