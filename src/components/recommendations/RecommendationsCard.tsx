"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import { updateRecommendationStatusAction } from "@/actions/recommendations";
import type { RecommendationView } from "@/lib/services/recommendation.service";
import styles from "./RecommendationsCard.module.css";

export default function RecommendationsCard({ recommendations }: { recommendations: RecommendationView[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  if (recommendations.length === 0) return null;

  const setStatus = async (id: string, status: "DONE" | "DISMISSED") => {
    setBusyId(id);
    const res = await updateRecommendationStatusAction({ id, status });
    setBusyId(null);
    if (res.ok) router.refresh();
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Recommended Improvements</h2>
          <p className={styles.subtitle}>
            Data-driven ways to strengthen your Collegia Match. Estimated impact only.
          </p>
        </div>
        <Sparkles size={18} color="var(--color-primary)" />
      </div>
      <div className={styles.list}>
        {recommendations.map((r) => (
          <div key={r.id} className={styles.row}>
            <div className={styles.info}>
              <div className={styles.rowTop}>
                <span className={styles.recTitle}>{r.title}</span>
                {r.potentialImpact != null && r.potentialImpact > 0 && (
                  <span className={styles.impact}>+{r.potentialImpact} Match</span>
                )}
              </div>
              {r.description && <p className={styles.desc}>{r.description}</p>}
              {r.suggestedAction && <p className={styles.action}>{r.suggestedAction}</p>}
              {r.collegeName && (
                <p className={styles.college}>For: {r.collegeName}</p>
              )}
            </div>
            <div className={styles.actions}>
              <button className="btn btn-primary btn-sm" onClick={() => setStatus(r.id, "DONE")} disabled={busyId === r.id}>
                <Check size={14} /> Done
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => setStatus(r.id, "DISMISSED")} disabled={busyId === r.id}>
                <X size={14} /> Dismiss
              </button>
            </div>
          </div>
        ))}
      </div>
      <Link href="/journey/goals" className={styles.link}>
        Track as goals <ArrowRight size={14} />
      </Link>
    </div>
  );
}