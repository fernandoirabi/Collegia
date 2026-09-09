import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import type { User } from "@prisma/client";

// ============================================================
// COLLEGIA — CURRENT USER RESOLUTION
//
// Resolves "who is signed in" from the real Auth.js session.
// Previously this returned a hardcoded demo user for everyone;
// now it reflects the authenticated user or null for guests.
//
//   getCurrentUserId()   -> string | null  (never throws)
//   getCurrentUser()     -> User | null    (never throws)
//   requireCurrentUserId -> string         (throws when guest)
//
// Services read with getCurrentUserId() (guests see empty/neutral
// data); mutations and sensitive endpoints use requireCurrentUserId()
// so an unauthenticated actor can never write or read someone else's
// rows.
// ============================================================

export class AuthenticationError extends Error {
  constructor(message = "You must be signed in to do that.") {
    super(message);
    this.name = "AuthenticationError";
  }
}

export async function getCurrentUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

export async function getCurrentUser(): Promise<User | null> {
  const userId = await getCurrentUserId();
  if (!userId) return null;
  return prisma.user.findUnique({ where: { id: userId } });
}

/**
 * Returns the authenticated user id or throws AuthenticationError.
 * Use this anywhere a mutation or sensitive read must be gated.
 */
export async function requireCurrentUserId(): Promise<string> {
  const userId = await getCurrentUserId();
  if (!userId) throw new AuthenticationError();
  return userId;
}