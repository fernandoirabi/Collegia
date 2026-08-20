import type { Metadata } from "next";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { ArrowLeft, Search, Bookmark } from "lucide-react";
import { getSavedColleges } from "@/lib/services/saved-college.service";
import { analyzeCollegeList } from "@/lib/services/college-list.service";
import SavedCollegesList from "@/components/colleges/SavedCollegesList";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "My Colleges",
  description: "Manage your saved colleges and track application deadlines.",
};

export const dynamic = "force-dynamic";

export default async function JourneyCollegesPage() {
  const [saved, listAnalysis] = await Promise.all([
    getSavedColleges(),
    analyzeCollegeList(),
  ]);

  return (
    <>
      <Navigation />
      <main className={styles.main}>
        <div className={styles.header}>
          <div className="container">
            <Link href="/journey" className={styles.backLink}>
              <ArrowLeft size={16} /> Back to Dashboard
            </Link>
            <div className={styles.headerInner}>
              <div>
                <h1 className={styles.title}>My Colleges</h1>
                <p className={styles.sub}>Track and manage your saved college list.</p>
              </div>
              <div className={styles.actions}>
                <Link href="/discover/search" className="btn btn-secondary">
                  <Search size={16} /> Search Colleges
                </Link>
                <Link href="/discover/match" className="btn btn-primary">
                  <Bookmark size={16} /> Find More Matches
                </Link>
              </div>
            </div>
          </div>
        </div>

        {listAnalysis.counts.total > 0 && (
          <div className={`container`}>
            <div className={`${styles.balanceBanner} ${listAnalysis.balance === "reach_heavy" ? styles.balanceWarn : ""}`}>
              <p className={styles.balanceTitle}>Your List Balance</p>
              <p className={styles.balanceText}>
                <strong>{listAnalysis.counts.strongMatch}</strong> Strong Match ·{" "}
                <strong>{listAnalysis.counts.target}</strong> Target ·{" "}
                <strong>{listAnalysis.counts.reach}</strong> Reach
              </p>
              <p className={styles.balanceMsg}>{listAnalysis.message}</p>
            </div>
          </div>
        )}

        <SavedCollegesList saved={saved} />
      </main>
      <Footer />
    </>
  );
}