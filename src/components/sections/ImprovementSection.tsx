import Link from "next/link";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { TrendingUp, Target, Star, ArrowRight } from "lucide-react";
import styles from "./ImprovementSection.module.css";

const goals = [
  {
    icon: TrendingUp,
    title: "Reach 1400 SAT",
    current: 1320,
    target: 1400,
    progress: 66,
    color: "blue",
    action: "Practice 2 hours/week on Math section",
  },
  {
    icon: Target,
    title: "Strengthen GPA",
    current: 3.6,
    target: 3.8,
    progress: 80,
    color: "green",
    action: "Focus on science courses next semester",
  },
  {
    icon: Star,
    title: "Build Extracurriculars",
    current: 2,
    target: 4,
    progress: 50,
    color: "lavender",
    action: "Join robotics club or hackathon team",
  },
];

export default function ImprovementSection() {
  return (
    <section className={styles.section}>
      {/* Color block accent */}
      <div className={styles.colorBlock} aria-hidden="true" />

      <div className={`container ${styles.inner}`}>
        {/* Left: Message */}
        <div className={styles.left}>
          <ScrollReveal>
            <p className="label" style={{ color: "var(--color-primary)", marginBottom: "var(--space-5)" }}>
              The Collegia Difference
            </p>
          </ScrollReveal>

          <ScrollReveal delay={80}>
            <h2 className={styles.headline}>
              Don&apos;t just see<br />
              where you stand.<br />
              <em>See how you can<br />
              improve.</em>
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={180}>
            <p className={styles.body}>
              Most platforms tell you your chances and stop there.
              COLLEGIA shows you what you can work toward — and gives you a
              concrete plan to get there.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={260}>
            <blockquote className={styles.quote}>
              &ldquo;COLLEGIA doesn&apos;t tell you that you aren&apos;t good enough.
              It shows you what you can build toward.&rdquo;
            </blockquote>
          </ScrollReveal>

          <ScrollReveal delay={340}>
            <Link href="/journey/goals" className={`btn btn-primary`} id="improvement-cta">
              See My Opportunities
              <ArrowRight size={15} />
            </Link>
          </ScrollReveal>
        </div>

        {/* Right: Goal cards */}
        <div className={styles.right}>
          <ScrollReveal delay={100}>
            <div className={styles.profileCard}>
              <p className={styles.profileLabel}>Current Profile — Demo</p>
              <div className={styles.profileStats}>
                <div className={styles.profileStat}>
                  <span className={styles.statNum}>3.6</span>
                  <span className={styles.statLbl}>GPA</span>
                </div>
                <div className={styles.profileStatDivider} />
                <div className={styles.profileStat}>
                  <span className={styles.statNum}>1320</span>
                  <span className={styles.statLbl}>SAT</span>
                </div>
                <div className={styles.profileStatDivider} />
                <div className={styles.profileStat}>
                  <span className={styles.statNum}>Eng.</span>
                  <span className={styles.statLbl}>Major</span>
                </div>
              </div>
              <p className={styles.profileDisclaimer}>
                Demo data only — not an actual student profile
              </p>
            </div>
          </ScrollReveal>

          <p className={styles.goalsTitle}>Your next opportunities</p>

          {goals.map((goal, i) => {
            const Icon = goal.icon;
            return (
              <ScrollReveal key={goal.title} delay={200 + i * 100}>
                <div className={`${styles.goalCard} ${styles[`goal_${goal.color}`]}`}>
                  <div className={styles.goalHeader}>
                    <div className={styles.goalIconWrap}>
                      <Icon size={16} />
                    </div>
                    <div className={styles.goalInfo}>
                      <p className={styles.goalTitle}>{goal.title}</p>
                      <p className={styles.goalRange}>
                        {goal.current} → {goal.target}
                      </p>
                    </div>
                    <span className={styles.goalPct}>{goal.progress}%</span>
                  </div>

                  <div className="progress-bar-track" style={{margin:"var(--space-3) 0"}}>
                    <div
                      className={`progress-bar-fill ${goal.color === "green" ? "green" : ""}`}
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>

                  <p className={styles.goalAction}>{goal.action}</p>
                </div>
              </ScrollReveal>
            );
          })}

          <ScrollReveal delay={550}>
            <div className={styles.nextStep}>
              <div className={styles.nextStepDot} />
              <div>
                <p className={styles.nextStepLabel}>Recommended Next Step</p>
                <p className={styles.nextStepText}>Focus on reaching 1400 SAT — it opens 3 more Strong Match colleges</p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
