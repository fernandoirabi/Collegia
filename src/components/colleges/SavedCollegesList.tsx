"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import CollegeCard from "@/components/ui/CollegeCard";
import { Search, Trash2, BookmarkPlus } from "lucide-react";
import { removeSavedCollegeAction } from "@/actions/saved-colleges";
import type { SavedCollegeView } from "@/lib/services/saved-college.service";
import { matchLabelForClassification } from "@/lib/services/match.service";
import styles from "@/app/journey/colleges/page.module.css";

type TabFilter = "ALL" | "STRONG_MATCH" | "TARGET" | "REACH";

interface SavedCollegesListProps {
  saved: SavedCollegeView[];
}

export default function SavedCollegesList({ saved }: SavedCollegesListProps) {
  const [tab, setTab] = useState<TabFilter>("ALL");
  const [query, setQuery] = useState("");
  const [removingId, setRemovingId] = useState<string | null>(null);

  const counts = useMemo(() => {
    return {
      ALL: saved.length,
      STRONG_MATCH: saved.filter((s) => s.matchClassification === "STRONG_MATCH").length,
      TARGET: saved.filter((s) => s.matchClassification === "TARGET").length,
      REACH: saved.filter((s) => s.matchClassification === "REACH").length,
    };
  }, [saved]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return saved.filter((s) => {
      if (tab !== "ALL" && s.matchClassification !== tab) return false;
      if (q && !s.college.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [saved, tab, query]);

  const remove = async (collegeId: string) => {
    setRemovingId(collegeId);
    const res = await removeSavedCollegeAction({ collegeId });
    if (res.ok) {
      // The list is server-rendered; refresh data via the client router.
      window.location.reload();
    }
    setRemovingId(null);
  };

  const tabLabel: Record<TabFilter, string> = {
    ALL: "All Saved",
    STRONG_MATCH: "Strong Match",
    TARGET: "Target",
    REACH: "Reach",
  };

  return (
    <>
      <div className={styles.tabs}>
        {(Object.keys(counts) as TabFilter[]).map((t) => (
          <button
            key={t}
            className={`${styles.tab} ${tab === t ? styles.tabActive : ""}`}
            onClick={() => setTab(t)}
          >
            {tabLabel[t]} ({counts[t]})
          </button>
        ))}
      </div>

      <div className="container" style={{paddingTop: "var(--space-8)"}}>
        <div className={styles.controls}>
          <div className={styles.searchBox}>
            <Search size={16} color="var(--color-ink-faint)" />
            <input
              type="text"
              placeholder="Filter by name..."
              className={styles.searchInput}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <span style={{fontSize: 13, color: "var(--color-ink-muted)"}}>
            {visible.length} of {saved.length} saved
          </span>
        </div>

        {saved.length === 0 ? (
          <div className={styles.empty} style={{textAlign: "center", padding: "var(--space-16) 0"}}>
            <BookmarkPlus size={28} color="var(--color-ink-faint)" style={{marginBottom: "var(--space-3)"}} />
            <p style={{fontSize: 16, fontWeight: 600, marginBottom: "var(--space-2)"}}>No saved colleges yet</p>
            <p className="body-sm" style={{color: "var(--color-ink-muted)", marginBottom: "var(--space-6)"}}>
              Explore colleges and save the ones you want to track.
            </p>
            <Link href="/discover/search" className="btn btn-primary">Search Colleges</Link>
          </div>
        ) : visible.length === 0 ? (
          <div className={styles.empty} style={{textAlign: "center", padding: "var(--space-16) 0"}}>
            <p style={{fontSize: 16, fontWeight: 600}}>No colleges match this filter.</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {visible.map((s) => {
              const label = s.matchClassification
                ? matchLabelForClassification(s.matchClassification)
                : undefined;
              return (
                <div key={s.college.id}>
                  <CollegeCard college={s.college} matchType={label} matchScore={s.matchScore ?? undefined} />
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{width: "100%", justifyContent: "center", marginTop: "var(--space-2)"}}
                    onClick={() => remove(s.college.id)}
                    disabled={removingId === s.college.id}
                  >
                    <Trash2 size={14} />
                    {removingId === s.college.id ? "Removing..." : "Remove"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}