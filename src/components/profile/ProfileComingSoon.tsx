import Link from "next/link";
import { ArrowRight, GraduationCap, Globe, SlidersHorizontal, Sparkles } from "lucide-react";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import styles from "./ProfileComingSoon.module.css";

const WHATS_NEXT = [
  {
    icon: GraduationCap,
    title: "Academic profile",
    desc: "GPA, test scores, and intended major.",
  },
  {
    icon: SlidersHorizontal,
    title: "College preferences",
    desc: "Budget, campus size, location, and more.",
  },
  {
    icon: Globe,
    title: "International details",
    desc: "Citizenship, English proficiency, and financial aid needs.",
  },
];

export default function ProfileComingSoon() {
  return (
    <>
      <Navigation />
      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.glow} aria-hidden="true" />
          <div className="container">
            <div className={styles.card}>
              <span className={styles.badge}>
                <Sparkles size={14} />
                Coming Soon
              </span>

              <h1 className={styles.title}>Your profile is coming soon.</h1>

              <p className={styles.sub}>
                Your personalized student profile is one of the next pieces we&apos;re building
                for COLLEGIA. Soon you&apos;ll be able to build your academic and personal profile
                and use it across your college journey.
              </p>

              <div className={styles.features}>
                {WHATS_NEXT.map((f) => {
                  const Icon = f.icon;
                  return (
                    <div key={f.title} className={styles.feature}>
                      <span className={styles.featureIcon}>
                        <Icon size={20} />
                      </span>
                      <div className={styles.featureText}>
                        <p className={styles.featureTitle}>{f.title}</p>
                        <p className={styles.featureDesc}>{f.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className={styles.note}>
                Meanwhile, explore colleges and build your College Match — no profile needed.
              </p>

              <div className={styles.actions}>
                <Link
                  href="/journey"
                  className="btn btn-primary btn-lg"
                  id="profile-coming-soon-journey"
                >
                  Back to Journey
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href="/discover"
                  className="btn btn-secondary btn-lg"
                  id="profile-coming-soon-discover"
                >
                  Explore Colleges
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}