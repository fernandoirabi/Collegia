import type { Metadata } from "next";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import CollegeCard from "@/components/ui/CollegeCard";
import { searchColleges } from "@/lib/services/college.service";
import { majorOptions, locationOptions, campusSizes } from "@/data";
import { Search, SlidersHorizontal, X } from "lucide-react";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Search Colleges",
  description: "Browse US colleges and universities. Filter by major, location, size, type and more.",
};

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function parseList(value: string | string[] | undefined): string[] {
  if (Array.isArray(value)) return value.flatMap((v) => v.split(",")).filter(Boolean);
  if (typeof value === "string" && value) return value.split(",").filter(Boolean);
  return [];
}

const TYPE_OPTIONS = ["Public", "Private"];

const SIZE_TO_LABEL: Record<string, string> = {
  "Small (Under 5K)": "Small",
  "Medium (5K–15K)": "Medium",
  "Large (15K+)": "Large",
};

export default async function SearchPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const activeMajors = parseList(sp.majors);
  const activeRegions = parseList(sp.regions);
  const activeSizes = parseList(sp.sizes);
  const activeTypes = parseList(sp.types);

  const filtered = await searchColleges({
    q: q || undefined,
    majors: activeMajors.length ? activeMajors : undefined,
    regions: activeRegions.length ? activeRegions : undefined,
    sizes: activeSizes.length
      ? (activeSizes as ("Small" | "Medium" | "Large")[])
      : undefined,
    types: activeTypes.length
      ? (activeTypes as ("Public" | "Private")[])
      : undefined,
  });

  const appliedCount =
    activeMajors.length + activeRegions.length + activeSizes.length + activeTypes.length;

  const base = "/discover/search";
  const buildHref = (param: string, value: string) => {
    const current: Record<string, string> = { q };
    if (activeMajors.length) current.majors = activeMajors.join(",");
    if (activeRegions.length) current.regions = activeRegions.join(",");
    if (activeSizes.length) current.sizes = activeSizes.join(",");
    if (activeTypes.length) current.types = activeTypes.join(",");

    const list = (current[param] ?? "").split(",").filter(Boolean);
    if (list.includes(value)) {
      const next = list.filter((v) => v !== value);
      if (next.length) current[param] = next.join(",");
      else delete current[param];
    } else {
      list.push(value);
      current[param] = list.join(",");
    }
    const params = new URLSearchParams(current);
    const qs = params.toString();
    return qs ? `${base}?${qs}` : base;
  };

  const chipClass = (active: boolean) => `chip ${active ? "active" : ""}`;

  return (
    <>
      <Navigation />
      <main className={styles.main}>
        {/* Search Header */}
        <div className={styles.searchHeader}>
          <div className="container">
            <div style={{paddingTop:"calc(var(--nav-height) + var(--space-10))", paddingBottom:"var(--space-8)"}}>
              <h1 className={styles.title}>Search Colleges</h1>
              <p className={styles.sub}>Browse all US colleges. Filter by what matters most to you.</p>

              <form action="/discover/search" method="get" className={styles.searchBar}>
                <Search size={20} className={styles.searchIcon} />
                <input
                  className={styles.searchInput}
                  placeholder="Search by college name or location..."
                  name="q"
                  defaultValue={q}
                  id="college-search-input"
                />
                {q && (
                  <a href={base} className={styles.clearBtn} aria-label="Clear search">
                    <X size={16} />
                  </a>
                )}
              </form>
            </div>
          </div>
        </div>

        <div className="container">
          <div className={styles.layout}>
            {/* Filters Sidebar */}
            <aside className={styles.sidebar}>
              <div className={styles.filterHeader}>
                <SlidersHorizontal size={16} />
                Filters
              </div>

              <div className={styles.filterGroup}>
                <p className={styles.filterLabel}>Major / Field</p>
                <div className={styles.filterOptions}>
                  {majorOptions.map((m) => (
                    <a
                      key={m}
                      href={buildHref("majors", m)}
                      className={chipClass(activeMajors.includes(m))}
                      id={`filter-major-${m.toLowerCase().replace(/\s/g,"-")}`}
                    >
                      {m}
                    </a>
                  ))}
                </div>
              </div>

              <div className={styles.filterGroup}>
                <p className={styles.filterLabel}>School Type</p>
                <div className={styles.filterOptions}>
                  {TYPE_OPTIONS.map((t) => (
                    <a
                      key={t}
                      href={buildHref("types", t)}
                      className={chipClass(activeTypes.includes(t))}
                    >
                      {t}
                    </a>
                  ))}
                </div>
              </div>

              <div className={styles.filterGroup}>
                <p className={styles.filterLabel}>Location</p>
                <div className={styles.filterOptions}>
                  {locationOptions.map((l) => (
                    <a
                      key={l}
                      href={buildHref("regions", l)}
                      className={chipClass(activeRegions.includes(l))}
                    >
                      {l}
                    </a>
                  ))}
                </div>
              </div>

              <div className={styles.filterGroup}>
                <p className={styles.filterLabel}>Campus Size</p>
                <div className={styles.filterOptions}>
                  {campusSizes.map((s) => {
                    const sizeLabel = SIZE_TO_LABEL[s] ?? "Large";
                    return (
                      <a
                        key={s}
                        href={buildHref("sizes", sizeLabel)}
                        className={chipClass(activeSizes.includes(sizeLabel))}
                      >
                        {s}
                      </a>
                    );
                  })}
                </div>
              </div>

              {appliedCount > 0 && (
                <a href={base} className="btn btn-secondary btn-sm" style={{width:"100%", justifyContent:"center"}}>
                  Clear All Filters
                </a>
              )}
            </aside>

            {/* Results */}
            <div className={styles.results}>
              <div className={styles.resultsHeader}>
                <p className={styles.resultCount}>
                  Showing <strong>{filtered.length}</strong> colleges
                  {appliedCount > 0 && ` · ${appliedCount} filter${appliedCount > 1 ? "s" : ""} applied`}
                </p>
              </div>

              {filtered.length === 0 ? (
                <div className={styles.empty}>
                  <p>No colleges found for &ldquo;{q || "your filters"}&rdquo;</p>
                  <a href={base} className="btn btn-secondary">Clear Search</a>
                </div>
              ) : (
                <div className={styles.grid}>
                  {filtered.map((college, i) => (
                    <CollegeCard
                      key={college.id}
                      college={college}
                      matchType={i % 3 === 0 ? "Strong Match" : i % 3 === 1 ? "Target" : "Reach"}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}