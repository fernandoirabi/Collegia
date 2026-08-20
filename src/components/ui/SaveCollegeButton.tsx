"use client";

import { useEffect, useState } from "react";
import { Check, Plus } from "lucide-react";
import { isCollegeSavedAction, saveCollegeAction, removeSavedCollegeAction } from "@/actions/saved-colleges";

interface SaveCollegeButtonProps {
  collegeId: string;
  variant?: "ghost" | "solid";
  fullWidth?: boolean;
}

export default function SaveCollegeButton({
  collegeId,
  variant = "ghost",
  fullWidth = false,
}: SaveCollegeButtonProps) {
  const [saved, setSaved] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    isCollegeSavedAction(collegeId).then((res) => {
      if (active) setSaved(Boolean(res.data));
    });
    return () => {
      active = false;
    };
  }, [collegeId]);

  const toggle = async () => {
    if (busy || saved === null) return;
    setBusy(true);
    setError(null);
    const result = saved
      ? await removeSavedCollegeAction({ collegeId })
      : await saveCollegeAction({ collegeId });
    if (result.ok) {
      setSaved(!saved);
    } else {
      setError(result.error ?? "Something went wrong.");
    }
    setBusy(false);
  };

  const className = `btn ${variant === "solid" ? "btn-primary" : "btn-ghost"} btn-sm`;
  const style = fullWidth ? { width: "100%", justifyContent: "center" } : undefined;

  return (
    <span style={{ display: "inline-block" }}>
      <button className={className} onClick={toggle} disabled={busy || saved === null} style={style}>
        {saved ? <Check size={15} /> : <Plus size={15} />}
        {saved ? "Saved" : "Add to My Colleges"}
      </button>
      {error && (
        <span style={{ display: "block", fontSize: 12, color: "var(--color-coral)", marginTop: 6 }}>
          {error}
        </span>
      )}
    </span>
  );
}