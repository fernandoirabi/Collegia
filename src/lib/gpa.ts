// ============================================================
// COLLEGIA — GPA Scale / Validation Helpers
//
// The user declares whether a GPA is Unweighted (4.0 scale) or
// Weighted (5.0 scale). We persist that choice as the existing
// numeric `gpaScale` (4 or 5) because the Match Engine compares
// GPA only when the student and college scales match and it never
// normalizes one scale into another. These helpers keep the client
// and server on identical rules and are exercised by unit tests.
// ============================================================

export const GPA_SCALE_UNWEIGHTED = 4;
export const GPA_SCALE_WEIGHTED = 5;

export type GpaType = "UNWEIGHTED" | "WEIGHTED";

export const GPA_TYPES: { value: GpaType; label: string }[] = [
  { value: "UNWEIGHTED", label: "Unweighted (up to 4.0)" },
  { value: "WEIGHTED", label: "Weighted (up to 5.0)" },
];

export const GPA_LABELS: Record<GpaType, string> = {
  UNWEIGHTED: "Unweighted: up to 4.0",
  WEIGHTED: "Weighted: up to 5.0",
};

export function gpaScaleForType(type: GpaType): number {
  return type === "WEIGHTED" ? GPA_SCALE_WEIGHTED : GPA_SCALE_UNWEIGHTED;
}

export function gpaTypeForScale(scale: number | null | undefined): GpaType {
  return scale === GPA_SCALE_WEIGHTED ? "WEIGHTED" : "UNWEIGHTED";
}

/** The maximum GPA permitted on a given scale, or null if the scale is not a
 *  supported Unweighted/Weighted scale. */
export function gpaMaxForScale(scale: number | null | undefined): number | null {
  if (scale === GPA_SCALE_UNWEIGHTED) return 4;
  if (scale === GPA_SCALE_WEIGHTED) return 5;
  return null;
}

export interface GpaParseResult {
  valid: boolean;
  /** The parsed GPA, or null when the field was left empty (absence of GPA). */
  value: number | null;
  error?: string;
}

/** Client-side GPA validation shared by the profile form and the Match wizard.
 *  Empty input means "no GPA provided" (preserved as null, never fabricated).
 *  A provided value must be a non-negative number at or below the scale max —
 *  it is rejected (never clamped or silently adjusted) when it exceeds it. */
export function parseGpa(raw: string | null | undefined, scale: GpaType | number): GpaParseResult {
  const trimmed = raw?.trim() ?? "";
  if (!trimmed) return { valid: true, value: null };

  const gpa = Number(trimmed);
  if (Number.isNaN(gpa)) {
    return { valid: false, value: null, error: "GPA must be a number." };
  }
  if (gpa < 0) {
    return { valid: false, value: null, error: "GPA cannot be negative." };
  }

  const max = typeof scale === "number" ? gpaMaxForScale(scale) : gpaMaxForScale(gpaScaleForType(scale));
  if (max == null) {
    return { valid: false, value: null, error: "Select whether your GPA is Unweighted or Weighted." };
  }
  if (gpa > max) {
    return {
      valid: false,
      value: null,
      error:
        max === 4
          ? "GPA on a 4.0 (Unweighted) scale cannot exceed 4.0. Switch to Weighted to enter a weighted GPA."
          : "GPA on a 5.0 (Weighted) scale cannot exceed 5.0.",
    };
  }
  return { valid: true, value: gpa };
}