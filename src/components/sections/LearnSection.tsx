import Link from "next/link";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { ArrowRight } from "lucide-react";
import GuideCard from "@/components/ui/GuideCard";
import { getFeaturedGuides } from "@/data/guides";
import styles from "./LearnSection.module.css";

const categories = [
  { label: "How to Apply", color: "blue", href: "/learn/how-to-apply" },
  { label: "Financial Aid", color: "green", href: "/learn/financial-aid" },
  { label: "Essays", color: "lavender", href: "/learn/essays" },
  { label: "International Students", color: "amber", href: "/learn/international-students" },
];

export default function LearnSection() {
  const featured = getFeaturedGuides(4);

  return (
    <section className={styles.section}>
      <div className="container">
        {/* Header */}
        <div className={styles.header}>
          <ScrollReveal>
            <p className="label text-primary" style={{marginBottom:"var(--space-4)"}}>Learn</p>
            <h2 className="headline-lg">Everything you need<br />to know.</h2>
          </ScrollReveal>

          <ScrollReveal delay={150}>
            <div className={styles.categoryNav}>
              {categories.map((cat) => (
                <Link
                  key={cat.label}
                  href={cat.href}
                  className={`${styles.catLink} ${styles[`cat_${cat.color}`]}`}
                >
                  {cat.label}
                </Link>
              ))}
            </div>
            <Link href="/learn" className="btn btn-secondary btn-sm" id="learn-see-all">
              View All Guides
              <ArrowRight size={14} />
            </Link>
          </ScrollReveal>
        </div>

        {/* Featured guide grid */}
        <div className={styles.grid}>
          {featured.map((guide, i) => (
            <ScrollReveal key={guide.slug} delay={i * 100} className={styles.gridItem}>
              <GuideCard guide={guide} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
