"use client";

import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ArrowRight, Sparkles, ChevronRight, Check, Plus, ChevronDown, MapPin, Circle } from "lucide-react";
import Link from "next/link";
import { saveCollegeAction } from "@/actions/saved-colleges";
import { updateStudentPreferencesAction, updateStudentProfileAction } from "@/actions/profile";
import { createGoalAction } from "@/actions/goals";
import CollegeImage from "@/components/ui/CollegeImage";
import type { BalancedCollegeListView, BalancedCollegeListItem } from "@/lib/services/college-list-builder.service";
import {
  MATCH_STAGES,
  MATCH_CHECKLIST,
  MATCH_STAGE_ORDER,
  MATCH_STAGE_INDEX,
} from "@/lib/match-stages";
import type { MatchPipelineStage } from "@/lib/services/college-list-builder.service";
import styles from "./page.module.css";

const steps = [
  { id: "academic", label: "Academic Profile", icon: "📚" },
  { id: "preferences", label: "Preferences", icon: "🎯" },
  { id: "goals", label: "Your Goals", icon: "🚀" },
  { id: "results", label: "Your Matches", icon: "✨" },
];

const SECTIONS = [
  { key: "dream", icon: "🔥", label: "Dream", short: "Ambitious schools", desc: "Ambitious schools worth reaching for — academically above your current profile." },
  { key: "reach", icon: "⚡", label: "Reach", short: "Possible but difficult", desc: "Possible but difficult — above your current profile, but not absurdly distant." },
  { key: "target", icon: "🎯", label: "Target", short: "Realistic academic range", desc: "Realistic colleges where your profile is reasonably aligned." },
  { key: "likely", icon: "🛡️", label: "Likely", short: "Comfortably within range", desc: "Colleges where your current profile is comfortably within or above the reported range." },
  { key: "safety", icon: "✅", label: "Safety", short: "Clearly above reported range", desc: "Colleges where your academic profile sits clearly above the reported range — kept separate from your primary Target list." },
  { key: "pathway", icon: "🛤️", label: "Pathway", short: "Community college / 2-year", desc: "Community college / 2-year options — a legitimate step toward a 4-year degree." },
] as const;

const TIER_STYLE: Record<string, { dot: string; badge: string }> = {
  dream: { dot: "var(--color-coral)", badge: "badge-reach" },
  reach: { dot: "var(--color-amber)", badge: "badge-reach" },
  target: { dot: "var(--color-amber)", badge: "badge-target" },
  likely: { dot: "var(--color-green)", badge: "badge-strong" },
  safety: { dot: "var(--color-green)", badge: "badge-target" },
  pathway: { dot: "var(--color-primary)", badge: "badge-target" },
};

// Short, neutral label for the small "Testing" chip on a result card.
// Contextual only — derived from Testing Context, never from the score.
function testingChipLabel(tc: BalancedCollegeListItem["testingContext"]): string | null {
  if (tc.isTestOptionalOpportunity) return "Test-Optional Opportunity";
  if (tc.testingPolicy === "TEST_REQUIRED" && !tc.hasSubmittedTest) return "SAT Required";
  if (tc.satStatus === "NOT_PROVIDED") return "SAT Not Provided";
  return null;
}

// Maps a wizard "Your Goals" selection to a persisted improvement Goal so the
// student's stated priorities survive into the IMPROVE journey instead of being
// dropped after the matching run.
const WIZARD_GOAL_TO_CATEGORY: Record<string, { category: "ACADEMIC" | "TESTING" | "EXTRACURRICULAR" | "APPLICATION" | "FINANCIAL"; title: string }> = {
  "Strong academics": { category: "ACADEMIC", title: "Prioritize strong academics" },
  "Career placement": { category: "ACADEMIC", title: "Prioritize career placement" },
  "International community": { category: "APPLICATION", title: "Prioritize an international community" },
  "Financial aid": { category: "FINANCIAL", title: "Prioritize financial aid" },
  "Sports culture": { category: "EXTRACURRICULAR", title: "Prioritize sports culture" },
  "Research opportunities": { category: "ACADEMIC", title: "Prioritize research opportunities" },
  "Urban environment": { category: "APPLICATION", title: "Prioritize an urban environment" },
  "Campus life": { category: "EXTRACURRICULAR", title: "Prioritize campus life" },
};

// Progress copy shown while the last pipeline stages stream in, so the
// bar is never left visually frozen at a high percentage with no sign
// of ongoing work.
const PROFILE_MESSAGES = [
  "Loading your saved academic profile...",
  "Gathering the college catalog...",
  "Reading your preferences and saved list...",
];

const FINALIZING_MESSAGES = [
  "Comparing your profile with the remaining colleges...",
  "Ranking the best fits across every category...",
  "Tying everything together — almost there...",
];

function messagesForStage(stage: MatchPipelineStage): string[] {
  if (stage === "finalize") return FINALIZING_MESSAGES;
  if (stage === "profile" || stage === "catalog") return PROFILE_MESSAGES;
  return ["Crunching the numbers across every school..."];
}

// If no progress/result event arrives within this window, stop waiting and
// show an error instead of leaving the loading UI frozen.
const STALL_MS = 30000;

function CollapsibleSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const panelId = `${id}-panel`;
  return (
    <div className={styles.accordion}>
      <button
        type="button"
        className={styles.accordionBtn}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={styles.accordionTitle}>{title}</span>
        <ChevronDown
          size={16}
          className={`${styles.accordionChevron} ${open ? styles.accordionChevronOpen : ""}`}
        />
      </button>
      <div id={panelId} className={styles.accordionPanel} hidden={!open}>
        <div className={styles.accordionBody}>{children}</div>
      </div>
    </div>
  );
}

function SaveIndicator({ saved }: { saved: boolean }) {
  if (saved) {
    return (
      <span className="badge badge-strong" role="status" aria-label="Saved to My College List">
        <Check size={12} /> Saved
      </span>
    );
  }
  return null;
}

function ResultCard({
  r,
  style,
}: {
  r: BalancedCollegeListItem;
  style: { dot: string; badge: string };
}) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(r.saved);
  const [failed, setFailed] = useState(false);

  const save = async () => {
    if (saving || saved) return;
    setSaving(true);
    setFailed(false);
    const res = await saveCollegeAction({ collegeId: r.college.id });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
    } else {
      setFailed(true);
    }
  };

  // Single save button rendered in both the mobile and desktop variants so
  // the saved state stays in sync no matter which layout is visible.
  const saveButton = (compact: boolean) =>
    saved ? (
      <SaveIndicator saved />
    ) : (
      <span className={styles.saveWrap}>
        <button
          className={`btn btn-secondary btn-sm ${compact ? styles.saveBtn : ""}`}
          onClick={save}
          disabled={saving}
          aria-busy={saving}
          aria-label={`Save ${r.college.name} to My College List`}
        >
          <Plus size={14} />
          {saving ? "Saving..." : compact ? "Save" : "Save to My College List"}
        </button>
        {failed && (
          <span className={styles.saveError} role="alert">
            Couldn&apos;t save this college. Try again.
          </span>
        )}
      </span>
    );

  return (
    <div className={styles.resultRow}>
      {/* ===== MOBILE CARD ===== */}
      <div className={styles.mobileCard}>
        <div className={styles.mobileCover}>
          <CollegeImage
            src={r.college.coverImage}
            alt={`${r.college.name} campus`}
            variant="cover"
            sizes="(max-width: 768px) 100vw, 60vw"
          />
        </div>
        <div className={styles.mobileHeader}>
          <div className={styles.mobileIdentity}>
            <Link href={`/college/${r.college.slug}`} className={styles.resultSchool}>
              {r.college.name}
            </Link>
            <p className={styles.resultLocation}>
              <MapPin size={12} className={styles.locPin} /> {r.college.location.city},{" "}
              {r.college.location.state}
            </p>
          </div>
          <span className={styles.mobileSave}>{saveButton(true)}</span>
        </div>

        <div className={styles.mobileTags}>
          <span className={`badge ${style.badge}`}>{r.classificationLabel}</span>
          <span className={styles.matchScorePill}>{r.matchScore} Collegia Match</span>
        </div>

        {r.reasons.slice(0, 2).map((reason, i) => (
          <p key={i} className={styles.mobileReason}>
            {reason}
          </p>
        ))}

        <div className={styles.fitSummary}>
          <p className={styles.fitLabel}>Academic fit</p>
          {r.academicReality.gpa.available && r.academicReality.gpa.studentGpa != null && (
            <div className={styles.fitRow}>
              <span className={styles.fitMetric}>GPA</span>
              <span className={styles.fitVal}>{r.academicReality.gpa.studentGpa.toFixed(2)}</span>
              <span className={styles.fitNote}>
                {r.academicReality.gpa.label}
                {r.academicReality.gpa.collegeGpa != null
                  ? ` · avg ${r.academicReality.gpa.collegeGpa.toFixed(2)}`
                  : ""}
              </span>
            </div>
          )}
          {r.academicReality.sat.available && r.academicReality.sat.studentSat != null && (
            <div className={styles.fitRow}>
              <span className={styles.fitMetric}>SAT</span>
              <span className={styles.fitVal}>{r.academicReality.sat.studentSat}</span>
              <span className={styles.fitNote}>
                {r.academicReality.sat.label}
                {r.academicReality.sat.satRangeMin != null &&
                r.academicReality.sat.satRangeMax != null
                  ? ` · ${r.academicReality.sat.satRangeMin}–${r.academicReality.sat.satRangeMax}`
                  : ""}
              </span>
            </div>
          )}
          {r.academicReality.act.available && r.academicReality.act.studentAct != null && (
            <div className={styles.fitRow}>
              <span className={styles.fitMetric}>ACT</span>
              <span className={styles.fitVal}>{r.academicReality.act.studentAct}</span>
              <span className={styles.fitNote}>
                {r.academicReality.act.label}
                {r.academicReality.act.actRangeMin != null &&
                r.academicReality.act.actRangeMax != null
                  ? ` · ${r.academicReality.act.actRangeMin}–${r.academicReality.act.actRangeMax}`
                  : ""}
              </span>
            </div>
          )}
          {testingChipLabel(r.testingContext) && (
            <div className={styles.fitRow}>
              <span className={styles.fitMetric}>Testing</span>
              <span className={styles.testingNote}>{testingChipLabel(r.testingContext)}</span>
            </div>
          )}
          {!r.academicReality.gpa.available &&
            !r.academicReality.sat.available &&
            !r.academicReality.act.available && (
              <p className={styles.fitEmpty}>Insufficient academic data.</p>
            )}
        </div>

        <CollapsibleSection id={`${r.college.id}-why`} title="Why It Matches">
          <p className={styles.accordionText}>{r.reasons.join(" ")}</p>
        </CollapsibleSection>

        {r.academicReality.message && (
          <CollapsibleSection id={`${r.college.id}-academic`} title="Academic Fit">
            <span className={styles.academicTag}>{r.academicPositionLabel}</span>
            <p className={styles.accordionText}>{r.academicReality.message}</p>
          </CollapsibleSection>
        )}

        {(r.pathwayNote || r.safetyNote) && (
          <CollapsibleSection
            id={`${r.college.id}-note`}
            title={r.pathwayNote ? "Pathway" : "Safety Note"}
          >
            <p className={styles.accordionText}>{r.pathwayNote || r.safetyNote}</p>
          </CollapsibleSection>
        )}

        {r.mainRisk && (
          <CollapsibleSection id={`${r.college.id}-risk`} title="Main Risk">
            <p className={styles.accordionText}>
              <span className={styles.riskLabel}>Main risk:</span> {r.mainRisk}
            </p>
          </CollapsibleSection>
        )}

        {r.improvements.length > 0 && (
          <CollapsibleSection id={`${r.college.id}-improve`} title="What to Improve">
            {r.improvements.map((im) => (
              <p key={im.title} className={styles.improveAction}>
                {im.action}
                {im.potentialImpact > 0 && (
                  <span className={styles.improveImpact}>
                    {" "}
                    (up to +{Math.round(im.potentialImpact)} Collegia Match)
                  </span>
                )}
              </p>
            ))}
          </CollapsibleSection>
        )}

        <Link href={`/college/${r.college.slug}`} className={`btn btn-primary btn-sm ${styles.viewCollege}`}>
          View College
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* ===== DESKTOP CARD ===== */}
      <div className={styles.desktopCard}>
        <div className={styles.desktopCover}>
          <CollegeImage
            src={r.college.coverImage}
            alt={`${r.college.name} campus`}
            variant="cover"
            sizes="(max-width: 768px) 100vw, 70vw"
            style={{ "--college-aspect": "16 / 7" } as CSSProperties}
          />
        </div>
        <div className={styles.desktopBody}>
          <div className={styles.resultInfo}>
          <Link href={`/college/${r.college.slug}`} className={styles.resultSchool}>
            {r.college.name}
          </Link>
          <p className={styles.resultLocation}>
            {r.college.location.city}, {r.college.location.state}
          </p>
          <p className={styles.resultWhy}>{r.reasons.join(" ")}</p>
          {testingChipLabel(r.testingContext) && (
            <p className={styles.testingChip}>
              <span className={styles.testingChipLabel}>Testing</span>
              {testingChipLabel(r.testingContext)}
            </p>
          )}
          {r.academicReality.message && (
            <p className={styles.academicReality}>
              <span className={styles.academicTag}>{r.academicPositionLabel}</span>{" "}
              {r.academicReality.message}
            </p>
          )}
          {r.pathwayNote && <p className={styles.pathwayNote}>{r.pathwayNote}</p>}
          {r.safetyNote && <p className={styles.pathwayNote}>{r.safetyNote}</p>}
          {r.mainRisk && (
            <p className={styles.mainRisk}>
              <span className={styles.riskLabel}>Main risk:</span> {r.mainRisk}
            </p>
          )}
          {r.improvements.length > 0 && (
            <div className={styles.improve}>
              <p className={styles.improveTitle}>What to improve</p>
              {r.improvements.map((im) => (
                <p key={im.title} className={styles.improveAction}>
                  {im.action}
                  {im.potentialImpact > 0 && (
                    <span className={styles.improveImpact}>
                      {" "}
                      (up to +{Math.round(im.potentialImpact)} Collegia Match)
                    </span>
                  )}
                </p>
              ))}
            </div>
          )}
        </div>
        <div className={styles.resultRight}>
          <span className={`badge ${style.badge}`}>{r.classificationLabel}</span>
          <span className={styles.resultAccept}>{r.matchScore} Collegia Match</span>
          {saveButton(false)}
        </div>
        </div>
      </div>
    </div>
  );
}

const BUDGET_RANGES: Record<string, number> = {
  "Under $20,000": 20000,
  "$20,000–$35,000": 35000,
  "$35,000–$50,000": 50000,
  "$50,000–$65,000": 65000,
  "$65,000+": 70000,
};

export default function MatchPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({
    gpa: "",
    sat: "",
    major: "",
    budget: "",
    size: "",
    location: "",
    internationalAid: "",
  });

  const [list, setList] = useState<BalancedCollegeListView | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<MatchPipelineStage>("profile");
  const [gpaError, setGpaError] = useState<string | null>(null);
  const [satError, setSatError] = useState<string | null>(null);
  const [finalizingMsgIndex, setFinalizingMsgIndex] = useState(0);
  const submittingRef = useRef(false);
  const isMounted = useRef(true);
  const activeAbortRef = useRef<AbortController | null>(null);
  const stallTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isLastStep = step === steps.length - 2;
  const isResults = step === steps.length - 1;

  const runMatch = async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    activeAbortRef.current?.abort();
    activeAbortRef.current = new AbortController();
    setLoading(true);
    setError(null);
    setList(null);
    setProgress(0);
    setStage("profile");

    try {
      // Phase 0 — persist the wizard answers (real client->server work).
      const persistErr = await persistWizardProfile();
      if (persistErr) {
        if (isMounted.current) setError(persistErr);
        submittingRef.current = false;
        if (isMounted.current) setLoading(false);
        return;
      }
      if (!isMounted.current) return;

      // Phase 1+ — stream the actual match pipeline so the progress bar
      // tracks real server stages instead of a fabricated percentage.
      await streamMatch();
    } catch {
      if (isMounted.current) setError("Unable to compute your matches right now.");
    } finally {
      submittingRef.current = false;
      activeAbortRef.current = null;
      if (isMounted.current) setLoading(false);
    }
  };

  const streamMatch = async () => {
    const signal = activeAbortRef.current?.signal;
    const res = await fetch("/api/match/stream", { method: "POST", signal });
    if (!res.ok || !res.body) {
      throw new Error("stream_failed");
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let gotResult = false;
    let serverErrorMessage: string | null = null;
    let lastEventAt = Date.now();

    // Watchdog: if no progress/result event arrives within STALL_MS, fail
    // instead of leaving the UI frozen. Reset on every received event.
    const armStall = () => {
      if (stallTimerRef.current) clearTimeout(stallTimerRef.current);
      const remaining = STALL_MS - (Date.now() - lastEventAt);
      stallTimerRef.current = setTimeout(() => {
        activeAbortRef.current?.abort();
        if (isMounted.current) setError("The match took too long. Please try again.");
      }, Math.max(0, remaining));
    };

    const applyStage = (stage: MatchPipelineStage) => {
      if (!isMounted.current) return;
      const meta = MATCH_STAGES[stage];
      setStage(stage);
      setProgress(meta.progress);
    };

    armStall();

    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let sep: number;
        while ((sep = buffer.indexOf("\n\n")) !== -1) {
          const chunk = buffer.slice(0, sep);
          buffer = buffer.slice(sep + 2);
          const line = chunk.split("\n").find((l) => l.startsWith("data: "));
          if (!line) continue;
          const data = line.slice(6);
          let msg: { type: string; stage?: MatchPipelineStage; view?: BalancedCollegeListView; message?: string };
          try {
            msg = JSON.parse(data);
          } catch {
            continue;
          }

          if (msg.type === "stage" && msg.stage) {
            lastEventAt = Date.now();
            armStall();
            applyStage(msg.stage);
          } else if (msg.type === "result" && msg.view) {
            gotResult = true;
            if (isMounted.current) {
              setList(msg.view!);
              setProgress(100);
              setStage("done");
            }
          } else if (msg.type === "error") {
            serverErrorMessage = msg.message ?? null;
            if (isMounted.current) setError(serverErrorMessage ?? "Unable to compute your matches right now.");
          }
        }
      }

      // Stream closed without ever delivering a result — surface an error
      // rather than leaving a "0%" / partial loading state behind.
      if (!gotResult && isMounted.current) {
        setError(serverErrorMessage ?? "Unable to compute your matches right now.");
      }
    } catch (e) {
      if (!signal?.aborted) throw e;
    } finally {
      if (stallTimerRef.current) {
        clearTimeout(stallTimerRef.current);
        stallTimerRef.current = null;
      }
    }
  };

  const persistWizardProfile = async (): Promise<string | null> => {
    const academic: Record<string, unknown> = {};

    // GPA is required to build the match — always persist the (validated)
    // value together with its 4.0 scale.
    const gpaNum = Number(answers.gpa.trim());
    if (!Number.isNaN(gpaNum)) {
      academic.gpa = gpaNum;
      academic.gpaScale = 4.0;
    }

    // SAT is optional. Empty means "not provided" — explicitly clear to null
    // so it is never treated as any fabricated score (e.g. 1600 or 0).
    // An invalid (non-empty, out-of-range) value is NOT silently converted
    // to null — it is surfaced as an error so the user can correct it.
    if (answers.sat.trim()) {
      const satNum = Number(answers.sat.trim());
      if (!Number.isInteger(satNum) || satNum < 400 || satNum > 1600) {
        return "SAT must be a whole number between 400 and 1600.";
      }
      academic.satScore = satNum;
    } else {
      academic.satScore = null;
    }

    if (answers.major) academic.intendedMajor = answers.major;

    const prefs: Record<string, unknown> = {};
    if (answers.budget && BUDGET_RANGES[answers.budget]) prefs.annualBudget = BUDGET_RANGES[answers.budget];
    if (answers.size && answers.size !== "No preference") prefs.preferredSizes = [answers.size];
    if (answers.location && answers.location !== "No preference") prefs.preferredRegions = [answers.location];

    if (Object.keys(academic).length > 0) {
      const res = await updateStudentProfileAction(academic);
      if (!res.ok) return res.error ?? "Unable to save your academic profile.";
    }
    if (Object.keys(prefs).length > 0) {
      const res = await updateStudentPreferencesAction(prefs);
      if (!res.ok) return res.error ?? "Unable to save your preferences.";
    }

    // Persist the "Your Goals" selection into the IMPROVE journey so it isn't
    // dropped after the matching run. Single-select by design; no-op if empty.
    // idempotent:true prevents a duplicate goal every time the wizard runs.
    const goalMapping = answers.internationalAid ? WIZARD_GOAL_TO_CATEGORY[answers.internationalAid] : null;
    if (goalMapping) {
      const goalRes = await createGoalAction({
        title: goalMapping.title,
        category: goalMapping.category,
        priority: "MEDIUM",
        description: "Set from your College Match preferences.",
        idempotent: true,
      });
      if (!goalRes.ok) return goalRes.error ?? "Unable to save your goals.";
    }

    return null;
  };

  const handleNext = () => {
    if (isLastStep) {
      // GPA is required to build the College Match. Block submission (with a
      // clear message) before any request is sent, and never proceed with an
      // empty / invalid GPA.
      const rawGpa = answers.gpa.trim();
      const gpaNum = Number(rawGpa);
      if (!rawGpa || Number.isNaN(gpaNum) || gpaNum < 0 || gpaNum > 5) {
        setGpaError("Please enter your GPA to build your College Match.");
        setStep(0);
        return;
      }
      setGpaError(null);

      // SAT is optional. When provided it must be a whole number in the valid
      // SAT scale (400–1600) — the same bounds the server schema enforces.
      const rawSat = answers.sat.trim();
      if (rawSat) {
        const satNum = Number(rawSat);
        if (!Number.isInteger(satNum) || satNum < 400 || satNum > 1600) {
          setSatError("SAT must be a whole number between 400 and 1600.");
          setStep(0);
          return;
        }
      }
      setSatError(null);

      // Enter the loading state immediately so the results area is
      // never mistaken for a frozen page. runMatch() persists the
      // wizard answers, then requests the match list.
      setLoading(true);
      setError(null);
      setList(null);
      setStep((s) => Math.min(s + 1, steps.length - 1));
      void runMatch();
      return;
    }
    setStep((s) => s + 1);
  };

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      activeAbortRef.current?.abort();
      activeAbortRef.current = null;
      if (stallTimerRef.current) {
        clearTimeout(stallTimerRef.current);
        stallTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!loading) return;
    setFinalizingMsgIndex(0);
    const msgs = messagesForStage(stage);
    const id = setInterval(() => {
      setFinalizingMsgIndex((i) => (i + 1) % msgs.length);
    }, 3000);
    return () => clearInterval(id);
  }, [loading, stage]);

  return (
    <>
      <Navigation />
      <main className={styles.main}>
        <div className={styles.hero}>
          <div className="container">
            <div style={{paddingTop:"calc(var(--nav-height) + var(--space-10))"}}>
              <div className={styles.badge}>
                <Sparkles size={14} />
                College Match
              </div>
              <h1 className={styles.title}>Find your colleges.</h1>
              <p className={styles.sub}>
                Tell us about yourself and we&apos;ll surface colleges that match your profile.
                Results are for exploration only — not actual admissions predictions.
              </p>
            </div>
          </div>
        </div>

        <div className="container">
          {/* Progress steps */}
          <div className={styles.progressBar}>
            {steps.map((s, i) => (
              <button
                key={s.id}
                className={`${styles.progressStep} ${i === step ? styles.active : ""} ${i < step ? styles.done : ""}`}
                onClick={() => i < step && setStep(i)}
              >
                <span className={styles.stepIcon}>{s.icon}</span>
                <span className={styles.stepLabel}>{s.label}</span>
                {i < steps.length - 1 && <ChevronRight size={14} className={styles.stepArrow} />}
              </button>
            ))}
          </div>

          {/* Step content */}
          <div className={styles.stepCard}>
            {step === 0 && (
              <div className={styles.stepContent}>
                <h2 className={styles.stepTitle}>📚 Your Academic Profile</h2>
                <p className={styles.stepDesc}>This helps us find colleges where students with similar scores succeed.</p>

                <div className={styles.fields}>
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>GPA (unweighted, out of 4.0) <span className="badge" aria-hidden="true">Required</span></label>
                    <input
                      className="input"
                      type="text"
                      inputMode="decimal"
                      required
                      placeholder="e.g. 3.7"
                      value={answers.gpa}
                      onChange={(e) => {
                        setAnswers({...answers, gpa: e.target.value});
                        if (gpaError) setGpaError(null);
                      }}
                      id="match-gpa"
                      aria-invalid={gpaError ? true : undefined}
                      aria-describedby={gpaError ? "match-gpa-error" : undefined}
                    />
                    {gpaError && (
                      <p className={styles.fieldError} id="match-gpa-error" role="alert">
                        {gpaError}
                      </p>
                    )}
                  </div>
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>SAT — Optional</label>
                    <input
                      className="input"
                      type="text"
                      inputMode="numeric"
                      placeholder="e.g. 1350"
                      value={answers.sat}
                      onChange={(e) => {
                        setAnswers({...answers, sat: e.target.value});
                        if (satError) setSatError(null);
                      }}
                      id="match-sat"
                      aria-invalid={satError ? true : undefined}
                      aria-describedby={satError ? "match-sat-error" : undefined}
                    />
                    {satError && (
                      <p className={styles.fieldError} id="match-sat-error" role="alert">
                        {satError}
                      </p>
                    )}
                    <p className={styles.fieldHint}>Leave blank if you haven't taken the SAT (or don't want to submit it).</p>
                  </div>
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>Intended Major</label>
                    <input
                      className="input"
                      placeholder="e.g. Computer Science"
                      value={answers.major}
                      onChange={(e) => setAnswers({...answers, major: e.target.value})}
                      id="match-major"
                    />
                  </div>
                </div>

                <div className={styles.disclaimer}>
                  ⚠️ Academic information is used for filtering only and does not calculate actual admissions chances.
                </div>
              </div>
            )}

            {step === 1 && (
              <div className={styles.stepContent}>
                <h2 className={styles.stepTitle}>🎯 Your Preferences</h2>
                <p className={styles.stepDesc}>Help us find colleges that match your lifestyle and budget.</p>

                <div className={styles.fields}>
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>Annual Budget (USD)</label>
                    <select
                      className="input"
                      value={answers.budget}
                      onChange={(e) => setAnswers({...answers, budget: e.target.value})}
                      id="match-budget"
                    >
                      <option value="">Select a range</option>
                      <option>Under $20,000</option>
                      <option>$20,000–$35,000</option>
                      <option>$35,000–$50,000</option>
                      <option>$50,000–$65,000</option>
                      <option>$65,000+</option>
                    </select>
                  </div>
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>Campus Size Preference</label>
                    <div className={styles.radioGroup}>
                      {["Small", "Medium", "Large", "No preference"].map((s) => (
                        <button
                          key={s}
                          className={`chip ${answers.size === s ? "active" : ""}`}
                          onClick={() => setAnswers({...answers, size: s})}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>Preferred Region</label>
                    <div className={styles.radioGroup}>
                      {["East Coast", "West Coast", "Midwest", "South", "No preference"].map((l) => (
                        <button
                          key={l}
                          className={`chip ${answers.location === l ? "active" : ""}`}
                          onClick={() => setAnswers({...answers, location: l})}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className={styles.stepContent}>
                <h2 className={styles.stepTitle}>🚀 Your Goals</h2>
                <p className={styles.stepDesc}>What matters most to you about your college experience?</p>

                <div className={styles.goalGrid}>
                  {[
                    { icon: "🎓", label: "Strong academics" },
                    { icon: "💼", label: "Career placement" },
                    { icon: "🌍", label: "International community" },
                    { icon: "💰", label: "Financial aid" },
                    { icon: "🏟️", label: "Sports culture" },
                    { icon: "🔬", label: "Research opportunities" },
                    { icon: "🏙️", label: "Urban environment" },
                    { icon: "🌳", label: "Campus life" },
                  ].map((g) => (
                    <button
                      key={g.label}
                      className={`${styles.goalBtn} ${answers.internationalAid === g.label ? styles.goalActive : ""}`}
                      onClick={() => setAnswers({...answers, internationalAid: g.label})}
                    >
                      <span className={styles.goalIcon}>{g.icon}</span>
                      <span>{g.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isResults && (
              <div className={styles.stepContent}>
                <h2 className={styles.stepTitle}>✨ Your College Matches</h2>
                <p className={styles.stepDesc}>
                  Ranked by the Collegia Match Engine from your saved profile. Scores measure
                  <strong> fit</strong> — they are not chances of admission.
                </p>

                {loading && (
                  <div className={styles.loadingPanel} role="status" aria-live="polite" aria-busy="true">
                    <p className={styles.loadingAnnounce}>
                      Building your College Match.
                    </p>
                    <div className={styles.loaderWrap} aria-hidden="true">
                      <div className={styles.loaderRing} />
                      <div className={styles.loaderRingPulse} />
                      <div className={styles.loaderOrbit} />
                      <div className={styles.loaderCore}>
                        <Sparkles size={22} />
                      </div>
                    </div>
                    <h3 className={styles.loadingTitle}>Building your College Match</h3>

                    <div className={styles.progressWrap} aria-hidden="true">
                      <div className={styles.progressTrack}>
                        <div
                          className={styles.progressFill}
                          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                        />
                      </div>
                      <div className={styles.progressRow}>
                        <span className={styles.progressPct}>{Math.round(progress)}%</span>
                        <span className={styles.progressStage}>{MATCH_STAGES[stage].label}</span>
                      </div>
                      <p className={styles.finalizingMsg} aria-hidden="true">
                        {messagesForStage(stage)[finalizingMsgIndex] ?? ""}
                      </p>
                    </div>

                    <ul className={styles.checklist}>
                      {MATCH_CHECKLIST.map((item, i) => {
                        const itemIdx = MATCH_STAGE_INDEX[item.stage];
                        const curIdx = MATCH_STAGE_INDEX[stage];
                        const isDone = curIdx > itemIdx;
                        const isActive = curIdx === itemIdx;
                        return (
                          <li
                            key={item.stage}
                            className={`${styles.checklistItem} ${
                              isDone ? styles.checklistDone : isActive ? styles.checklistActive : ""
                            }`}
                            style={{ transitionDelay: `${i * 30}ms` }}
                          >
                            {isDone ? (
                              <Check size={14} className={styles.checklistIcon} />
                            ) : isActive ? (
                              <span className={styles.checklistSpinner} aria-hidden="true" />
                            ) : (
                              <Circle size={14} className={styles.checklistIconPending} />
                            )}
                            <span>{item.label}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {error && !loading && (
                  <div className={styles.errorPanel} role="alert">
                    <div className={styles.errorInfo}>
                      <p className={styles.errorTitle}>Something went wrong while finding your matches.</p>
                      <p className={styles.errorText}>Your profile is safe and hasn&apos;t been lost — you can try again.</p>
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={runMatch} id="match-retry">
                      Try again
                    </button>
                  </div>
                )}

                {!loading && !error && list && (
                  <>
                    {list.total === 0 ? (
                      <div className={styles.emptyState} role="status">
                        <div className={styles.emptyIcon}>🔍</div>
                        <h3 className={styles.emptyTitle}>No colleges matched your current profile.</h3>
                        <p className={styles.emptyText}>
                          We couldn&apos;t honestly place any colleges given the profile you entered.
                          That doesn&apos;t mean nothing fits — try adjusting your preferences or
                          academic profile, then run the match again. We&apos;ll never pad your list
                          with schools that wouldn&apos;t truly fit.
                        </p>
                        <div className={styles.emptyActions}>
                          <button className="btn btn-primary btn-sm" onClick={() => { setStep(1); setList(null); }} id="match-empty-prefs">
                            Adjust Preferences
                          </button>
                          <Link href="/discover/search" className="btn btn-secondary btn-sm" id="match-empty-browse">
                            Browse All Colleges
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h3 className={styles.tierIntro}>
                          Your college matches, organized by ambition. Scores measure
                          <strong> fit</strong> — they are not chances of admission, and no list is a guarantee.
                        </h3>
                        {SECTIONS.map((section) => {
                          const items = list[section.key];
                          const style = TIER_STYLE[section.key];
                          if (items.length === 0) {
                            return (
                              <section key={section.key} className={styles.tierSection} id={`tier-${section.key}`}>
                                <div className={styles.tierHeader}>
                                  <h3 className={styles.tierTitle}>
                                    {section.icon} {section.label.toUpperCase()}
                                  </h3>
                                  <p className={styles.tierDesc}>{section.desc}</p>
                                  <p className={styles.tierShort}>{section.short}</p>
                                </div>
                                <p className={styles.tierEmpty} role="note">
                                  We couldn&apos;t honestly fill this tier with your current profile, so
                                  these slots are left open rather than padded with schools that
                                  wouldn&apos;t truly fit.
                                </p>
                              </section>
                            );
                          }
                          return (
                            <section key={section.key} className={styles.tierSection} id={`tier-${section.key}`}>
                              <div className={styles.tierHeader}>
                                <h3 className={styles.tierTitle}>
                                  {section.icon} {section.label.toUpperCase()}
                                </h3>
                                <p className={styles.tierDesc}>{section.desc}</p>
                                <p className={styles.tierShort}>{section.short}</p>
                              </div>
                              <div className={styles.resultsList}>
                                {items.map((r) => (
                                  <ResultCard key={r.college.id} r={r} style={style} />
                                ))}
                              </div>
                            </section>
                          );
                        })}
                      </>
                    )}
                  </>
                )}

                <div className={styles.resultActions}>
                  <Link href="/discover/search" className="btn btn-primary" id="match-results-explore">
                    Explore All Colleges
                    <ArrowRight size={15} />
                  </Link>
                  <Link href="/journey/colleges" className="btn btn-secondary">
                    View My List
                  </Link>
                </div>
              </div>
            )}

            <div className={styles.stepFooter}>
              {step > 0 && !isResults && (
                <button className="btn btn-secondary" onClick={() => setStep((s) => s - 1)}>
                  Back
                </button>
              )}
              {!isResults && (
                <button className="btn btn-primary" onClick={handleNext} id={`match-step-${step}-next`}>
                  {isLastStep ? "See My Matches" : "Continue"}
                  <ArrowRight size={15} />
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}