import type { Metadata } from "next";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import Image from "next/image";
import { Clock, Search, BookOpen, GraduationCap, Globe2, FileText } from "lucide-react";
import { articles } from "@/data";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Learn & Guide",
  description: "Comprehensive guides on US college admissions, financial aid, and visas for international students.",
};

const categories = [
  { id: "all", label: "All Guides", icon: BookOpen },
  { id: "applying", label: "How to Apply", icon: GraduationCap },
  { id: "financial", label: "Financial Aid", icon: Search },
  { id: "essays", label: "Essays", icon: FileText },
  { id: "international", label: "International Students", icon: Globe2 },
];

export default function LearnHubPage() {
  const featured = articles.filter(a => a.featured);
  const regular = articles.filter(a => !a.featured);

  return (
    <>
      <Navigation />
      <main className={styles.main}>
        {/* Header */}
        <div className={styles.header}>
          <div className="container">
            <h1 className={styles.title}>Learn & Guide</h1>
            <p className={styles.sub}>
              Everything you need to navigate US college admissions as an international student.
            </p>
            
            <div className={styles.navBar}>
              {categories.map(cat => {
                const Icon = cat.icon;
                return (
                  <button key={cat.id} className={`${styles.navItem} ${cat.id === "all" ? styles.navActive : ""}`}>
                    <Icon size={16} />
                    {cat.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="container" style={{paddingTop: "var(--space-10)"}}>
          
          {/* Featured Posts */}
          <h2 className={styles.sectionTitle}>Featured Reading</h2>
          <div className={styles.featuredGrid}>
            {featured.slice(0, 2).map((article) => (
              <Link href={`/learn/${article.slug}`} key={article.id} className={styles.featCard}>
                <div className={styles.featImage}>
                  <Image src={article.image} alt={article.title} fill style={{objectFit: "cover"}} />
                  <div className={styles.featOverlay} />
                </div>
                <div className={styles.featContent}>
                  <span className="badge badge-primary">{article.category}</span>
                  <h3 className={styles.featTitle}>{article.title}</h3>
                  <p className={styles.featExcerpt}>{article.excerpt}</p>
                  <div className={styles.featMeta}>
                    <span>{article.publishDate}</span>
                    <span className={styles.dot} />
                    <Clock size={12} /> {article.readTime} min read
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* All Articles */}
          <h2 className={styles.sectionTitle} style={{marginTop: "var(--space-16)"}}>More Guides</h2>
          <div className={styles.articleGrid}>
            {[...featured.slice(2), ...regular].map((article) => (
              <Link href={`/learn/${article.slug}`} key={article.id} className={styles.card}>
                <div className={styles.cardImage}>
                  <Image src={article.image} alt={article.title} fill style={{objectFit: "cover"}} sizes="(max-width: 768px) 100vw, 30vw" />
                </div>
                <div className={styles.cardContent}>
                  <span className={`badge ${
                    article.category === "Financial Aid" ? "badge-primary" :
                    article.category === "International Students" ? "badge-sky" :
                    "badge-lavender"
                  }`}>{article.category}</span>
                  <h3 className={styles.cardTitle}>{article.title}</h3>
                  <div className={styles.cardMeta}>
                    <Clock size={12} /> {article.readTime} min read
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
