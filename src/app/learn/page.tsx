import type { Metadata } from "next";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { ArrowRight, BookOpen, GraduationCap, DollarSign, FileText, Globe2 } from "lucide-react";
import { getFeaturedGuides, getGuidesByCategory } from "@/data/guides";
import { GUIDE_CATEGORIES, type GuideCategory } from "@/types/guides";
import GuideCard from "@/components/ui/GuideCard";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Learn & Guide",
  description:
    "Comprehensive guides on US college admissions, financial aid, essays, and visas for international students.",
};

const CATEGORY_ICON: Record<GuideCategory, typeof GraduationCap> = {
  application: GraduationCap,
  "financial-aid": DollarSign,
  essays: FileText,
  international: Globe2,
};

export default function LearnHubPage() {
  const featured = getFeaturedGuides(4);
  const categories = (Object.keys(GUIDE_CATEGORIES) as GuideCategory[])
    .map((category) => ({
      category,
      label: GUIDE_CATEGORIES[category].label,
      description: GUIDE_CATEGORIES[category].description,
      count: getGuidesByCategory(category).length,
      href:
        category === "application"
          ? "/learn/how-to-apply"
          : category === "financial-aid"
            ? "/learn/financial-aid"
            : category === "essays"
              ? "/learn/essays"
              : "/learn/international-students",
      icon: CATEGORY_ICON[category],
    }));

  return (
    <>
      <Navigation />
      <main className={styles.main}>
        {/* Header */}
        <div className={styles.header}>
          <div className="container">
            <p className={styles.eyebrow}>Learning</p>
            <h1 className={styles.title}>Learn & Guide</h1>
            <p className={styles.sub}>
              Everything you need to navigate US college admissions as a student — from building
              your list to writing essays and sorting out financial aid.
            </p>
            <div className={styles.headerActions}>
              <Link href="/learn/how-to-apply" className="btn btn-primary">
                How to Apply <ArrowRight size={15} />
              </Link>
              <Link href="/learn/all-guides" className="btn btn-secondary">
                Browse All Guides
              </Link>
            </div>
          </div>
        </div>

        <div className="container" style={{ paddingTop: "var(--space-12)" }}>
          {/* Category cards */}
          <h2 className={styles.sectionTitle}>Explore Topics</h2>
          <div className={styles.categoryGrid}>
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link href={cat.href} key={cat.category} className={styles.categoryCard}>
                  <div className={styles.categoryTop}>
                    <span className={styles.categoryIcon}>
                      <Icon size={20} />
                    </span>
                    <span className={styles.categoryCount}>{cat.count} guides</span>
                  </div>
                  <h3 className={styles.categoryLabel}>{cat.label}</h3>
                  <p className={styles.categoryDesc}>{cat.description}</p>
                </Link>
              );
            })}
          </div>

          {/* Featured guides */}
          <h2 className={styles.sectionTitle} style={{ marginTop: "var(--space-16)" }}>
            Featured Reading
          </h2>
          <div className={styles.articleGrid}>
            {featured.map((guide) => (
              <GuideCard key={guide.slug} guide={guide} variant="featured" />
            ))}
          </div>

          {/* All guides link */}
          <div className={styles.moreWrap}>
            <Link href="/learn/all-guides" className="btn btn-secondary btn-lg">
              <BookOpen size={17} />
              View All Guides
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
