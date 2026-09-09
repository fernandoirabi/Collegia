import { test } from "node:test";
import assert from "node:assert/strict";
import {
  NOT_REPORTED,
  formatPercent,
  formatGpa,
  formatRange,
  formatCost,
  formatCostK,
  formatCount,
} from "../src/lib/format";

// ============================================================
// NULL / UNKNOWN PRESENTATION HONESTY
//
// Launch Slice 2 forbids converting a missing (null / NaN) value
// into a misleading 0 or fabricated number at display time. These
// helpers must always render a neutral "Not reported" placeholder.
// ============================================================

test("null values render 'Not reported', never a fabricated 0", () => {
  assert.equal(formatPercent(null), NOT_REPORTED);
  assert.equal(formatGpa(null), NOT_REPORTED);
  assert.equal(formatRange(null, null), NOT_REPORTED);
  assert.equal(formatCost(null), NOT_REPORTED);
  assert.equal(formatCostK(null), NOT_REPORTED);
  assert.equal(formatCount(null), NOT_REPORTED);
});

test("undefined and NaN values also render 'Not reported'", () => {
  assert.equal(formatPercent(undefined), NOT_REPORTED);
  assert.equal(formatGpa(undefined), NOT_REPORTED);
  assert.equal(formatCost(undefined), NOT_REPORTED);
  assert.equal(formatCount(undefined), NOT_REPORTED);
  assert.equal(formatPercent(Number.NaN), NOT_REPORTED);
  assert.equal(formatGpa(Number.NaN), NOT_REPORTED);
  assert.equal(formatCost(Number.NaN), NOT_REPORTED);
  assert.equal(formatCount(Number.NaN), NOT_REPORTED);
});

test("present values are formatted, and a partial range shows only known bound", () => {
  assert.equal(formatPercent(42), "42%");
  assert.equal(formatGpa(3.5), "3.5");
  assert.equal(formatRange(1330, 1490), "1330–1490");
  assert.equal(formatRange(null, 1490), "1490");
  assert.equal(formatCost(28700), "$28,700");
  assert.equal(formatCostK(28700), "$29K");
  assert.equal(formatCount(120), "120");
});
