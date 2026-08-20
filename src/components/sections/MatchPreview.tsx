import Link from "next/link";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { ArrowRight, Sparkles } from "lucide-react";
import styles from "./MatchPreview.module.css";

const profileFields = [
  { label: "GPA", value: "3.8", color: "green" },
  { label: "SAT", value: "1420", color: "blue" },
  { label: "Major", value: "Engineering", color: "lavender" },
  { label: "Budget", value: "$35,000", color: "amber" },
  { label: "Student Type", value: "International", color: "sky" },
];

const matches = [
  {
    type: "Strong Match" as const,
    badge: "badge-strong",
    dot: "dotGreen",
    school: "University of Florida",
    location: "Gainesville, FL",
    acceptance: "24%",
    satRange: "1330–1490",
    tuition: "$28,700",
  },
  {
    type: "Target" as const,
    badge: "badge-target",
    dot: "dotAmber",
    school: "Boston College",
    location: "Chestnut Hill, MA",
    acceptance: "19%",
    satRange: "1390–1530",
    tuition: "$62,000",
  },
  {
    type: "Reach" as const,
    badge: "badge-reach",
    dot: "dotCoral",
    school: "NYU",
    location: "New York, NY",
    acceptance: "12%",
    satRange: "1370–1540",
    tuition: "$60,000",
  },
];

const dotColors: Record<string, string> = {
  dotGreen: "#22A06B",
  dotAmber: "#D4870A",
  dotCoral: "#D94F43",
};

export default function MatchPreview() {
  return (
    <section className={styles.section} aria-label="College Match preview">
      <div className={`container`}>
        <div className={styles.header}>
          <ScrollReveal>
            <p className="label text-primary" style={{ marginBottom: "var(--space-4)" }}>College Match</p>
            <h2 className="headline-lg">Find your match.</h2>
          </ScrollReveal>
          <ScrollReveal delay={150}>
            <p className={styles.headerDesc}>
              Tell us who you are, what you want, and where you&apos;re headed.
              We&apos;ll help you discover colleges that fit your goals.
            </p>
            <p className={styles.disclaimer}>
              ⚠️ Match results shown below are illustrative examples only and do not represent actual admissions probabilities.
            </p>
          </ScrollReveal>
        </div>

        <div className={styles.mockup}>
          {/* Profile Panel */}
          <ScrollReveal delay={100} className={styles.profilePanel}>
            <div className={styles.profileHeader}>
              <div className={styles.avatar}>AT</div>
              <div>
                <p className={styles.profileName}>Aiko T.</p>
                <p className={styles.profileSub}>Japan · Engineering</p>
              </div>
              <div className={styles.profileBadge}>
                <Sparkles size={12} />
                Demo Profile
              </div>
            </div>

            <div className={styles.profileFields}>
              {profileFields.map((f) => (
                <div key={f.label} className={`${styles.fieldRow} ${styles[`field_${f.color}`]}`}>
                  <span className={styles.fieldLabel}>{f.label}</span>
                  <span className={styles.fieldValue}>{f.value}</span>
                </div>
              ))}
            </div>

            <Link href="/discover/match" className={`btn btn-primary`} style={{width:"100%", justifyContent:"center", marginTop:"var(--space-4)"}}>
              Try With Your Profile
              <ArrowRight size={15} />
            </Link>
          </ScrollReveal>

          {/* Matches Panel */}
          <div className={styles.matchesPanel}>
            <ScrollReveal>
              <p className={styles.matchesTitle}>Your College Matches</p>
              <p className={styles.matchesSub}>Based on your academic profile and preferences</p>
            </ScrollReveal>

            <div className={styles.matchList}>
              {matches.map((m, i) => (
                <ScrollReveal key={m.school} delay={i * 100 + 200}>
                  <div className={styles.matchRow}>
                    <div className={styles.matchLeft}>
                      <div className={styles.matchDot} style={{background: dotColors[m.dot]}} />
                      <div>
                        <p className={styles.matchSchool}>{m.school}</p>
                        <p className={styles.matchLocation}>{m.location}</p>
                      </div>
                    </div>
                    <div className={styles.matchRight}>
                      <span className={`badge ${m.badge}`}>{m.type}</span>
                      <div className={styles.matchStats}>
                        <span>{m.acceptance} accept.</span>
                        <span>{m.tuition}/yr</span>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            <ScrollReveal delay={500}>
              <div className={styles.ctaRow}>
                <Link href="/discover/match" className={`btn btn-primary`} id="match-preview-cta">
                  Build Your Match List
                  <ArrowRight size={15} />
                </Link>
                <Link href="/discover/search" className={`btn btn-secondary`}>
                  Browse All Colleges
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
