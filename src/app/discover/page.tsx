import type { Metadata } from "next";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Search, SlidersHorizontal } from "lucide-react";
import { getFeaturedColleges } from "@/lib/services/college.service";
import CollegeCard from "@/components/ui/CollegeCard";
import ScrollReveal from "@/components/ui/ScrollReveal";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Discover Colleges",
  description: "Explore thousands of US colleges and universities. Find the right fit for your academic profile, budget, location and goals.",
};

export const dynamic = "force-dynamic";

export default async function DiscoverPage() {
  const featuredColleges = await getFeaturedColleges(4);

  return (
    <>
      <Navigation />
      <main>
        {/* Hero */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <p className="label" style={{color:"var(--color-primary)", marginBottom:"var(--space-4)"}}>Discover</p>
            <h1 className="headline-xl">Find your place<br /><em>in America.</em></h1>
            <p className={styles.heroSub}>
              4,000+ colleges. Filter by major, cost, location, size, and more.
              Every student belongs somewhere.
            </p>

            <div className={styles.heroActions}>
              <Link href="/discover/match" className="btn btn-primary btn-lg" id="discover-match-cta">
                <SlidersHorizontal size={17} />
                Get My Match
              </Link>
              <Link href="/discover/search" className="btn btn-secondary btn-lg" id="discover-search-cta">
                <Search size={17} />
                Search Colleges
              </Link>
            </div>
          </div>

          {/* Background images mosaic */}
          <div className={styles.mosaicGrid} aria-hidden="true">
            {["/images/campus_boston.jpg", "/images/campus_florida.jpg", "/images/campus_nyc.jpg", "/images/campus_california.jpg"].map((src, i) => (
              <div key={i} className={styles.mosaicCell}>
                <Image src={src} alt="" fill style={{objectFit:"cover"}} />
              </div>
            ))}
            <div className={styles.mosaicOverlay} />
          </div>
        </section>

        {/* How it works */}
        <section className="section" style={{background:"var(--color-bg)"}}>
          <div className="container">
            <ScrollReveal>
              <h2 className="headline-md" style={{marginBottom:"var(--space-12)", textAlign:"center"}}>
                Two ways to discover
              </h2>
            </ScrollReveal>
            <div className={styles.pathGrid}>
              <ScrollReveal delay={100}>
                <Link href="/discover/match" className={styles.pathCard} id="path-match">
                  <div className={styles.pathIcon} style={{background:"var(--color-primary-light)"}}>
                    <SlidersHorizontal size={28} color="var(--color-primary)" />
                  </div>
                  <h3 className={styles.pathTitle}>College Match</h3>
                  <p className={styles.pathDesc}>
                    Tell us about your academic profile, goals and preferences.
                    We&apos;ll show you colleges that fit — organized by Strong Match,
                    Target, and Reach.
                  </p>
                  <span className="btn btn-primary btn-sm">
                    Start Matching
                    <ArrowRight size={14} />
                  </span>
                </Link>
              </ScrollReveal>

              <ScrollReveal delay={200}>
                <Link href="/discover/search" className={styles.pathCard} id="path-search">
                  <div className={styles.pathIcon} style={{background:"var(--color-green-light)"}}>
                    <Search size={28} color="var(--color-green)" />
                  </div>
                  <h3 className={styles.pathTitle}>Search & Filter</h3>
                  <p className={styles.pathDesc}>
                    Browse the full database of US colleges. Filter by major, state,
                    acceptance rate, cost, international student percentage, and more.
                  </p>
                  <span className="btn btn-secondary btn-sm">
                    Browse Colleges
                    <ArrowRight size={14} />
                  </span>
                </Link>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Featured Colleges */}
        <section className="section" style={{background:"var(--color-surface-alt)", borderTop:"1px solid var(--color-border)"}}>
          <div className="container">
            <ScrollReveal>
              <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"var(--space-10)"}}>
                <h2 className="headline-md">Featured Colleges</h2>
                <Link href="/discover/search" className="btn btn-secondary btn-sm">
                  View All
                  <ArrowRight size={14} />
                </Link>
              </div>
            </ScrollReveal>

            <div className={styles.collegeGrid}>
              {featuredColleges.map((college, i) => (
                <ScrollReveal key={college.id} delay={i * 80}>
                  <CollegeCard
                    college={college}
                    matchType={i === 0 ? "Strong Match" : i === 1 ? "Target" : i === 2 ? "Reach" : "Target"}
                  />
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
