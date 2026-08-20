"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, CheckCircle2, TrendingUp } from "lucide-react";
import { updateGoalAction, completeGoalAction, deleteGoalAction } from "@/actions/goals";
import type { GoalView } from "@/lib/services/goals.service";

export default function GoalCardActions({ goal }: { goal: GoalView }) {
  const router = useRouter();
  const [logging, setLogging] = useState(false);
  const [value, setValue] = useState(goal.current != null ? String(goal.current) : "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logProgress = async () => {
    const numeric = Number(value);
    if (value === "" || Number.isNaN(numeric) || numeric < 0) return;
    setBusy(true);
    setError(null);
    const res = await updateGoalAction({ id: goal.id, currentValue: numeric });
    setBusy(false);
    if (res.ok) {
      setLogging(false);
      router.refresh();
    } else {
      setError(res.error ?? "Unable to log progress.");
    }
  };

  const complete = async () => {
    setBusy(true);
    setError(null);
    const res = await completeGoalAction({ id: goal.id });
    setBusy(false);
    if (res.ok) router.refresh();
    else setError(res.error ?? "Unable to complete this goal.");
  };

  const remove = async () => {
    setBusy(true);
    setError(null);
    const res = await deleteGoalAction({ id: goal.id });
    setBusy(false);
    if (res.ok) router.refresh();
    else setError(res.error ?? "Unable to delete this goal.");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", marginTop: "var(--space-4)" }}>
      {logging && (
        <div className="input-group" style={{ display: "flex", gap: "var(--space-2)" }}>
          <input
            className="input"
            type="number"
            min={0}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            style={{ flex: 1 }}
            autoFocus
          />
          <button className="btn btn-primary btn-sm" onClick={logProgress} disabled={busy}>
            Save
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => setLogging(false)}>
            Cancel
          </button>
        </div>
      )}
      {error && <p style={{ fontSize: 13, color: "var(--color-coral)" }}>{error}</p>}
      <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
        {!logging && (
          <button
            className="btn btn-outline-white btn-sm"
            style={{ flex: 1, justifyContent: "center" }}
            onClick={() => setLogging(true)}
          >
            <TrendingUp size={14} /> Log Progress
          </button>
        )}
        <button
          className="btn btn-outline-white btn-sm"
          style={{ flex: 1, justifyContent: "center" }}
          onClick={complete}
          disabled={busy}
        >
          <CheckCircle2 size={14} /> Complete
        </button>
        <button
          className="btn btn-outline-white btn-sm"
          style={{ flex: 1, justifyContent: "center" }}
          onClick={remove}
          disabled={busy}
        >
          <Trash2 size={14} /> Delete
        </button>
      </div>
    </div>
  );
}