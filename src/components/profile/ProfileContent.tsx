"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Globe2, BookOpen, GraduationCap, MapPin, DollarSign, X, Check } from "lucide-react";
import {
  updateFinancialAidAction,
  updateInternationalProfileAction,
  updateStudentPreferencesAction,
  updateStudentProfileAction,
} from "@/actions/profile";
import type { StudentProfileView } from "@/lib/services/profile.service";
import styles from "@/app/profile/page.module.css";

type EditingSection = "academic" | "preferences" | "international" | null;

const REGION_OPTIONS = ["East Coast", "West Coast", "Midwest", "South", "Northeast", "Southwest"];
const SIZE_OPTIONS = ["Small", "Medium", "Large"];
const TYPE_OPTIONS = ["Public", "Private"];
const SETTING_OPTIONS = ["Urban", "Suburban", "Rural"];

function educationLevel(classYear: number | null): string {
  if (!classYear) return "—";
  const currentYear = new Date().getFullYear();
  const diff = classYear - currentYear;
  const levels: Record<number, string> = {
    4: "High School Freshman",
    3: "High School Sophomore",
    2: "High School Junior",
    1: "High School Senior",
  };
  return levels[diff] ?? `Class of ${classYear}`;
}

export default function ProfileContent({ profile }: { profile: StudentProfileView }) {
  const router = useRouter();
  const [editing, setEditing] = useState<EditingSection>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);

  const closeEdit = () => {
    setEditing(null);
    setStatus(null);
  };

  const runAction = async (action: () => Promise<{ ok: boolean; error?: string }>) => {
    setSaving(true);
    setStatus(null);
    const res = await action();
    if (res.ok) {
      setStatus({ ok: true, message: "Saved successfully." });
      setEditing(null);
      router.refresh();
    } else {
      setStatus({ ok: false, message: res.error ?? "Something went wrong." });
    }
    setSaving(false);
  };

  return (
    <div className="container" style={{paddingTop: "var(--space-10)"}}>
      <div className={styles.layout}>
        {/* Left: Nav/Info */}
        <aside className={styles.sidebar}>
          <div className={styles.userCard}>
            <div className={styles.avatar}>
              {(profile.name || "C").charAt(0)}
            </div>
            <div>
              <p className={styles.userName}>{profile.name}</p>
              <p className={styles.userMeta}>Free Plan</p>
            </div>
          </div>

          <nav className={styles.nav}>
            <button className={`${styles.navItem} ${styles.navActive}`}>
              <User size={16} /> Personal Info
            </button>
            <button className={styles.navItem} onClick={() => setEditing("academic")}>
              <GraduationCap size={16} /> Academic Profile
            </button>
            <button className={styles.navItem} onClick={() => setEditing("preferences")}>
              <Globe2 size={16} /> Preferences
            </button>
            <button className={styles.navItem}>
              <Mail size={16} /> Email Settings
            </button>
          </nav>
        </aside>

        {/* Right: Content */}
        <div className={styles.content}>
          {status && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-2)",
                padding: "var(--space-3) var(--space-4)",
                borderRadius: "var(--radius-md)",
                fontSize: 14,
                fontWeight: 600,
                background: status.ok ? "var(--color-green-light)" : "var(--color-coral-light)",
                color: status.ok ? "var(--color-green)" : "var(--color-coral)",
              }}
            >
              {status.ok ? <Check size={15} /> : <X size={15} />}
              {status.message}
            </div>
          )}

          {/* Academic Profile */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Academic Profile</h2>
              {editing !== "academic" ? (
                <button className="btn btn-outline-white btn-sm" onClick={() => { setEditing("academic"); setStatus(null); }}>
                  Edit
                </button>
              ) : (
                <button className="btn btn-outline-white btn-sm" onClick={closeEdit}>
                  Cancel
                </button>
              )}
            </div>

            {editing === "academic" ? (
              <AcademicForm
                profile={profile}
                saving={saving}
                onSubmit={(data) =>
                  runAction(async () => {
                    const res = await updateStudentProfileAction(data);
                    return res as { ok: boolean; error?: string };
                  })
                }
              />
            ) : (
              <div className={styles.grid}>
                <div className={styles.field}>
                  <p className={styles.label}>Cumulative GPA (Unweighted)</p>
                  <p className={styles.value}>{profile.gpa != null ? `${profile.gpa} / ${profile.gpaScale ?? 4.0}` : "—"}</p>
                </div>
                <div className={styles.field}>
                  <p className={styles.label}>SAT Score</p>
                  <p className={styles.value}>{profile.satScore ?? "—"}</p>
                </div>
                <div className={styles.field}>
                  <p className={styles.label}>ACT Score</p>
                  <p className={styles.value}>{profile.actScore ?? "—"}</p>
                </div>
                <div className={styles.field}>
                  <p className={styles.label}>Intended Major</p>
                  <p className={styles.value}>{profile.intendedMajor ?? "—"}</p>
                </div>
                <div className={styles.field}>
                  <p className={styles.label}>Current Education Level</p>
                  <p className={styles.value}>{educationLevel(profile.classYear)}</p>
                </div>
              </div>
            )}
          </section>

          {/* Preferences */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>College Preferences</h2>
              {editing !== "preferences" ? (
                <button className="btn btn-outline-white btn-sm" onClick={() => { setEditing("preferences"); setStatus(null); }}>
                  Edit
                </button>
              ) : (
                <button className="btn btn-outline-white btn-sm" onClick={closeEdit}>
                  Cancel
                </button>
              )}
            </div>

            {editing === "preferences" ? (
              <PreferencesForm
                profile={profile}
                saving={saving}
                onSubmit={(data) =>
                  runAction(async () => {
                    const res = await updateStudentPreferencesAction(data);
                    return res as { ok: boolean; error?: string };
                  })
                }
              />
            ) : (
              <div className={styles.grid}>
                <div className={styles.field}>
                  <p className={styles.label}><DollarSign size={14} style={{display: "inline", verticalAlign: "middle"}} /> Maximum Annual Budget</p>
                  <p className={styles.value}>{profile.financialAid.annualBudget != null ? `$${profile.financialAid.annualBudget.toLocaleString()}` : "—"}</p>
                </div>
                <div className={styles.field}>
                  <p className={styles.label}><MapPin size={14} style={{display: "inline", verticalAlign: "middle"}} /> Preferred Locations</p>
                  <div className={styles.chipRow}>
                    {profile.preferences.preferredRegions.length > 0 ? (
                      profile.preferences.preferredRegions.map((loc) => (
                        <span key={loc} className="chip">{loc}</span>
                      ))
                    ) : (
                      <span className="body-sm" style={{color: "var(--color-ink-faint)"}}>Not set</span>
                    )}
                  </div>
                </div>
                <div className={styles.field}>
                  <p className={styles.label}><BookOpen size={14} style={{display: "inline", verticalAlign: "middle"}} /> Campus Interests</p>
                  <div className={styles.chipRow}>
                    {profile.preferences.interests.length > 0 ? (
                      profile.preferences.interests.map((int) => (
                        <span key={int} className="chip active">{int}</span>
                      ))
                    ) : (
                      <span className="body-sm" style={{color: "var(--color-ink-faint)"}}>Not set</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* International Info */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>International Details</h2>
              {editing !== "international" ? (
                <button className="btn btn-outline-white btn-sm" onClick={() => { setEditing("international"); setStatus(null); }}>
                  Edit
                </button>
              ) : (
                <button className="btn btn-outline-white btn-sm" onClick={closeEdit}>
                  Cancel
                </button>
              )}
            </div>

            {editing === "international" ? (
              <InternationalForm
                profile={profile}
                saving={saving}
                onSubmit={(data) =>
                  runAction(async () => {
                    const res = await updateInternationalProfileAction(data);
                    return res as { ok: boolean; error?: string };
                  })
                }
              />
            ) : (
              <div className={styles.grid}>
                <div className={styles.field}>
                  <p className={styles.label}>Country of Citizenship</p>
                  <p className={styles.value}>{profile.country ?? "—"}</p>
                </div>
                <div className={styles.field}>
                  <p className={styles.label}>Financial Aid Needed?</p>
                  <p className={styles.value}>
                    {profile.financialAid.requiresFinancialAid == null
                      ? "Not set"
                      : profile.financialAid.requiresFinancialAid
                        ? "Yes, full or partial"
                        : "No"}
                  </p>
                </div>
                <div className={styles.field}>
                  <p className={styles.label}>English Proficiency Test</p>
                  <p className={styles.value}>
                    {profile.international.englishProficiencyTest
                      ? `${profile.international.englishProficiencyTest}${
                          profile.international.englishProficiencyScore != null
                            ? ` (Score: ${profile.international.englishProficiencyScore})`
                            : ""
                        }`
                      : "—"}
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

interface FormProps {
  profile: StudentProfileView;
  saving: boolean;
  onSubmit: (data: Record<string, unknown>) => void;
}

function AcademicForm({ profile, saving, onSubmit }: FormProps) {
  const [form, setForm] = useState({
    firstName: profile.firstName ?? "",
    lastName: profile.lastName ?? "",
    gpa: profile.gpa != null ? String(profile.gpa) : "",
    gpaScale: profile.gpaScale != null ? String(profile.gpaScale) : "4.0",
    satScore: profile.satScore != null ? String(profile.satScore) : "",
    actScore: profile.actScore != null ? String(profile.actScore) : "",
    classYear: profile.classYear != null ? String(profile.classYear) : "",
    intendedMajor: profile.intendedMajor ?? "",
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      firstName: form.firstName.trim() || null,
      lastName: form.lastName.trim() || null,
      gpa: form.gpa ? Number(form.gpa) : null,
      gpaScale: form.gpaScale ? Number(form.gpaScale) : null,
      satScore: form.satScore ? Number(form.satScore) : null,
      actScore: form.actScore ? Number(form.actScore) : null,
      classYear: form.classYear ? Number(form.classYear) : null,
      intendedMajor: form.intendedMajor.trim() || null,
    });
  };

  return (
    <form onSubmit={submit} style={{display: "flex", flexDirection: "column", gap: "var(--space-4)"}}>
      <div className={styles.grid}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="pf-first">First Name</label>
          <input id="pf-first" className="input" value={form.firstName} onChange={(e) => setForm({...form, firstName: e.target.value})} />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="pf-last">Last Name</label>
          <input id="pf-last" className="input" value={form.lastName} onChange={(e) => setForm({...form, lastName: e.target.value})} />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="pf-gpa">GPA</label>
          <input id="pf-gpa" className="input" inputMode="decimal" placeholder="e.g. 3.6" value={form.gpa} onChange={(e) => setForm({...form, gpa: e.target.value})} />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="pf-gpa-scale">GPA Scale</label>
          <input id="pf-gpa-scale" className="input" inputMode="decimal" placeholder="4.0" value={form.gpaScale} onChange={(e) => setForm({...form, gpaScale: e.target.value})} />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="pf-sat">SAT Score</label>
          <input id="pf-sat" className="input" inputMode="numeric" placeholder="e.g. 1320" value={form.satScore} onChange={(e) => setForm({...form, satScore: e.target.value})} />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="pf-act">ACT Score</label>
          <input id="pf-act" className="input" inputMode="numeric" placeholder="e.g. 29" value={form.actScore} onChange={(e) => setForm({...form, actScore: e.target.value})} />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="pf-major">Intended Major</label>
          <input id="pf-major" className="input" placeholder="e.g. Engineering" value={form.intendedMajor} onChange={(e) => setForm({...form, intendedMajor: e.target.value})} />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="pf-class-year">Class Year</label>
          <input id="pf-class-year" className="input" inputMode="numeric" placeholder="e.g. 2028" value={form.classYear} onChange={(e) => setForm({...form, classYear: e.target.value})} />
        </div>
      </div>
      <div style={{display: "flex", justifyContent: "flex-end"}}>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}

function PreferencesForm({ profile, saving, onSubmit }: FormProps) {
  const [budget, setBudget] = useState(
    profile.financialAid.annualBudget != null ? String(profile.financialAid.annualBudget) : ""
  );
  const [requiresAid, setRequiresAid] = useState<boolean | null>(profile.financialAid.requiresFinancialAid);
  const [requiresScholarship, setRequiresScholarship] = useState<boolean | null>(profile.financialAid.requiresScholarship);
  const [regions, setRegions] = useState<string[]>(profile.preferences.preferredRegions);
  const [sizes, setSizes] = useState<string[]>(profile.preferences.preferredSizes);
  const [types, setTypes] = useState<string[]>(profile.preferences.publicPrivate);
  const [settings, setSettings] = useState<string[]>(profile.preferences.settings);
  const [sports, setSports] = useState(profile.preferences.sports.join(", "));
  const [clubs, setClubs] = useState(profile.preferences.clubs.join(", "));
  const [interests, setInterests] = useState(profile.preferences.interests.join(", "));

  const toggle = (list: string[], setList: (v: string[]) => void, value: string) =>
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      annualBudget: budget ? Number(budget) : null,
      requiresFinancialAid: requiresAid,
      requiresScholarship: requiresScholarship,
      preferredRegions: regions,
      preferredSizes: sizes,
      publicPrivate: types,
      settings,
      sports: sports.split(",").map((s) => s.trim()).filter(Boolean),
      clubs: clubs.split(",").map((s) => s.trim()).filter(Boolean),
      interests: interests.split(",").map((s) => s.trim()).filter(Boolean),
    });
  };

  return (
    <form onSubmit={submit} style={{display: "flex", flexDirection: "column", gap: "var(--space-5)"}}>
      <div className={styles.grid}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="pf-budget">Annual Budget (USD)</label>
          <input id="pf-budget" className="input" inputMode="numeric" placeholder="e.g. 35000" value={budget} onChange={(e) => setBudget(e.target.value)} />
        </div>
      </div>

      <div className={styles.field}>
        <p className={styles.label}>Preferred Regions</p>
        <div className={styles.chipRow}>
          {REGION_OPTIONS.map((r) => (
            <button type="button" key={r} className={`chip ${regions.includes(r) ? "active" : ""}`} onClick={() => toggle(regions, setRegions, r)}>
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.field}>
        <p className={styles.label}>Preferred Size</p>
        <div className={styles.chipRow}>
          {SIZE_OPTIONS.map((s) => (
            <button type="button" key={s} className={`chip ${sizes.includes(s) ? "active" : ""}`} onClick={() => toggle(sizes, setSizes, s)}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.field}>
        <p className={styles.label}>Public / Private</p>
        <div className={styles.chipRow}>
          {TYPE_OPTIONS.map((t) => (
            <button type="button" key={t} className={`chip ${types.includes(t) ? "active" : ""}`} onClick={() => toggle(types, setTypes, t)}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.field}>
        <p className={styles.label}>Campus Setting</p>
        <div className={styles.chipRow}>
          {SETTING_OPTIONS.map((s) => (
            <button type="button" key={s} className={`chip ${settings.includes(s) ? "active" : ""}`} onClick={() => toggle(settings, setSettings, s)}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="pf-sports">Sports (comma separated)</label>
          <input id="pf-sports" className="input" value={sports} onChange={(e) => setSports(e.target.value)} />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="pf-clubs">Clubs (comma separated)</label>
          <input id="pf-clubs" className="input" value={clubs} onChange={(e) => setClubs(e.target.value)} />
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="pf-interests">Campus Interests (comma separated)</label>
        <input id="pf-interests" className="input" value={interests} onChange={(e) => setInterests(e.target.value)} />
      </div>

      <div className={styles.field}>
        <p className={styles.label}>Financial Aid</p>
        <div className={styles.chipRow}>
          {[
            { label: "Financial aid required", value: requiresAid, set: setRequiresAid },
            { label: "Scholarship required", value: requiresScholarship, set: setRequiresScholarship },
          ].map((item) => (
            <button
              type="button"
              key={item.label}
              className={`chip ${item.value === true ? "active" : ""}`}
              onClick={() => item.set(item.value === true ? null : true)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{display: "flex", justifyContent: "flex-end"}}>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Saving..." : "Save Preferences"}
        </button>
      </div>
    </form>
  );
}

function InternationalForm({ profile, saving, onSubmit }: FormProps) {
  const [country, setCountry] = useState(profile.country ?? "");
  const [test, setTest] = useState(profile.international.englishProficiencyTest ?? "TOEFL");
  const [score, setScore] = useState(
    profile.international.englishProficiencyScore != null ? String(profile.international.englishProficiencyScore) : ""
  );
  const [ielts, setIelts] = useState(profile.international.ieltsScore != null ? String(profile.international.ieltsScore) : "");
  const [visa, setVisa] = useState(profile.international.visaType ?? "F-1");
  const [i20, setI20] = useState<boolean | null>(profile.international.needsI20Support);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      country: country.trim() || null,
      englishProficiencyTest: test.trim() || null,
      englishProficiencyScore: score ? Number(score) : null,
      ieltsScore: ielts ? Number(ielts) : null,
      visaType: visa.trim() || null,
      needsI20Support: i20,
    });
  };

  return (
    <form onSubmit={submit} style={{display: "flex", flexDirection: "column", gap: "var(--space-4)"}}>
      <div className={styles.grid}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="pf-country">Country of Citizenship</label>
          <input id="pf-country" className="input" value={country} onChange={(e) => setCountry(e.target.value)} />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="pf-visa">Visa Type</label>
          <input id="pf-visa" className="input" value={visa} onChange={(e) => setVisa(e.target.value)} />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="pf-test">English Proficiency Test</label>
          <select id="pf-test" className="input" value={test} onChange={(e) => setTest(e.target.value)}>
            <option value="TOEFL">TOEFL</option>
            <option value="IELTS">IELTS</option>
            <option value="Duolingo">Duolingo English Test</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="pf-test-score">{test === "IELTS" ? "IELTS Score" : "Test Score"}</label>
          <input
            id="pf-test-score"
            className="input"
            inputMode="decimal"
            placeholder={test === "IELTS" ? "e.g. 7.5" : "e.g. 105"}
            value={test === "IELTS" ? ielts : score}
            onChange={(e) => test === "IELTS" ? setIelts(e.target.value) : setScore(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.field}>
        <p className={styles.label}>I-20 / Visa Support Needed?</p>
        <div className={styles.chipRow}>
          <button type="button" className={`chip ${i20 === true ? "active" : ""}`} onClick={() => setI20(i20 === true ? null : true)}>
            Yes
          </button>
          <button type="button" className={`chip ${i20 === false ? "active" : ""}`} onClick={() => setI20(i20 === false ? null : false)}>
            No
          </button>
        </div>
      </div>

      <div style={{display: "flex", justifyContent: "flex-end"}}>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Saving..." : "Save Details"}
        </button>
      </div>
    </form>
  );
}