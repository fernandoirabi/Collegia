import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/db/prisma";

// ============================================================
// PER-USER ISOLATION — schema-level integration test
//
// Proves that saved colleges and match scores are scoped to a single
// user id: two users saving the SAME college still read disjoint rows,
// so one user can never observe or mutate another's data. Runs directly
// against the database (not through NextAuth) because getCurrentUserId()
// needs a request scope; the test exercises the exact ON DELETE CASCADE
// FK layout that the services rely on.
// ============================================================

function uniqueEmail(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@isolation.test`;
}

let collegeId: string | null = null;
const ua = { id: null as string | null, email: "" };
const ub = { id: null as string | null, email: "" };

before(async () => {
  const college = await prisma.college.findFirst({ select: { id: true } });
  collegeId = college?.id ?? null;
});

after(async () => {
  if (ua.id) await prisma.user.deleteMany({ where: { id: ua.id } });
  if (ub.id) await prisma.user.deleteMany({ where: { id: ub.id } });
  await prisma.$disconnect();
});

test("two users saving the same college get fully isolated rows", async (t) => {
  if (!collegeId) {
    t.skip("no college in database; cannot exercise saved-college isolation");
    return;
  }

  ua.email = uniqueEmail("ua");
  ub.email = uniqueEmail("ub");

  const userA = await prisma.user.create({
    data: { email: ua.email, passwordHash: await bcrypt.hash("pw", 4), role: "STUDENT" },
  });
  const userB = await prisma.user.create({
    data: { email: ub.email, passwordHash: await bcrypt.hash("pw", 4), role: "STUDENT" },
  });
  ua.id = userA.id;
  ub.id = userB.id;

  await prisma.savedCollege.create({
    data: { userId: userA.id, collegeId, matchScore: 80, matchClassification: "STRONG_MATCH" },
  });
  await prisma.savedCollege.create({
    data: { userId: userB.id, collegeId, matchScore: 60, matchClassification: "TARGET" },
  });

  const forA = await prisma.savedCollege.findMany({ where: { userId: userA.id } });
  const forB = await prisma.savedCollege.findMany({ where: { userId: userB.id } });

  assert.equal(forA.length, 1);
  assert.equal(forB.length, 1);
  assert.equal(forA[0].collegeId, collegeId);
  assert.equal(forB[0].collegeId, collegeId);
  assert.equal(forA[0].matchScore, 80);
  assert.equal(forB[0].matchScore, 60);
  // A's row is never visible when querying B, and vice versa.
  assert.equal(forA.some((r) => r.userId === userB.id), false);
  assert.equal(forB.some((r) => r.userId === userA.id), false);
});

test("deleting a user cascades to their saved colleges only", async (t) => {
  if (!collegeId || !ua.id || !ub.id) {
    t.skip("previous test setup incomplete");
    return;
  }
  const beforeUserB = await prisma.savedCollege.count({ where: { userId: ub.id } });
  await prisma.user.delete({ where: { id: ua.id } });
  const left = await prisma.savedCollege.count({ where: { userId: ub.id } });
  assert.equal(left, beforeUserB);
  const userAColleges = await prisma.savedCollege.count({ where: { userId: ua.id } });
  assert.equal(userAColleges, 0);
});