import Link from "next/link";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { CheckCircle2, Circle, Clock, ArrowRight } from "lucide-react";
import styles from "./JourneyPreview.module.css";

const steps = [
  { label: "College List", status: "complete" },
  { label: "Testing", status: "complete" },
  { label: "Essays", status: "progress", pct: 60 },
  { label: "Recommendations", status: "upcoming" },
  { label: "Applications", status: "upcoming" },
];

export default function JourneyPreview() {
  return (
    <section className={styles.section}>
      {/* Background gradient block */}
      <div className={styles.bgBlock} aria-hidden="true" />

      <div className="container">
        <div className={styles.inner}>
          {/* Left: Text */}
          <div className={styles.textCol}>
            <ScrollReveal>
              <p className="label" style={{color:"var(--color-primary)", marginBottom:"var(--space-5)"}}>My Journey</p>
              <h2 className={styles.headline}>
                Your journey.<br />
                <em>Your pace.</em>
              </h2>
            </ScrollReveal>

            <ScrollReveal delay={150}>
              <p className={styles.body}>
                COLLEGIA keeps track of every step — from building your
                college list to submitting your final applications. No
                spreadsheets. No confusion. Just your next step, clearly.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={250}>
              <div className={styles.featurePills}>
                {[
                  "Track every college",
                  "Manage deadlines",
                  "Set goals",
                  "Monitor progress",
                ].map((f) => (
                  <div key={f} className={styles.featurePill}>
                    <CheckCircle2 size={14} color="var(--color-green)" />
                    {f}
                  </div>
                ))}
              </div>
            </ScrollReveal>

            <ScrollReveal delay={350}>
              <Link href="/journey" className="btn btn-primary" id="journey-preview-cta">
                View My Journey
                <ArrowRight size={15} />
              </Link>
            </ScrollReveal>
          </div>

          {/* Right: Dashboard preview cards */}
          <div className={styles.dashCol}>
            {/* Stats row */}
            <ScrollReveal delay={100}>
              <div className={styles.statsRow}>
                <div className={styles.statCard}>
                  <span className={styles.statNum}>8</span>
                  <span className={styles.statLbl}>My Colleges</span>
                </div>
                <div className={`${styles.statCard} ${styles.statCardBlue}`}>
                  <span className={styles.statNum}>64%</span>
                  <span className={styles.statLbl}>Progress</span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statNum}>3</span>
                  <span className={styles.statLbl}>Active Goals</span>
                </div>
                <div className={`${styles.statCard} ${styles.statCardCoral}`}>
                  <span className={styles.statNum}>47</span>
                  <span className={styles.statLbl}>Days to Deadline</span>
                </div>
              </div>
            </ScrollReveal>

            {/* Timeline */}
            <ScrollReveal delay={200}>
              <div className={styles.timeline}>
                <p className={styles.timelineTitle}>Application Timeline</p>
                <div className={styles.steps}>
                  {steps.map((step, i) => (
                    <div key={step.label} className={styles.step}>
                      <div className={styles.stepLeft}>
                        {step.status === "complete" ? (
                          <CheckCircle2 size={18} color="var(--color-green)" />
                        ) : step.status === "progress" ? (
                          <Clock size={18} color="var(--color-primary)" />
                        ) : (
                          <Circle size={18} color="var(--color-ink-faint)" />
                        )}
                        {i < steps.length - 1 && (
                          <div className={`${styles.connector} ${step.status === "complete" ? styles.connectorDone : ""}`} />
                        )}
                      </div>
                      <div className={styles.stepRight}>
                        <span className={`${styles.stepLabel} ${
                          step.status === "complete" ? styles.labelDone :
                          step.status === "progress" ? styles.labelProgress : styles.labelUpcoming
                        }`}>
                          {step.label}
                        </span>
                        {step.status === "progress" && step.pct && (
                          <div className={styles.progressMini}>
                            <div className="progress-bar-track" style={{height:"5px"}}>
                              <div className="progress-bar-fill" style={{width:`${step.pct}%`}} />
                            </div>
                            <span className={styles.progressPct}>{step.pct}%</span>
                          </div>
                        )}
                        {step.status === "complete" && (
                          <span className={styles.done}>Completed</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* Recommended next step */}
            <ScrollReveal delay={350}>
              <div className={styles.nextStep}>
                <div className={styles.nextStepIcon}>→</div>
                <div>
                  <p className={styles.nextStepLabel}>Recommended Next Step</p>
                  <p className={styles.nextStepText}>Complete your personal statement essay.</p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
