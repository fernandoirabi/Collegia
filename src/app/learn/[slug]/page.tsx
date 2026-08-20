import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import { ArrowLeft, Clock, Share2, Bookmark } from "lucide-react";
import { articles } from "@/data";
import styles from "./page.module.css";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = articles.find((a) => a.slug === slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.excerpt,
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = articles.find((a) => a.slug === slug);
  if (!article) notFound();

  // Related articles
  const related = articles.filter(a => a.category === article.category && a.id !== article.id).slice(0, 3);

  return (
    <>
      <Navigation />
      <main className={styles.main}>
        <article className={styles.article}>
          {/* Header */}
          <header className={styles.header}>
            <div className={`container ${styles.headerContainer}`}>
              <Link href="/learn" className={styles.backLink}>
                <ArrowLeft size={16} /> Back to Hub
              </Link>

              <div className={styles.metaRow}>
                <span className="badge badge-primary">{article.category}</span>
                <span className={styles.metaText}>{article.publishDate}</span>
                <span className={styles.dot} />
                <span className={styles.metaText}><Clock size={12} /> {article.readTime} min read</span>
              </div>

              <h1 className={styles.title}>{article.title}</h1>
              <p className={styles.excerpt}>{article.excerpt}</p>
            </div>
          </header>

          {/* Hero Image */}
          <div className="container">
            <div className={styles.heroImage}>
              <Image src={article.image} alt={article.title} fill style={{objectFit: "cover"}} priority sizes="100vw" />
            </div>
          </div>

          {/* Content */}
          <div className={`container ${styles.contentContainer}`}>
            <div className={styles.contentLayout}>
              
              {/* Sidebar actions (sticky) */}
              <aside className={styles.actionsSidebar}>
                <div className={styles.stickyActions}>
                  <button className={styles.actionBtn} aria-label="Share">
                    <Share2 size={20} />
                  </button>
                  <button className={styles.actionBtn} aria-label="Save">
                    <Bookmark size={20} />
                  </button>
                </div>
              </aside>

              {/* Body */}
              <div className={styles.bodyContent}>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt 
                  ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco 
                  laboris nisi ut aliquip ex ea commodo consequat.
                </p>
                <h2>Understanding the Basics</h2>
                <p>
                  Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat 
                  nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui 
                  officia deserunt mollit anim id est laborum.
                </p>
                <blockquote>
                  &quot;The most important thing to remember is that this process takes time. Start early, stay organized, 
                  and don&apos;t be afraid to ask for help.&quot;
                </blockquote>
                <h3>Key Takeaways</h3>
                <ul>
                  <li>Start researching early to understand all requirements</li>
                  <li>Keep track of deadlines in a centralized place</li>
                  <li>Understand the difference between need-blind and need-aware</li>
                  <li>Prepare your financial documentation in advance</li>
                </ul>
                <p>
                  Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque 
                  laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi 
                  architecto beatae vitae dicta sunt explicabo.
                </p>
              </div>

            </div>
          </div>
        </article>

        {/* Related Articles */}
        {related.length > 0 && (
          <section className={styles.relatedSection}>
            <div className="container">
              <h2 className={styles.relatedTitle}>Read Next</h2>
              <div className={styles.relatedGrid}>
                {related.map(rel => (
                  <Link href={`/learn/${rel.slug}`} key={rel.id} className={styles.card}>
                    <div className={styles.cardImage}>
                      <Image src={rel.image} alt={rel.title} fill style={{objectFit: "cover"}} sizes="(max-width: 768px) 100vw, 33vw" />
                    </div>
                    <div className={styles.cardContent}>
                      <h3 className={styles.cardTitle}>{rel.title}</h3>
                      <div className={styles.cardMeta}>
                        <Clock size={12} /> {rel.readTime} min read
                      </div>
                    </div>
                  </Link>
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
