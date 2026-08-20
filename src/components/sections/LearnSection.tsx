import Link from "next/link";
import Image from "next/image";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { ArrowRight, Clock } from "lucide-react";
import { articles } from "@/data";
import styles from "./LearnSection.module.css";

const categories = [
  { label: "How to Apply", color: "blue", href: "/learn/how-to-apply" },
  { label: "Financial Aid", color: "green", href: "/learn/financial-aid" },
  { label: "Essays", color: "lavender", href: "/learn/essays" },
  { label: "International Students", color: "amber", href: "/learn/international-students" },
];

export default function LearnSection() {
  const featured = articles.filter((a) => a.featured).slice(0, 4);

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
              View All Articles
              <ArrowRight size={14} />
            </Link>
          </ScrollReveal>
        </div>

        {/* Article grid: editorial layout */}
        <div className={styles.grid}>
          {/* Large featured article */}
          <ScrollReveal delay={100} className={styles.featuredArticle}>
            <Link href={`/learn/${featured[0]?.slug}`} className={styles.featuredInner}>
              <div className={styles.featuredImage}>
                <Image
                  src={featured[0]?.image || "/images/hero_campus.jpg"}
                  alt={featured[0]?.title || "Article"}
                  fill
                  style={{objectFit:"cover"}}
                  sizes="(max-width: 768px) 100vw, 55vw"
                />
                <div className={styles.featuredOverlay} />
              </div>
              <div className={styles.featuredContent}>
                <span className={`badge badge-primary`}>{featured[0]?.category}</span>
                <h3 className={styles.featuredTitle}>{featured[0]?.title}</h3>
                <p className={styles.featuredExcerpt}>{featured[0]?.excerpt}</p>
                <div className={styles.featuredMeta}>
                  <Clock size={12} />
                  {featured[0]?.readTime} min read
                </div>
              </div>
            </Link>
          </ScrollReveal>

          {/* Right: smaller articles */}
          <div className={styles.sideArticles}>
            {featured.slice(1, 4).map((article, i) => (
              <ScrollReveal key={article.id} delay={150 + i * 100}>
                <Link href={`/learn/${article.slug}`} className={styles.sideArticle}>
                  <div className={styles.sideImage}>
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      style={{objectFit:"cover"}}
                      sizes="20vw"
                    />
                  </div>
                  <div className={styles.sideContent}>
                    <span className={`badge ${
                      article.category === "Financial Aid" ? "badge-primary" :
                      article.category === "International Students" ? "badge-sky" :
                      "badge-lavender"
                    }`}>
                      {article.category}
                    </span>
                    <h3 className={styles.sideTitle}>{article.title}</h3>
                    <div className={styles.sideMeta}>
                      <Clock size={11} />
                      {article.readTime} min read
                    </div>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
