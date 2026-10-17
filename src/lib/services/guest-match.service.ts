// ============================================================
// COLLEGIA — GUEST MATCH INPUT
//
// College Match is available to signed-out visitors. Instead of
// persisting a database profile, a guest's wizard answers are
// validated on the server and adapted into the same
// StudentProfileView shape the Match Engine already consumes, so
// guests and authenticated students run through one code path.
//
// This module is pure: no I/O, no database, no auth. It is fully
// unit-testable and safe to import from anywhere.
// ============================================================

import type { z } from "zod";
import { matchWizardInputSchema } from "@/lib/validation/schemas";
import type { StudentProfileView } from "./profile.service";

export type MatchWizardInput = z.infer<typeof matchWizardInputSchema>;

export type ParsedMatchInput =
  | { ok: true; data: MatchWizardInput }
  | { ok: false; error: string };

/** Validates a raw (untrusted) wizard payload. */
export function parseMatchWizardInput(raw: unknown): ParsedMatchInput {
  const parsed = matchWizardInputSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error:
        parsed.error.issues[0]?.message ??
        "Your match details were invalid. Please review your answers.",
    };
  }
  return { ok: true, data: parsed.data };
}

/**
 * Adapts validated guest answers into the exact view the Match Engine
 * consumes. Unanswered fields stay null/empty — nothing is fabricated.
 */
export function buildGuestProfileView(input: MatchWizardInput): StudentProfileView {
  const { academic, prefs } = input;
  return {
    id: "guest",
    userId: "guest",
    firstName: null,
    lastName: null,
    name: "Guest",
    country: null,
    isInternationalStudent: academic.isInternationalStudent ?? true,
    gpa: academic.gpa ?? null,
    gpaScale: academic.gpaScale ?? null,
    satScore: academic.satScore ?? null,
    actScore: academic.actScore ?? null,
    classYear: academic.classYear ?? null,
    intendedMajor: academic.intendedMajor ?? null,
    applicationYear: null,
    intendedEnrollmentYear: null,
    preferences: {
      preferredStates: [],
      preferredRegions: prefs.preferredRegions ?? [],
      preferredSizes: prefs.preferredSizes ?? [],
      publicPrivate: [],
      settings: [],
      sports: [],
      clubs: [],
      interests: [],
    },
    financialAid: {
      annualBudget: prefs.annualBudget ?? null,
      requiresFinancialAid: null,
      requiresScholarship: null,
      currency: null,
      fundingSource: null,
    },
    international: {
      englishProficiencyTest: null,
      englishProficiencyScore: null,
      ieltsScore: null,
      visaType: null,
      needsI20Support: null,
    },
  };
}

export type ResolvedProfileSource =
  | { kind: "authenticated" }
  | { kind: "guest"; profile: StudentProfileView }
  | { kind: "invalid"; error: string };

/**
 * Decides where a match request's profile comes from.
 *
 * A signed-in caller is always the authoritative source and the request
 * body is ignored, so authenticated behavior is unchanged. A signed-out
 * caller is only served if their body validates; otherwise the request is
 * rejected — never silently downgraded to a fabricated profile.
 */
export function resolveProfileSource(
  session: { user?: { id?: string | null } | null } | null,
  rawBody: unknown
): ResolvedProfileSource {
  if (session?.user?.id) return { kind: "authenticated" };

  const parsed = parseMatchWizardInput(rawBody);
  if (!parsed.ok) return { kind: "invalid", error: parsed.error };

  return { kind: "guest", profile: buildGuestProfileView(parsed.data) };
}

/**
 * True for the pipeline's own validation failure. Duck-typed by name so
 * this pure module never has to import the database-backed service.
 */
export function isMatchValidationError(err: unknown): boolean {
  return err instanceof Error && err.name === "MatchValidationError";
}

/**
 * Runs the match pipeline and emits exactly one terminal event: a `result`
 * on success or an `error` on failure. An unexpected failure is logged
 * server-side with context and NEVER surfaced as a successful result.
 */
export async function emitMatchEvents(
  run: () => Promise<unknown>,
  send: (payload: unknown) => void,
  context: Record<string, unknown> = {}
): Promise<void> {
  try {
    const view = await run();
    send({ type: "result", view });
  } catch (err) {
    if (isMatchValidationError(err)) {
      send({ type: "error", message: (err as Error).message });
      return;
    }
    console.error("[match/stream] match pipeline failed", {
      ...context,
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    });
    send({ type: "error" });
  }
}
