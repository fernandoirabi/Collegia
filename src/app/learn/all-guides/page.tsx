"use client";

import { useMemo, useState } from "react";
import { Search, X, BookOpen } from "lucide-react";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import { guides } from "@/data/guides";
import GuideCard from "@/components/ui/GuideCard";
import type { GuideCategory } from "@/types/guides";
import { getCategoryLabel } from "@/types/guides";
import styles from "./page.module.css";

type CategoryFilter = "all" | GuideCategory;
type DifficultyFilter = "all" | "beginner" | "intermediate" | "advanced";

const CATEGORY_FILTERS: { value: CategoryFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "application", label: getCategoryLabel("application") },
  { value: "financial-aid", label: getCategoryLabel("financial-aid") },
  { value: "essays", label: getCategoryLabel("essays") },
  { value: "international", label: getCategoryLabel("international") },
];

const DIFFICULTY_FILTERS: { value: DifficultyFilter; label: string }[] = [
  { value: "all", label: "Any Level" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export default function AllGuidesPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [difficulty, setDifficulty] = useState<DifficultyFilter>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return guides.filter((guide) => {
      if (category !== "all" && guide.category !== category) return false;
      if (difficulty !== "all" && guide.difficulty !== difficulty) return false;
      if (!q) return true;
      const haystack = [
        guide.title,
        guide.description,
        getCategoryLabel(guide.category),
        ...guide.sections.map((s) => s.title),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [query, category, difficulty]);

  const hasActiveFilters = query.trim() !== "" || category !== "all" || difficulty !== "all";

  const clearAll = () => {
    setQuery("");
    setCategory("all");
    setDifficulty("all");
  };

  return (
    <>
      <Navigation />
      <main className={styles.main}>
        {/* Header */}
        <header className={styles.header}>
          <div className="container">
            <p className={styles.eyebrow}>Learning · Guide Library</p>
            <h1 className={styles.title}>All Guides</h1>
            <p className={styles.sub}>
              Explore Collegia&apos;s complete college admissions knowledge base — application,
              financial aid, essays, and international student guides.
            </p>

            {/* Search */}
            <div className={styles.searchBar}>
              <Search size={20} className={styles.searchIcon} />
              <input
                className={styles.searchInput}
                placeholder="Search guides by title, topic, or category..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search guides"
                id="guide-search-input"
              />
              {query && (
                <button
                  className={styles.clearBtn}
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  type="button"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </header>

        <div className="container" style={{ paddingTop: "var(--space-8)" }}>
          {/* Filters */}
          <div className={styles.filters}>
            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>Category</span>
              <div className={styles.chipRow} role="group" aria-label="Filter by category">
                {CATEGORY_FILTERS.map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    className={`chip ${category === f.value ? "active" : ""}`}
                    onClick={() => setCategory(f.value)}
                    aria-pressed={category === f.value}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>Difficulty</span>
              <div className={styles.chipRow} role="group" aria-label="Filter by difficulty">
                {DIFFICULTY_FILTERS.map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    className={`chip ${difficulty === f.value ? "active" : ""}`}
                    onClick={() => setDifficulty(f.value)}
                    aria-pressed={difficulty === f.value}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results header */}
          <div className={styles.resultsHeader}>
            <p className={styles.resultCount} aria-live="polite">
              <strong>{filtered.length}</strong> guide{filtered.length === 1 ? "" : "s"}
              {hasActiveFilters && query.trim() ? ` matching "${query.trim()}"` : ""}
              {hasActiveFilters && !query.trim() ? " match your filters" : ""}
            </p>
            {hasActiveFilters && (
              <button type="button" className={styles.clearAll} onClick={clearAll}>
                Clear all filters
              </button>
            )}
          </div>

          {/* Grid or empty state */}
          {filtered.length === 0 ? (
            <div className={styles.empty}>
              <BookOpen size={28} className={styles.emptyIcon} />
              <h2 className={styles.emptyTitle}>No guides found</h2>
              <p className={styles.emptyDesc}>
                Try a different search term or clear your filters to browse all {guides.length} guides.
              </p>
              <button type="button" className="btn btn-secondary" onClick={clearAll}>
                Clear Filters
              </button>
            </div>
          ) : (
            <div className={styles.grid}>
              {filtered.map((guide) => (
                <GuideCard key={guide.slug} guide={guide} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
