import type { MatchView } from "@/lib/services/match-score.service";
import styles from "./MatchPanel.module.css";

interface RecommendationItem {
  category: string;
  title: string;
  description: string;
  suggestedAction: string;
  potentialImpact: number;
}

interface MatchPanelProps {
  match: MatchView;
  recommendations: RecommendationItem[];
}

function classificationBadge(classification: string): string {
  if (classification === "STRONG_MATCH") return "badge-strong";
  if (classification === "TARGET") return "badge-target";
  return "badge-reach";
}

export default function MatchPanel({ match, recommendations }: MatchPanelProps) {
  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Your Collegia Match</h2>
          <p className={styles.subtitle}>
            Based on your profile and this college&apos;s published data. Fit, not admission odds.
          </p>
        </div>
        {match.isDemo && <span className={`badge badge-sky`}>Demo</span>}
      </div>

      <div className={styles.scoreRow}>
        <div className={styles.scoreBlock}>
          <span className={styles.scoreValue}>{match.score}</span>
          <span className={styles.scoreLabel}>Collegia Match</span>
        </div>
        <div className={styles.classification}>
          <span className={`badge ${classificationBadge(match.classification)}`}>{match.classificationLabel}</span>
          <span className={styles.engineTag}>v{match.engineVersion}</span>
        </div>
      </div>

      <p className={styles.disclaimer}>
        This score measures how well this college fits your profile. It is not a chance of admission.
      </p>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Why this match</h3>
        <div className={styles.dimList}>
          {match.dimensions.map((d) => (
            <div key={d.dimension} className={styles.dimRow}>
              <div className={styles.dimTop}>
                <span className={styles.dimLabel}>{d.label}</span>
                <span className={styles.dimMeta}>
                  <span className={styles.dimScore}>{d.score}</span>
                  <span className={`badge ${d.confidence === "HIGH" ? "badge-strong" : d.confidence === "MEDIUM" ? "badge-target" : "badge-reach"}`}>
                    {d.confidence.toLowerCase()}
                  </span>
                </span>
              </div>
              {d.reasons.length > 0 && (
                <ul className={styles.reasons}>
                  {d.reasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>

      {recommendations.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>What should I improve</h3>
          <div className={styles.recList}>
            {recommendations.map((r) => (
              <div key={r.title} className={styles.recRow}>
                <div className={styles.recHeader}>
                  <span className={styles.recTitle}>{r.title}</span>
                  {r.potentialImpact > 0 && (
                    <span className={styles.recImpact}>+{r.potentialImpact} Match</span>
                  )}
                </div>
                <p className={styles.recDesc}>{r.description}</p>
                <p className={styles.recAction}>{r.suggestedAction}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}