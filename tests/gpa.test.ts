import { test } from "node:test";
import assert from "node:assert/strict";
import { profileUpdateSchema } from "../src/lib/validation/schemas";
import {
  parseGpa,
  gpaScaleForType,
  gpaTypeForScale,
  gpaMaxForScale,
  GPA_SCALE_UNWEIGHTED,
  GPA_SCALE_WEIGHTED,
} from "../src/lib/gpa";

// ============================================================
// WEIGHTED / UNWEIGHTED GPA — client helper + server schema
//
// Unweighted GPA caps at 4.0, Weighted caps at 5.0. A GPA above
// the selected scale's maximum is rejected — never clamped or
// re-normalized. Canada/IB/etc. are out of scope; only the two
// requested scales are supported.
// ============================================================

function parseProfile(gpa: number | null | undefined, gpaScale: number | null | undefined) {
  return profileUpdateSchema.safeParse({ gpa, gpaScale });
}

test("weighted/unweighted map to the 5.0 / 4.0 scales the Match Engine compares", () => {
  assert.equal(gpaScaleForType("UNWEIGHTED"), GPA_SCALE_UNWEIGHTED);
  assert.equal(gpaScaleForType("WEIGHTED"), GPA_SCALE_WEIGHTED);
  assert.equal(gpaTypeForScale(4), "UNWEIGHTED");
  assert.equal(gpaTypeForScale(5), "WEIGHTED");
  assert.equal(gpaTypeForScale(null), "UNWEIGHTED");
  assert.equal(gpaMaxForScale(4), 4);
  assert.equal(gpaMaxForScale(5), 5);
  assert.equal(gpaMaxForScale(4.5), null);
  assert.equal(gpaMaxForScale(null), null);
});

test("Unweighted 4.0 -> valid", () => {
  assert.equal(parseGpa("4.0", "UNWEIGHTED").valid, true);
  assert.equal(parseGpa("4.0", "UNWEIGHTED").value, 4);
  assert.equal(parseProfile(4.0, 4).success, true);
});

test("Unweighted 4.1 -> invalid", () => {
  const client = parseGpa("4.1", "UNWEIGHTED");
  assert.equal(client.valid, false);
  assert.match(client.error as string, /4\.0/);
  assert.equal(parseProfile(4.1, 4).success, false);
});

test("Weighted 4.0 -> valid", () => {
  assert.equal(parseGpa("4.0", "WEIGHTED").valid, true);
  assert.equal(parseProfile(4.0, 5).success, true);
});

test("Weighted 4.5 -> valid", () => {
  const client = parseGpa("4.5", "WEIGHTED");
  assert.equal(client.valid, true);
  assert.equal(client.value, 4.5);
  assert.equal(parseProfile(4.5, 5).success, true);
});

test("4.5 as Unweighted -> rejected (only valid on the Weighted scale)", () => {
  const client = parseGpa("4.5", "UNWEIGHTED");
  assert.equal(client.valid, false);
  assert.match(client.error as string, /Weighted/);
  assert.equal(parseProfile(4.5, 4).success, false);
});

test("Weighted 5.0 -> valid", () => {
  assert.equal(parseGpa("5.0", "WEIGHTED").valid, true);
  assert.equal(parseProfile(5.0, 5).success, true);
});

test("Weighted 5.1 -> invalid", () => {
  const client = parseGpa("5.1", "WEIGHTED");
  assert.equal(client.valid, false);
  assert.match(client.error as string, /5\.0/);
  assert.equal(parseProfile(5.1, 5).success, false);
});

test("negative GPA values -> invalid on both client and server", () => {
  assert.equal(parseGpa("-1", "UNWEIGHTED").valid, false);
  assert.equal(parseGpa("-1", "WEIGHTED").valid, false);
  // The server schema also rejects negatives even inside its base min(0).
  assert.equal(parseProfile(-0.5, 4).success, false);
  assert.equal(parseProfile(-0.5, 5).success, false);
});

test("empty value -> preserved as absence of GPA (null), not fabricated", () => {
  assert.deepEqual(parseGpa("", "UNWEIGHTED"), { valid: true, value: null });
  assert.deepEqual(parseGpa("   ", "WEIGHTED"), { valid: true, value: null });
  assert.equal(parseProfile(null, null).success, true);
  // No GPA + a declared scale is still a valid, coherent profile.
  assert.equal(parseProfile(null, 5).success, true);
});

test("non-numeric GPA -> invalid on the client helper", () => {
  assert.equal(parseGpa("abc", "WEIGHTED").valid, false);
  assert.equal(parseGpa("4,5", "WEIGHTED").valid, false);
});

test("a GPA on a non-4.0/5.0 scale is rejected by the server schema", () => {
  assert.equal(parseProfile(3.8, 4.5).success, false);
});

test("server schema rejects an Unweighted GPA far above 4.0 even in valid range coercion", () => {
  // 4.999 is still a legal weighted value but is illegal on scale 4.
  assert.equal(parseProfile(4.999, 4).success, false);
  assert.equal(parseProfile(4.999, 5).success, true);
});