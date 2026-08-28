import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import GuideCard from "@/components/ui/GuideCard";
import GuideContent from "@/components/learning/GuideContent";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Signal,
  CalendarDays,
  Lightbulb,
} from "lucide-react";
import { guides, getGuideBySlug, getCategoryHref, getRelatedGuides } from "@/data/guides";
import { getCategoryLabel } from "@/types/guides";
import styles from "./page.module.css";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return guides.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) return {};
  return {
    title: guide.title,
    description: guide.description,
  };
}

function formatDate(date: string): string {
  return new Date(date + "T00:00:00").toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function GuideArticlePage({ params }: Props) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) notFound();

  const relatedGuides = getRelatedGuides(guide, 3);
  const categoryHref = getCategoryHref(guide.category);
  const categoryLabel = getCategoryLabel(guide.category);

  // Prev / next within the full guide library
  const index = guides.findIndex((g) => g.slug === guide.slug);
  const prevGuide = index > 0 ? guides[index - 1] : undefined;
  const nextGuide = index < guides.length - 1 ? guides[index + 1] : undefined;

  return (
    <>
      <Navigation />
      <main className={styles.main}>
        <article>
          {/* Article header */}
          <header className={styles.header}>
            <div className={`container ${styles.headerContainer}`}>
              <nav className={styles.breadcrumb} aria-label="Breadcrumb">
                <Link href="/learn" className={styles.crumb}>Learning</Link>
                <span className={styles.crumbSep}>/</span>
                <Link href={categoryHref} className={styles.crumb}>{categoryLabel}</Link>
              </nav>

              <div className={styles.metaRow}>
                <Link href={categoryHref} className={`badge ${styles.categoryBadge}`}>
                  {categoryLabel}
                </Link>
                <span className={styles.metaText}>
                  <Clock size={13} /> {guide.readTime} min read
                </span>
                <span className={styles.dot} />
                <span className={styles.metaText}>
                  <Signal size={13} /> {guide.difficulty}
                </span>
              </div>

              <h1 className={styles.title}>{guide.title}</h1>
              <p className={styles.excerpt}>{guide.description}</p>

              <div className={styles.updatedRow}>
                <CalendarDays size={14} />
                Last updated {formatDate(guide.lastUpdated)}
              </div>
            </div>
          </header>

          {/* Body */}
          <div className="container">
            <div className={styles.bodyContent}>
              {guide.takeaways && guide.takeaways.length > 0 && (
                <aside className={styles.takeaways}>
                  <div className={styles.takeawaysHeader}>
                    <Lightbulb size={18} />
                    <h2 className={styles.takeawaysTitle}>Key Takeaways</h2>
                  </div>
                  <ul className={styles.takeawaysList}>
                    {guide.takeaways.map((t, i) => (
                      <li key={i} className={styles.takeawayItem}>{t}</li>
                    ))}
                  </ul>
                </aside>
              )}

              {guide.sections.map((section) => (
                <section key={section.id} className={styles.section}>
                  <h2 className={styles.sectionTitle}>{section.title}</h2>
                  <GuideContent content={section.content} />

                  {section.checklist && section.checklist.length > 0 && (
                    <div className={styles.checklist}>
                      <p className={styles.checklistLabel}>Checklist</p>
                      <ul className={styles.checklistList}>
                        {section.checklist.map((item, i) => (
                          <li key={i} className={styles.checklistItem}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </section>
              ))}

              {guide.cta && (
                <section className={styles.cta}>
                  {guide.cta.description && (
                    <p className={styles.ctaDescription}>{guide.cta.description}</p>
                  )}
                  <Link href={guide.cta.href} className="btn btn-primary">
                    {guide.cta.label} <ArrowRight size={15} />
                  </Link>
                </section>
              )}
            </div>
          </div>
        </article>

        {/* Continue learning (prev / next) */}
        {(prevGuide || nextGuide) && (
          <section className={styles.continueSection}>
            <div className="container">
              <h2 className={styles.continueTitle}>Continue Learning</h2>
              <div className={styles.continueGrid}>
                {prevGuide && (
                  <Link
                    href={`/learn/${prevGuide.slug}`}
                    className={`${styles.continueCard} ${styles.continuePrev}`}
                  >
                    <span className={styles.continueDir}>
                      <ArrowLeft size={14} /> Previous
                    </span>
                    <span className={styles.continueName}>{prevGuide.title}</span>
                  </Link>
                )}
                {nextGuide && (
                  <Link
                    href={`/learn/${nextGuide.slug}`}
                    className={`${styles.continueCard} ${styles.continueNext}`}
                  >
                    <span className={styles.continueDir}>
                      Next <ArrowRight size={14} />
                    </span>
                    <span className={styles.continueName}>{nextGuide.title}</span>
                  </Link>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Related guides */}
        {relatedGuides.length > 0 && (
          <section className={styles.relatedSection}>
            <div className="container">
              <h2 className={styles.relatedTitle}>Related Guides</h2>
              <div className={styles.relatedGrid}>
                {relatedGuides.map((guide) => (
                  <GuideCard key={guide.slug} guide={guide} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
