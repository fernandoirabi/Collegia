import { prisma } from "@/lib/db/prisma";
import type { User } from "@prisma/client";

// ============================================================
// CURRENT USER RESOLUTION
//
// TEMPORARY: There is no authentication yet, so every request
// is resolved to the seeded demo user. This isolates the
// "who is logged in" concern so a real auth provider (NextAuth,
// Supabase Auth, Clerk, ...) can replace this function without
// touching the services below.
// ============================================================

export const DEMO_USER_EMAIL = "demo@collegia.app";

let cachedDemoUserId: string | null = null;

export async function getCurrentUserId(): Promise<string> {
  if (cachedDemoUserId) return cachedDemoUserId;

  let user = await prisma.user.findUnique({ where: { email: DEMO_USER_EMAIL } });

  if (!user) {
    user = await prisma.user.create({
      data: { email: DEMO_USER_EMAIL, firstName: "Aiko", lastName: "Tanaka", role: "STUDENT" },
    });
  }

  cachedDemoUserId = user.id;
  return user.id;
}

export async function getCurrentUser(): Promise<User> {
  const id = await getCurrentUserId();
  const user = await prisma.user.findUniqueOrThrow({ where: { id } });
  return user;
}
