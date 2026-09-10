"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { signOut } from "@/auth";
import { signupSchema } from "@/lib/validation/schemas";

export interface AuthActionResult {
  ok: boolean;
  error?: string;
}

/**
 * Creates a new account (bcrypt-hashed password) and the dedicated
 * blank student profiles. The session itself is established by the
 * client through the Auth.js HTTP credentials flow
 * (POST /api/auth/callback/credentials) so the browser receives the
 * session cookie. Emails are unique, so an existing address is
 * rejected — the row a user logs into is always their own.
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

  return { ok: true };
}

export async function logoutAction(): Promise<AuthActionResult> {
  await signOut({ redirect: false });
  return { ok: true };
}