import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import type { UserRole } from "@prisma/client";
import type { JWT } from "next-auth/jwt";

// ============================================================
// COLLEGIA — AUTHENTICATION (Auth.js / NextAuth v5 beta)
//
// Email + password credentials provider with stateless JWT
// sessions. Credentials is the only provider suited to the
// current stack: Supabase Auth is not configured (only the raw
// Postgres pooler URL exists) and OAuth would require external
// provider setup. Passwords are hashed with bcrypt; sessions
// are signed with AUTH_SECRET and stored in an httpOnly cookie.
// ============================================================

// --- Type augmentation for typed session/token access ----------
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      name?: string | null;
      email?: string | null;
    };
  }
  interface User {
    id: string;
    role: UserRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
  }
}

export const authConfig = {
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt" as const, maxAge: 60 * 60 * 24 * 30 },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: [user.firstName, user.lastName].filter(Boolean).join(" ") || null,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
} satisfies import("next-auth").NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);