import type { Metadata } from "next";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { ArrowLeft, Target, CheckCircle2, Circle } from "lucide-react";
import { getGoals } from "@/lib/services/goals.service";
import AddGoalButton from "@/components/goals/AddGoalButton";
import GoalCardActions from "@/components/goals/GoalCardActions";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "My Goals",
  description: "Track your improvement goals for your college applications.",
};

export const dynamic = "force-dynamic";

export default async function JourneyGoalsPage() {
  const goals = await getGoals();
  const activeGoals = goals.filter(g => !g.completed);
  const completedGoals = goals.filter(g => g.completed);

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
                <h1 className={styles.title}>My Goals</h1>
                <p className={styles.sub}>Track what you are building toward.</p>
              </div>
              <AddGoalButton />
            </div>
          </div>
        </div>

        <div className="container" style={{paddingTop: "var(--space-8)"}}>
          
          <h2 className={styles.sectionTitle}>Active Goals</h2>
          <div className={styles.goalsGrid}>
            {activeGoals.map((goal) => (
              <div key={goal.id} className={styles.goalCard}>
                <div className={styles.goalHeader}>
                  <div className={styles.goalIcon}>
                    <Target size={20} color="var(--color-primary)" />
                  </div>
                  <div className={styles.goalMeta}>
                    <span className={`badge ${goal.priority === "High" ? "badge-reach" : "badge-target"}`}>
                      {goal.priority} Priority
                    </span>
                    <span className={styles.category}>{goal.category}</span>
                  </div>
                </div>
                
                <h3 className={styles.goalTitle}>{goal.title}</h3>
                <p className={styles.goalDesc}>{goal.description}</p>
                
                <div className={styles.progressArea}>
                  <div className={styles.progressLabels}>
                    <span className={styles.current}>{goal.current ?? "—"}</span>
                    <span className={styles.target}>Target: {goal.target ?? "—"}{goal.unit ? ` ${goal.unit}` : ""}</span>
                  </div>
                  <div className="progress-bar-track" style={{height: "8px"}}>
                    <div className="progress-bar-fill" style={{width: `${goal.progress}%`}} />
                  </div>
                </div>
                
                <div className={styles.goalFooter}>
                  <GoalCardActions goal={goal} />
                </div>
              </div>
            ))}
          </div>

          {completedGoals.length > 0 && (
            <>
              <h2 className={styles.sectionTitle} style={{marginTop: "var(--space-16)"}}>Completed Goals</h2>
              <div className={styles.completedList}>
                {completedGoals.map((goal) => (
                  <div key={goal.id} className={styles.completedRow}>
                    <CheckCircle2 size={20} color="var(--color-green)" />
                    <span className={styles.completedTitle}>{goal.title}</span>
                    <span className={styles.completedMeta}>Achieved {goal.target ?? "—"}{goal.unit ? ` ${goal.unit}` : ""}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {completedGoals.length === 0 && (
            <div className={styles.emptyCompleted}>
              <Circle size={24} color="var(--color-ink-faint)" style={{marginBottom: "var(--space-2)"}} />
              <p>Completed goals will appear here.</p>
            </div>
          )}

        </div>
      </main>
      <Footer />
    </>
  );
}
