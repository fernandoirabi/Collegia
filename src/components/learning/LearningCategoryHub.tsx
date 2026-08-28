import Link from "next/link";
import { ArrowRight } from "lucide-react";
import GuideCard from "@/components/ui/GuideCard";
import type { Guide } from "@/types/guides";
import styles from "./LearningCategoryHub.module.css";

export interface HubAction {
  label: string;
  href: string;
}

export interface HubGroup {
  title: string;
  description: string;
  guides: Guide[];
}

interface LearningCategoryHubProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  featured: Guide[];
  groups: HubGroup[];
  primaryAction?: HubAction;
  secondaryAction?: HubAction;
  bottomTitle?: string;
  bottomDescription?: string;
  bottomAction?: HubAction;
  children?: React.ReactNode;
}

export default function LearningCategoryHub({
  eyebrow,
  title,
  subtitle,
  featured,
  groups,
  primaryAction,
  secondaryAction,
  bottomTitle,
  bottomDescription,
  bottomAction,
  children,
}: LearningCategoryHubProps) {
  return (
    <main className={styles.main}>
      {/* Header */}
      <header className={styles.header}>
        <div className="container">
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.sub}>{subtitle}</p>
          {(primaryAction || secondaryAction) && (
            <div className={styles.headerActions}>
              {primaryAction && (
                <Link href={primaryAction.href} className="btn btn-primary">
                  {primaryAction.label} <ArrowRight size={15} />
                </Link>
              )}
              {secondaryAction && (
                <Link href={secondaryAction.href} className="btn btn-secondary">
                  {secondaryAction.label}
                </Link>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Optional custom body (intro / visual sections) */}
      {children && (
        <div className="container">{children}</div>
      )}

      {/* Featured guides */}
      {featured.length > 0 && (
        <section className="container" style={{ marginTop: "var(--space-16)" }}>
          <h2 className={styles.sectionTitle}>Featured Guides</h2>
          <div className={styles.featuredGrid}>
            {featured.map((guide) => (
              <GuideCard key={guide.slug} guide={guide} variant="featured" />
            ))}
          </div>
        </section>
      )}

      {/* Grouped guides */}
      <section className="container" style={{ marginTop: "var(--space-16)" }}>
        {groups.map((group) => (
          <div className={styles.group} key={group.title}>
            <div className={styles.groupHeader}>
              <h3 className={styles.groupTitle}>{group.title}</h3>
              {group.description && (
                <p className={styles.groupDesc}>{group.description}</p>
              )}
            </div>
            <div className={styles.groupGrid}>
              {group.guides.map((guide) => (
                <GuideCard key={guide.slug} guide={guide} />
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* Bottom CTA */}
      {bottomAction && (
        <section className={styles.ctaSection}>
          <div className="container">
            <div className={styles.ctaBox}>
              <div>
                {bottomTitle && <h2 className={styles.ctaTitle}>{bottomTitle}</h2>}
                {bottomDescription && <p className={styles.ctaDesc}>{bottomDescription}</p>}
              </div>
              <Link href={bottomAction.href} className="btn btn-primary">
                {bottomAction.label} <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
