import type { Metadata } from "next";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { Compass, ListChecks, BookOpenText, PenLine, UserCheck, HandCoins, Send, CircleCheckBig, ArrowRight, SlidersHorizontal } from "lucide-react";
import { applicationGuides } from "@/data/guides/application";
import { getGuideBySlug } from "@/data/guides";
import GuideCard from "@/components/ui/GuideCard";
import type { Guide } from "@/types/guides";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "How to Apply",
  description:
    "A complete roadmap to the U.S. college application process — from building your list to submitting and tracking decisions.",
};

const ROADMAP = [
  { icon: Compass, title: "Understand your goals", desc: "Clarify your priorities — major, budget, location, and culture." },
  { icon: ListChecks, title: "Build your college list", desc: "Create a balanced mix of reaches, targets, and safeties." },
  { icon: BookOpenText, title: "Prepare your academic profile", desc: "Strengthen your grades, transcript, and testing." },
  { icon: PenLine, title: "Complete applications", desc: "Fill out the Common App and college-specific forms." },
  { icon: PenLine, title: "Write essays", desc: "Craft a personal statement and supplemental essays." },
  { icon: UserCheck, title: "Request recommendations", desc: "Choose teachers and prepare them to write strong letters." },
  { icon: HandCoins, title: "Apply for financial aid", desc: "Research scholarships and submit the right aid forms." },
  { icon: Send, title: "Submit and track decisions", desc: "Stay organized, hit deadlines, and compare your offers." },
] as const;

const GROUPS: { slug: string; title: string; description: string; guideSlugs: string[] }[] = [
  {
    slug: "getting-started",
    title: "Getting Started",
    description: "Understand how U.S. admissions works and build a strong foundation for your search.",
    guideSlugs: [
      "how-us-college-admissions-works",
      "how-to-build-a-college-list",
      "reach-vs-target-vs-likely-vs-safety",
    ],
  },
  {
    slug: "building-your-application",
    title: "Building Your Application",
    description: "Assemble every required piece — the Common App, test scores, transcripts, and recommendations.",
    guideSlugs: [
      "common-app-guide",
      "standardized-testing",
      "transcripts-academic-records",
      "letters-of-recommendation",
    ],
  },
  {
    slug: "submitting-your-application",
    title: "Submitting Your Application",
    description: "Plan your timeline, meet deadlines, and know what happens once you hit submit.",
    guideSlugs: ["application-deadlines"],
  },
];

export default function HowToApplyPage() {
  const featured = applicationGuides.filter((g) => g.featured);

  const guidesBySlug = (slugs: string[]): Guide[] =>
    slugs
      .map((slug) => getGuideBySlug(slug))
      .filter((g): g is Guide => Boolean(g));

  return (
    <>
      <Navigation />
      <main className={styles.main}>
        {/* Header */}
        <header className={styles.header}>
          <div className="container">
            <p className={styles.eyebrow}>Learning · How to Apply</p>
            <h1 className={styles.title}>How to Apply to U.S. Colleges</h1>
            <p className={styles.sub}>
              Collegia guides international students through the entire U.S. application
              process — from understanding your goals to submitting and tracking your decisions.
            </p>
            <div className={styles.headerActions}>
              <Link href="/discover/match" className="btn btn-primary">
                <SlidersHorizontal size={16} /> Get Your College Match
              </Link>
              <Link href="/learn/all-guides" className="btn btn-secondary">
                Browse All Guides <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </header>

        {/* Roadmap */}
        <section className="container" style={{ marginTop: "var(--space-16)" }}>
          <h2 className={styles.sectionTitle}>Your Application Roadmap</h2>
          <p className={styles.sectionLead}>
            Follow these eight stages in order to move through the process with confidence.
          </p>
          <div className={styles.roadmap}>
            {ROADMAP.map((step, i) => {
              const Icon = step.icon;
              return (
                <div className={styles.step} key={step.title}>
                  <div className={styles.stepTop}>
                    <span className={styles.stepNumber}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className={styles.stepIcon}>
                      <Icon size={18} />
                    </span>
                  </div>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepDesc}>{step.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Featured guides */}
        <section className="container" style={{ marginTop: "var(--space-20)" }}>
          <h2 className={styles.sectionTitle}>Essential Guides to Start</h2>
          <div className={styles.featuredGrid}>
            {featured.slice(0, 2).map((guide) => (
              <GuideCard key={guide.slug} guide={guide} variant="featured" />
            ))}
          </div>
        </section>

        {/* Grouped guides */}
        <section className="container" style={{ marginTop: "var(--space-16)" }}>
          {GROUPS.map((group) => {
            const groupGuides = guidesBySlug(group.guideSlugs);
            return (
              <div className={styles.group} key={group.slug}>
                <div className={styles.groupHeader}>
                  <h3 className={styles.groupTitle}>{group.title}</h3>
                  <p className={styles.groupDesc}>{group.description}</p>
                </div>
                <div className={styles.groupGrid}>
                  {groupGuides.map((guide) => (
                    <GuideCard key={guide.slug} guide={guide} />
                  ))}
                </div>
              </div>
            );
          })}
        </section>

        {/* Bottom CTA */}
        <section className={styles.ctaSection}>
          <div className="container">
            <div className={styles.ctaBox}>
              <CircleCheckBig size={28} className={styles.ctaIcon} />
              <div>
                <h2 className={styles.ctaTitle}>Not sure where to start?</h2>
                <p className={styles.ctaDesc}>
                  Take the College Match to see which colleges fit your profile, goals, and budget in minutes.
                </p>
              </div>
              <Link href="/discover/match" className="btn btn-primary">
                Start College Match <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
