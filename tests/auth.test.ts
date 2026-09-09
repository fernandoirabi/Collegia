import { test } from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcryptjs";
import { rateLimit } from "../src/lib/rate-limit";
import { isAllowedOrigin } from "../src/lib/origin";
import { signupSchema, loginSchema } from "../src/lib/validation/schemas";

// ============================================================
// AUTHENTICATION — UNIT TESTS (pure; no request/DB context)
//
// Covers the pure helpers that the auth flow relies on: the SSE
// rate limiter, the cross-site origin check, credential validation
// and bcrypt password round-tripping. Service/action integration is
// intentionally not run here because next/headers (via NextAuth
// auth()) requires an actual request scope.
// ============================================================

test("rateLimit allows requests within a window", () => {
  const key = `t-${Date.now()}-a`;
  for (let i = 0; i < 3; i += 1) {
    assert.equal(rateLimit(key, { max: 5, windowMs: 60_000 }), true);
  }
});

test("rateLimit blocks requests above the max", () => {
  const key = `t-${Date.now()}-b`;
  for (let i = 0; i < 5; i += 1) assert.equal(rateLimit(key, { max: 5, windowMs: 60_000 }), true);
  assert.equal(rateLimit(key, { max: 5, windowMs: 60_000 }), false);
});

test("rateLimit keeps separate buckets per key", () => {
  const keyA = `t-${Date.now()}-ca`;
  const keyB = `t-${Date.now()}-cb`;
  assert.equal(rateLimit(keyA, { max: 1, windowMs: 60_000 }), true);
  assert.equal(rateLimit(keyA, { max: 1, windowMs: 60_000 }), false);
  assert.equal(rateLimit(keyB, { max: 1, windowMs: 60_000 }), true);
});

test("rateLimit window resets after expiry", () => {
  const key = `t-${Date.now()}-d`;
  assert.equal(rateLimit(key, { max: 1, windowMs: 20 }), true);
  assert.equal(rateLimit(key, { max: 1, windowMs: 20 }), false);
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      assert.equal(rateLimit(key, { max: 1, windowMs: 20 }), true);
      resolve();
    }, 40);
  });
});

test("isAllowedOrigin allows first-party and local hosts", () => {
  assert.equal(isAllowedOrigin("https://collegia.vercel.app"), true);
  assert.equal(isAllowedOrigin("http://localhost:3000"), true);
  assert.equal(isAllowedOrigin("http://127.0.0.1:3000"), true);
  assert.equal(isAllowedOrigin(null), true);
});

test("isAllowedOrigin rejects third-party origins", () => {
  assert.equal(isAllowedOrigin("https://evil.example.com"), false);
  assert.equal(isAllowedOrigin("https://not-vercel.app"), false);
  assert.equal(isAllowedOrigin("not a url"), false);
});

test("signupSchema rejects short passwords and bad emails", () => {
  assert.equal(signupSchema.safeParse({ email: "a@b.com", password: "short" }).success, false);
  assert.equal(signupSchema.safeParse({ email: "not-an-email", password: "longenough1" }).success, false);
});

test("signupSchema accepts a valid signup", () => {
  const res = signupSchema.safeParse({
    email: "New.User@Example.com",
    password: "correct-horse-battery",
    firstName: "Aiko",
    lastName: "Tanaka",
  });
  assert.equal(res.success, true);
});

test("loginSchema accepts valid credentials and rejects invalid email", () => {
  assert.equal(loginSchema.safeParse({ email: "a@b.com", password: "x" }).success, true);
  assert.equal(loginSchema.safeParse({ email: "nope", password: "x" }).success, false);
});

test("bcrypt hash round-trips for the credential provider", async () => {
  const password = "S3cure-Pass!";
  const hash = await bcrypt.hash(password, 10);
  assert.notEqual(hash, password);
  assert.equal(await bcrypt.compare(password, hash), true);
  assert.equal(await bcrypt.compare("wrong", hash), false);
});

test("bcrypt hashes produce the $2b$ prefix expected by authorize()", async () => {
  const hash = await bcrypt.hash("pw", 4);
  assert.match(hash, /^\$2[ab]\$/);
});