// ============================================================
// COLLEGIA — MATCH PIPELINE STAGE METADATA
//
// Single source of truth for the College Match loading experience.
// Each entry maps a real pipeline boundary (see
// college-list-builder.service.ts) to:
//   - the progress percentage shown at that boundary
//   - the short, student-friendly step copy
//   - a longer "finalizing" style message used while the last stages
//     stream in, so the bar is never left frozen at a high %.
//
// The progress values are chosen to reasonably reflect the real
// distribution of work (profile + catalog are the heavy DB stages on
// high-latency connections, so they claim the largest share).
// ============================================================

import type { MatchPipelineStage } from "@/lib/services/college-list-builder.service";

export interface MatchStageMeta {
  progress: number;
  label: string;
}

export const MATCH_STAGES: Record<MatchPipelineStage, MatchStageMeta> = {
  profile: { progress: 15, label: "Loading your academic profile" },
  catalog: { progress: 45, label: "Gathering college data" },
  matches: { progress: 65, label: "Computing your matches" },
  tiers: { progress: 80, label: "Building your tiered list" },
  finalize: { progress: 92, label: "Finalizing your recommendations" },
  done: { progress: 100, label: "Your matches are ready" },
};

export const MATCH_STAGE_ORDER: MatchPipelineStage[] = [
  "profile",
  "catalog",
  "matches",
  "tiers",
  "finalize",
  "done",
];

// Rich checklist shown while loading: each entry flips to "done" as the
// corresponding real stage completes.
export interface MatchChecklistItem {
  stage: MatchPipelineStage;
  label: string;
}

export const MATCH_CHECKLIST: MatchChecklistItem[] = [
  { stage: "profile", label: "Analyzing your academic profile" },
  { stage: "catalog", label: "Evaluating colleges across the database" },
  { stage: "matches", label: "Computing your match scores" },
  { stage: "tiers", label: "Building your tiered college list" },
  { stage: "finalize", label: "Finalizing your recommendations" },
];

export const MATCH_STAGE_INDEX: Record<MatchPipelineStage, number> = {
  profile: 0,
  catalog: 1,
  matches: 2,
  tiers: 3,
  finalize: 4,
  done: 5,
};
