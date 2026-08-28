import type { Metadata } from "next";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { CheckCircle2, Circle, Clock, ArrowRight, Target, Bookmark, Sparkles } from "lucide-react";
import { journeySteps, demoStudent } from "@/data";
import { getStudentProfile } from "@/lib/services/profile.service";
import { getSavedColleges } from "@/lib/services/saved-college.service";
import { getGoals } from "@/lib/services/goals.service";
import { analyzeCollegeList } from "@/lib/services/college-list.service";
import { getRecommendations } from "@/lib/services/recommendation.service";
import RecommendationsCard from "@/components/recommendations/RecommendationsCard";
import { matchLabelForClassification } from "@/lib/services/match.service";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "My Journey",
  description: "Track your college application journey, goals, and saved colleges.",
};

export const dynamic = "force-dynamic";

export default async function JourneyPage() {
  const [profile, savedColleges, goals, listAnalysis, recommendations] = await Promise.all([
    getStudentProfile(),
    getSavedColleges(),
    getGoals(),
    analyzeCollegeList(),
    getRecommendations(),
  ]);
  const firstName = profile?.firstName ?? demoStudent.name.split(" ")[0];
  const savedCollegesView = savedColleges.slice(0, 3);
  const activeGoals = goals.filter(g => !g.completed);
  
  return (
    <>
      <Navigation />
      <main className={styles.main}>
        {/* Dashboard Header */}
        <div className={styles.header}>
          <div className="container">
            <div className={styles.headerInner}>
              <div className={styles.headerText}>
                <div className={styles.greetingRow}>
                  <h1 className={styles.title}>Welcome back, {firstName}</h1>
                  <span className={styles.badge}><Sparkles size={14}/> Demo Profile</span>
                </div>
                <p className={styles.sub}>
                  You are making great progress. Your next deadline is in 47 days.
                </p>
              </div>
              
              <div className={styles.quickStats}>
                <div className={styles.qStat}>
                  <span className={styles.qStatVal}>{savedCollegesView.length}</span>
                  <span className={styles.qStatLbl}>Colleges</span>
                </div>
                <div className={styles.qStatDivider} />
                <div className={styles.qStat}>
                  <span className={styles.qStatVal}>{activeGoals.length}</span>
                  <span className={styles.qStatLbl}>Active Goals</span>
                </div>
                <div className={styles.qStatDivider} />
                <div className={styles.qStat}>
                  <span className={styles.qStatVal}>64%</span>
                  <span className={styles.qStatLbl}>Progress</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container">
          <div className={styles.layout}>
            
            {/* Left Column: Timeline & Goals */}
            <div className={styles.mainCol}>
              {/* Next Step Banner */}
              <div className={styles.nextStepBanner}>
                <div className={styles.nextStepIcon}>!</div>
                <div className={styles.nextStepText}>
                  <p className={styles.nextStepLabel}>Action Required</p>
                  <p className={styles.nextStepTitle}>Draft your personal statement</p>
                </div>
                <Link href="/learn/personal-statement" className="btn btn-outline-white btn-sm" style={{marginLeft: "auto"}}>
                  Read Guide
                </Link>
              </div>

              {/* Application Timeline */}
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.cardTitle}>Application Timeline</h2>
                  <span className={styles.cardMeta}>64% Complete</span>
                </div>
                <div className={styles.timeline}>
                  {journeySteps.map((step, i) => (
                    <div key={step.id} className={styles.step}>
                      <div className={styles.stepLeft}>
                        {step.status === "complete" ? (
                          <CheckCircle2 size={24} color="var(--color-green)" />
                        ) : step.status === "in-progress" ? (
                          <Clock size={24} color="var(--color-primary)" />
                        ) : (
                          <Circle size={24} color="var(--color-border)" />
                        )}
                        {i < journeySteps.length - 1 && (
                          <div className={`${styles.connector} ${step.status === "complete" ? styles.connectorDone : ""}`} />
                        )}
                      </div>
                      <div className={styles.stepRight}>
                        <p className={`${styles.stepTitle} ${step.status === "complete" ? styles.textDone : ""}`}>
                          {step.title}
                        </p>
                        <p className={styles.stepDate}>
                          {step.status === "complete" ? `Completed ${step.completedAt}` : `Due ${step.dueDate}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Goals Preview */}
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.cardTitle}>Active Goals</h2>
                  <Link href="/journey/goals" className={styles.linkText}>View All <ArrowRight size={14} /></Link>
                </div>
                <div className={styles.goalsList}>
                  {activeGoals.slice(0, 2).map((goal) => (
                    <div key={goal.id} className={styles.goalRow}>
                      <div className={styles.goalIcon}>
                        <Target size={18} color="var(--color-primary)" />
                      </div>
                      <div className={styles.goalInfo}>
                        <p className={styles.goalTitle}>{goal.title}</p>
                        <div className="progress-bar-track" style={{marginTop: "8px", height: "6px"}}>
                          <div className="progress-bar-fill" style={{width: `${goal.progress}%`}} />
                        </div>
                      </div>
                      <div className={styles.goalMeta}>
                        <span className={styles.goalProgress}>{goal.current} / {goal.target}</span>
                        <span className={styles.goalUnit}>{goal.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Improvements */}
              <RecommendationsCard recommendations={recommendations} />
            </div>

            {/* Right Column: Colleges */}
            <div className={styles.sideCol}>
              <div className={styles.card} style={{height: "100%"}}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.cardTitle}>My Colleges</h2>
                  <Link href="/journey/colleges" className={styles.linkText}>View List <ArrowRight size={14} /></Link>
                </div>
                {listAnalysis.counts.total > 0 && (
                  <p className={styles.listBalance}>
                    <strong>{listAnalysis.counts.strongMatch}</strong> Strong Match ·{" "}
                    <strong>{listAnalysis.counts.target}</strong> Target ·{" "}
                    <strong>{listAnalysis.counts.reach}</strong> Reach
                    <span className={styles.listBalanceMsg}> {listAnalysis.message}</span>
                  </p>
                )}
                <div className={styles.collegeList}>
                  {savedCollegesView.map((s) => {
                    const college = s.college;
                    const label = s.matchClassification ? matchLabelForClassification(s.matchClassification) : undefined;
                    return (
                      <div key={college.id} className={styles.miniCollege}>
                        <div className={styles.miniCollegeHeader}>
                          <p className={styles.miniCollegeName}>{college.name}</p>
                          <Bookmark size={16} color="var(--color-primary)" fill="var(--color-primary-light)" />
                        </div>
                        <div className={styles.miniCollegeTags}>
                          {label && <span className={`badge ${label === "Strong Match" ? "badge-strong" : label === "Target" ? "badge-target" : "badge-reach"}`}>{label}</span>}
                          <span className={styles.deadlineTag}>Due {college.admissions.applicationDeadline}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Link href="/discover/match" className="btn btn-secondary" style={{width: "100%", justifyContent: "center", marginTop: "var(--space-6)"}}>
                  Find More Colleges
                </Link>
              </div>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
