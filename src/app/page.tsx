import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import ProblemSection from "@/components/sections/ProblemSection";
import MatchPreview from "@/components/sections/MatchPreview";
import ImprovementSection from "@/components/sections/ImprovementSection";
import CollegeExplorer from "@/components/sections/CollegeExplorer";
import JourneyPreview from "@/components/sections/JourneyPreview";
import LearnSection from "@/components/sections/LearnSection";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import styles from "./page.module.css";

export default function HomePage() {
  return (
    <>
      <Navigation />
      <main>
        <Hero />
        <ProblemSection />
        <MatchPreview />
        <ImprovementSection />
        <CollegeExplorer />
        <JourneyPreview />
        <LearnSection />

        {/* Bottom CTA Banner */}
        <section className={styles.ctaBanner}>
          <div className="container">
            <div className={styles.ctaInner}>
              <div className={styles.ctaText}>
                <p className="label" style={{color:"rgba(255,255,255,0.4)", marginBottom:"var(--space-4)"}}>
                  Ready to start?
                </p>
                <h2 className={styles.ctaHeadline}>
                  Navigate your future.<br />
                  <em>Start today.</em>
                </h2>
                <p className={styles.ctaSub}>
                  Join thousands of international students building their path to US universities.
                </p>
              </div>
              <div className={styles.ctaActions}>
                <Link href="/discover/match" className="btn btn-primary btn-lg" id="bottom-cta-match">
                  Find My Colleges
                  <ArrowRight size={18} />
                </Link>
                <Link href="/learn" className="btn btn-outline-white btn-lg" id="bottom-cta-learn">
                  Learn More
                </Link>
                <p className={styles.ctaNote}>Free to get started. No credit card required.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
