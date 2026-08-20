"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { createGoalAction } from "@/actions/goals";

const CATEGORIES = [
  { value: "ACADEMIC", label: "Academic" },
  { value: "TESTING", label: "Testing" },
  { value: "EXTRACURRICULAR", label: "Extracurricular" },
  { value: "APPLICATION", label: "Application" },
  { value: "FINANCIAL", label: "Financial" },
] as const;

const PRIORITIES = [
  { value: "HIGH", label: "High" },
  { value: "MEDIUM", label: "Medium" },
  { value: "LOW", label: "Low" },
] as const;

export default function AddGoalButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("");
  const [unit, setUnit] = useState("");
  const [category, setCategory] = useState("ACADEMIC");
  const [priority, setPriority] = useState("MEDIUM");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return (
      <button className="btn btn-primary" onClick={() => setOpen(true)}>
        <Plus size={16} /> Add New Goal
      </button>
    );
  }

  const submit = async () => {
    if (!title.trim()) return;
    setSaving(true);
    setError(null);
    const res = await createGoalAction({
      title: title.trim(),
      targetValue: target ? Number(target) : null,
      unit: unit.trim() || null,
      category,
      priority,
    });
    setSaving(false);
    if (res.ok) {
      setOpen(false);
      setTitle("");
      setTarget("");
      setUnit("");
      router.refresh();
    } else {
      setError(res.error ?? "Unable to create this goal.");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", width: "100%" }}>
      <div className="input-group" style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
        <input
          className="input"
          placeholder="Goal title, e.g. Raise SAT to 1400"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ flex: "1 1 220px" }}
        />
        <input
          className="input"
          type="number"
          placeholder="Target"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          style={{ width: 110 }}
        />
        <input
          className="input"
          placeholder="Unit"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          style={{ width: 110 }}
        />
        <select className="input" value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: 160 }}>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        <select className="input" value={priority} onChange={(e) => setPriority(e.target.value)} style={{ width: 130 }}>
          {PRIORITIES.map((p) => (
            <option key={p.value} value={p.value}>{p.label} Priority</option>
          ))}
        </select>
      </div>
      {error && <p style={{ fontSize: 13, color: "var(--color-coral)" }}>{error}</p>}
      <div style={{ display: "flex", gap: "var(--space-2)" }}>
        <button className="btn btn-primary btn-sm" onClick={submit} disabled={saving || !title.trim()}>
          {saving ? "Adding..." : "Add Goal"}
        </button>
        <button className="btn btn-secondary btn-sm" onClick={() => setOpen(false)}>
          <X size={14} /> Cancel
        </button>
      </div>
    </div>
  );
}