"use client";

import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Sparkles, ChevronRight, Check, Plus } from "lucide-react";
import Link from "next/link";
import { getBalancedCollegeListAction } from "@/actions/match-results";
import { saveCollegeAction } from "@/actions/saved-colleges";
import { updateStudentPreferencesAction, updateStudentProfileAction } from "@/actions/profile";
import type { BalancedCollegeListView } from "@/lib/services/college-list-builder.service";
import styles from "./page.module.css";

const steps = [
  { id: "academic", label: "Academic Profile", icon: "📚" },
  { id: "preferences", label: "Preferences", icon: "🎯" },
  { id: "goals", label: "Your Goals", icon: "🚀" },
  { id: "results", label: "Your Matches", icon: "✨" },
];

const SECTIONS = [
  { key: "dream", icon: "🔥", label: "Dream", desc: "Ambitious schools worth reaching for — academically above your current profile." },
  { key: "reach", icon: "⚡", label: "Reach", desc: "Possible but difficult — above your current profile, but not absurdly distant." },
  { key: "target", icon: "🎯", label: "Target", desc: "Realistic colleges where your profile is reasonably aligned." },
  { key: "likely", icon: "🛡️", label: "Likely", desc: "Colleges where your current profile is comfortably within or above the reported range." },
  { key: "safety", icon: "✅", label: "Safety", desc: "Colleges where your academic profile sits clearly above the reported range — kept separate from your primary Target list." },
  { key: "pathway", icon: "🛤️", label: "Pathway", desc: "Community college / 2-year options — a legitimate step toward a 4-year degree." },
] as const;

const TIER_STYLE: Record<string, { dot: string; badge: string }> = {
  dream: { dot: "var(--color-coral)", badge: "badge-reach" },
  reach: { dot: "var(--color-amber)", badge: "badge-reach" },
  target: { dot: "var(--color-amber)", badge: "badge-target" },
  likely: { dot: "var(--color-green)", badge: "badge-strong" },
  safety: { dot: "var(--color-green)", badge: "badge-target" },
  pathway: { dot: "var(--color-primary)", badge: "badge-target" },
};

const LOADING_MESSAGES = [
  "Reading your academic profile...",
  "Analyzing your GPA and test scores...",
  "Comparing your academic fit...",
  "Checking major compatibility...",
  "Analyzing financial fit...",
  "Comparing colleges across your preferences...",
  "Building your personalized college list...",
  "Almost there...",
];

function SaveResultButton({
  collegeId,
  collegeName,
  initialSaved,
}: {
  collegeId: string;
  collegeName: string;
  initialSaved: boolean;
}) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(initialSaved);
  const [failed, setFailed] = useState(false);

  const save = async () => {
    if (saving || saved) return;
    setSaving(true);
    setFailed(false);
    const res = await saveCollegeAction({ collegeId });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
    } else {
      setFailed(true);
    }
  };

  if (saved) {
    return (
      <span className="badge badge-strong" role="status" aria-label="Saved to My College List">
        <Check size={12} /> Saved
      </span>
    );
  }

  return (
    <span className={styles.saveWrap}>
      <button
        className="btn btn-secondary btn-sm"
        onClick={save}
        disabled={saving}
        aria-busy={saving}
        aria-label={`Save ${collegeName} to My College List`}
      >
        <Plus size={14} />
        {saving ? "Saving..." : "Save to My College List"}
      </button>
      {failed && (
        <span className={styles.saveError} role="alert">
          Couldn&apos;t save this college. Try again.
        </span>
      )}
    </span>
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
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
  const submittingRef = useRef(false);
  const isMounted = useRef(true);

  const isLastStep = step === steps.length - 2;
  const isResults = step === steps.length - 1;

  const runMatch = async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setLoading(true);
    setError(null);
    setList(null);
    setLoadingMsgIndex(0);
    try {
      const persistErr = await persistWizardProfile();
      if (persistErr) {
        if (isMounted.current) setError(persistErr);
        return;
      }
      const res = await getBalancedCollegeListAction();
      if (!isMounted.current) return;
      if (res.ok) setList(res.data);
      else setError(res.error ?? "Unable to build your college list.");
    } catch {
      if (isMounted.current) setError("Unable to compute your matches right now.");
    } finally {
      submittingRef.current = false;
      if (isMounted.current) setLoading(false);
    }
  };

  const persistWizardProfile = async (): Promise<string | null> => {
    const academic: Record<string, unknown> = {};
    if (answers.gpa) {
      academic.gpa = Number(answers.gpa);
      academic.gpaScale = 4.0;
    }
    if (answers.sat) academic.satScore = Number(answers.sat);
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
    return null;
  };

  const handleNext = () => {
    if (isLastStep) {
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
    };
  }, []);

  useEffect(() => {
    if (!loading) return;
    setLoadingMsgIndex(0);
    const id = setInterval(() => {
      setLoadingMsgIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 1800);
    return () => clearInterval(id);
  }, [loading]);

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
                    <label className={styles.fieldLabel}>GPA (unweighted, out of 4.0)</label>
                    <input
                      className="input"
                      placeholder="e.g. 3.7"
                      value={answers.gpa}
                      onChange={(e) => setAnswers({...answers, gpa: e.target.value})}
                      id="match-gpa"
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>SAT Score (optional)</label>
                    <input
                      className="input"
                      placeholder="e.g. 1350"
                      value={answers.sat}
                      onChange={(e) => setAnswers({...answers, sat: e.target.value})}
                      id="match-sat"
                    />
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
                      Collegia is finding your personalized college matches.
                    </p>
                    <div className={styles.loaderWrap} aria-hidden="true">
                      <div className={styles.loaderRing} />
                      <div className={styles.loaderRingPulse} />
                      <div className={styles.loaderOrbit} />
                      <div className={styles.loaderCore}>
                        <Sparkles size={22} />
                      </div>
                    </div>
                    <h3 className={styles.loadingTitle}>Finding your matches</h3>
                    <p className={styles.loadingMsg}>{LOADING_MESSAGES[loadingMsgIndex]}</p>
                    <div className={styles.loadingDots} aria-hidden="true">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className={styles.loadingDot}
                          style={{ animationDelay: `${i * 0.18}s` }}
                        />
                      ))}
                    </div>
                    <p className={styles.loadingHint}>
                      We&apos;re analyzing your profile and comparing it with colleges across the
                      Collegia database. This usually takes a few seconds.
                    </p>
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
                          </div>
                          <div className={styles.resultsList}>
                            {items.map((r) => (
                              <div key={r.college.id} className={styles.resultRow}>
                                <div className={styles.resultDot} style={{background: style.dot}} />
                                <div className={styles.resultInfo}>
                                  <Link href={`/college/${r.college.slug}`} className={styles.resultSchool}>
                                    {r.college.name}
                                  </Link>
                                  <p className={styles.resultLocation}>
                                    {r.college.location.city}, {r.college.location.state}
                                  </p>
                                  <p className={styles.resultWhy}>{r.reasons.join(" ")}</p>
                                  {r.academicReality.message && (
                                    <p className={styles.academicReality}>
                                      <span className={styles.academicTag}>{r.academicPositionLabel}</span>{" "}
                                      {r.academicReality.message}
                                    </p>
                                  )}
                                  {r.pathwayNote && (
                                    <p className={styles.pathwayNote}>{r.pathwayNote}</p>
                                  )}
                                  {r.safetyNote && (
                                    <p className={styles.pathwayNote}>{r.safetyNote}</p>
                                  )}
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
                                  <SaveResultButton
                                    collegeId={r.college.id}
                                    collegeName={r.college.name}
                                    initialSaved={r.saved}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </section>
                      );
                    })}
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