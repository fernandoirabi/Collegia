import Link from "next/link";
import Image from "next/image";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { MapPin, ArrowRight } from "lucide-react";
import { colleges } from "@/data";
import styles from "./CollegeExplorer.module.css";

const filters = ["Engineering", "Business", "Medicine", "Arts", "Computer Science", "Law"];

export default function CollegeExplorer() {
  const featured = colleges.filter((c) => c.featured).slice(0, 4);

  return (
    <section className={styles.section}>
      <div className="container">
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <ScrollReveal>
              <p className="label text-primary" style={{marginBottom:"var(--space-4)"}}>Discover</p>
              <h2 className="headline-lg">Explore your<br />possibilities.</h2>
            </ScrollReveal>
          </div>
          <div className={styles.headerRight}>
            <ScrollReveal delay={150}>
              <p className={styles.headerDesc}>
                Over 4,000 colleges across the United States. Filter by
                major, location, cost, campus life, and more. Every school has
                a place for the right student.
              </p>
              <div className={styles.filterRow}>
                {filters.map((f, i) => (
                  <button key={f} className={`chip ${i === 0 ? "active" : ""}`} id={`filter-${f.toLowerCase().replace(/\s/g,"-")}`}>
                    {f}
                  </button>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </div>

        {/* College Grid — asymmetric editorial layout */}
        <div className={styles.grid}>
          {/* Large featured card */}
          <ScrollReveal delay={100} className={styles.largeCard}>
            <Link href={`/college/${featured[0]?.slug}`} className={styles.largeCardInner}>
              <div className={styles.largeCardImage}>
                <Image
                  src={featured[0]?.image || "/images/campus_boston.jpg"}
                  alt={`${featured[0]?.name} campus`}
                  fill
                  style={{objectFit:"cover"}}
                  sizes="(max-width: 768px) 100vw, 55vw"
                />
                <div className={styles.largeOverlay} />
              </div>
              <div className={styles.largeCardContent}>
                <span className="badge badge-strong">
                  <span className={styles.dotGreen} />
                  Strong Match
                </span>
                <div>
                  <h3 className={styles.largeName}>{featured[0]?.name}</h3>
                  <p className={styles.largeLocation}>
                    <MapPin size={13} />
                    {featured[0]?.location.city}, {featured[0]?.location.stateCode}
                  </p>
                </div>
                <div className={styles.largeStats}>
                  <div className={styles.largeStat}>
                    <span>{featured[0]?.admissions.acceptanceRate}%</span>
                    <span>Accept.</span>
                  </div>
                  <div className={styles.largeStatDivider} />
                  <div className={styles.largeStat}>
                    <span>${(featured[0]?.cost.tuitionInternational / 1000).toFixed(0)}K</span>
                    <span>Tuition</span>
                  </div>
                  <div className={styles.largeStatDivider} />
                  <div className={styles.largeStat}>
                    <span>{featured[0]?.international.internationalPercentage}%</span>
                    <span>Intl.</span>
                  </div>
                </div>
              </div>
            </Link>
          </ScrollReveal>

          {/* Right column: 3 smaller cards */}
          <div className={styles.rightCol}>
            {featured.slice(1, 4).map((college, i) => (
              <ScrollReveal key={college.id} delay={200 + i * 100}>
                <Link href={`/college/${college.slug}`} className={styles.smallCard}>
                  <div className={styles.smallCardImage}>
                    <Image
                      src={college.image}
                      alt={`${college.name} campus`}
                      fill
                      style={{objectFit:"cover"}}
                      sizes="(max-width: 768px) 100vw, 40vw"
                    />
                    <div className={styles.smallOverlay} />
                  </div>
                  <div className={styles.smallContent}>
                    <div>
                      <h3 className={styles.smallName}>{college.name}</h3>
                      <p className={styles.smallLocation}>
                        <MapPin size={11} />
                        {college.location.city}, {college.location.stateCode}
                      </p>
                    </div>
                    <div className={styles.smallFooter}>
                      <span className={`badge ${i === 0 ? "badge-target" : "badge-reach"}`}>
                        {i === 0 ? "Target" : "Reach"}
                      </span>
                      <span className={styles.smallStat}>
                        {college.admissions.acceptanceRate}% accept.
                      </span>
                    </div>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>

        {/* CTA */}
        <ScrollReveal>
          <div className={styles.cta}>
            <p className={styles.ctaText}>
              Explore all colleges — filter by major, cost, location, and more.
            </p>
            <Link href="/discover/search" className="btn btn-primary" id="explorer-cta">
              Browse All Colleges
              <ArrowRight size={15} />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
