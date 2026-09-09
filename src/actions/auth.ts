"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { signIn, signOut } from "@/auth";
import { loginSchema, signupSchema } from "@/lib/validation/schemas";

export interface AuthActionResult {
  ok: boolean;
  error?: string;
}

/**
 * Creates a new account (bcrypt-hashed password), a dedicated blank
 * student profile, and signs the user in. Emails are unique, so an
 * existing address is rejected — the row that a user logs into is
 * always their own.
 */
export async function signupAction(rawInput: unknown): Promise<AuthActionResult> {
  const parsed = signupSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false, error: "Enter a valid email and a password of at least 8 characters." };
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return { ok: false, error: "An account with that email already exists. Try signing in." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        email: parsed.data.email,
        firstName: parsed.data.firstName ?? null,
        lastName: parsed.data.lastName ?? null,
        passwordHash,
        role: "STUDENT",
      },
    });

    await prisma.studentProfile.create({ data: { userId: user.id } });
    await prisma.collegePreference.create({ data: { userId: user.id } });
    await prisma.financialAidProfile.create({ data: { userId: user.id } });
    await prisma.internationalProfile.create({ data: { userId: user.id } });
  } catch {
    return { ok: false, error: "Unable to create your account right now. Please try again." };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
  } catch {
    return { ok: false, error: "Account created. Please sign in with your email and password." };
  }

  return { ok: true };
}

/**
 * Signs in an existing account. Uses `redirect: false` so the caller
 * controls navigation; a failed login never exposes whether the email
 * or the password was wrong.
 */
export async function loginAction(rawInput: unknown): Promise<AuthActionResult> {
  const parsed = loginSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false, error: "Enter your email and password to sign in." };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
  } catch {
    return { ok: false, error: "Invalid email or password." };
  }

  return { ok: true };
}

export async function logoutAction(): Promise<AuthActionResult> {
  await signOut({ redirect: false });
  return { ok: true };
}