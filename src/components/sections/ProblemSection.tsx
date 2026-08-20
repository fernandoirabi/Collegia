import Image from "next/image";
import ScrollReveal from "@/components/ui/ScrollReveal";
import styles from "./ProblemSection.module.css";

export default function ProblemSection() {
  return (
    <section className={styles.section} aria-label="The problem">
      <div className={styles.inner}>
        {/* Left: Photo */}
        <div className={styles.imageCol}>
          <ScrollReveal>
            <div className={styles.imageFrame}>
              <Image
                src="/images/problem_student.jpg"
                alt="International student surrounded by college brochures at library"
                fill
                style={{ objectFit: "cover", objectPosition: "center top" }}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              {/* Floating complexity card */}
              <div className={styles.floatPill}>
                <div className={styles.pillRow}>
                  <span className={styles.pillNum}>4,000+</span>
                  <span className={styles.pillLabel}>Colleges to consider</span>
                </div>
                <div className={styles.pillDivider} />
                <div className={styles.pillRow}>
                  <span className={styles.pillNum}>38</span>
                  <span className={styles.pillLabel}>Average deadlines</span>
                </div>
                <div className={styles.pillDivider} />
                <div className={styles.pillRow}>
                  <span className={styles.pillNum}>∞</span>
                  <span className={styles.pillLabel}>Unanswered questions</span>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Right: Editorial text */}
        <div className={styles.textCol}>
          <ScrollReveal delay={100}>
            <p className="label text-primary" style={{ marginBottom: "var(--space-5)" }}>
              The Reality
            </p>
          </ScrollReveal>

          <ScrollReveal delay={150}>
            <h2 className={styles.headline}>
              4,000+ colleges.<br />
              <em>Thousands</em> of<br />
              deadlines.<br />
              Countless decisions.
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={250}>
            <p className={styles.body}>
              The U.S. college admissions process is one of the most complex
              systems a student will ever navigate — and for international students,
              it&apos;s even harder. Different grading systems, visa requirements,
              financial aid restrictions, and cultural differences make it
              overwhelming for even the most prepared students.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={320}>
            <div className={styles.dividerLine} />
          </ScrollReveal>

          <ScrollReveal delay={380}>
            <p className={styles.resolution}>
              COLLEGIA turns the complexity of college admissions
              into a path you can actually follow.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={450}>
            <div className={styles.pillsRow}>
              {["Find your fit", "Understand your chances", "Improve your profile", "Track your progress"].map((p) => (
                <span key={p} className={`chip`}>{p}</span>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
