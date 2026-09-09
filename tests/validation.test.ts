import { test } from "node:test";
import assert from "node:assert/strict";
import { profileUpdateSchema, createGoalSchema } from "../src/lib/validation/schemas";

// ============================================================
// SAT VALIDATION + GOAL IDEMPOTENCY (server schema)
//
// Launch Slice 2 requires that a provided SAT stay within the real
// 400–1600 scale at the server boundary too (never silently clamped
// or nulled), and that the Match wizard can create a goal idempotently
// so repeated runs do not duplicate "Your Goals".
// ============================================================

test("SAT must be a whole number between 400 and 1600", () => {
  assert.equal(profileUpdateSchema.safeParse({ satScore: 400 }).success, true);
  assert.equal(profileUpdateSchema.safeParse({ satScore: 1600 }).success, true);
  assert.equal(profileUpdateSchema.safeParse({ satScore: 1000 }).success, true);
});

test("out-of-range or non-integer SAT is rejected at the server boundary", () => {
  assert.equal(profileUpdateSchema.safeParse({ satScore: 399 }).success, false);
  assert.equal(profileUpdateSchema.safeParse({ satScore: 1601 }).success, false);
  assert.equal(profileUpdateSchema.safeParse({ satScore: 1000.5 }).success, false);
  assert.equal(profileUpdateSchema.safeParse({ satScore: -1 }).success, false);
});

test("empty SAT is accepted as explicit null (not fabricated)", () => {
  const parsed = profileUpdateSchema.safeParse({ satScore: null });
  assert.equal(parsed.success, true);
  if (parsed.success) assert.equal(parsed.data.satScore, null);
});

test("createGoalSchema accepts the idempotent flag", () => {
  const parsed = createGoalSchema.safeParse({
    title: "Raise GPA",
    category: "ACADEMIC",
    priority: "MEDIUM",
    idempotent: true,
  });
  assert.equal(parsed.success, true);
  if (parsed.success) assert.equal(parsed.data.idempotent, true);
});

test("createGoalSchema still rejects clearly invalid goals", () => {
  assert.equal(createGoalSchema.safeParse({ title: "" }).success, false);
  assert.equal(createGoalSchema.safeParse({}).success, false);
  assert.equal(createGoalSchema.safeParse({ title: "x", targetValue: -5 }).success, false);
});
