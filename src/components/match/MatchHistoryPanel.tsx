import type { MatchHistory } from "@prisma/client";
import { matchLabelForClassification } from "@/lib/services/match.service";
import styles from "./MatchHistoryPanel.module.css";

interface MatchHistoryPanelProps {
  history: Pick<MatchHistory, "id" | "matchScore" | "classification" | "computedAt" | "engineVersion">[];
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function MatchHistoryPanel({ history }: MatchHistoryPanelProps) {
  if (history.length === 0) return null;

  return (
    <div className={styles.panel}>
      <h3 className={styles.title}>Match History</h3>
      <p className={styles.subtitle}>
        Recorded whenever your Collegia Match changes for this college.
      </p>
      <div className={styles.timeline}>
        {history.map((h, i) => (
          <div key={h.id} className={styles.entry}>
            <div className={styles.scoreRow}>
              <span className={styles.score}>{h.matchScore}</span>
              <span className={`badge ${h.classification === "STRONG_MATCH" ? "badge-strong" : h.classification === "TARGET" ? "badge-target" : "badge-reach"}`}>
                {matchLabelForClassification(h.classification)}
              </span>
            </div>
            <span className={styles.date}>
              {formatDate(h.computedAt)} · v{h.engineVersion}
            </span>
            {i < history.length - 1 && <div className={styles.connector}>↓</div>}
          </div>
        ))}
      </div>
    </div>
  );
}