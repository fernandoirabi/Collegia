import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import SaveCollegeButton from "@/components/ui/SaveCollegeButton";
import MatchPanel from "@/components/match/MatchPanel";
import MatchHistoryPanel from "@/components/match/MatchHistoryPanel";
import { getCollegeBySlug } from "@/lib/services/college.service";
import { getMatchView, getMatchHistory } from "@/lib/services/match-score.service";
import { getRecommendationsForCollege } from "@/lib/services/recommendation.service";
import { MapPin, BarChart2, Sparkles, Globe, Users, GraduationCap } from "lucide-react";
import styles from "./page.module.css";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const college = await getCollegeBySlug(slug);
  if (!college) return {};
  return {
    title: college.name,
    description: `${college.name} — located in ${college.location.city}, ${college.location.state}. Explore admissions, academics, cost, and international student information.`,
  };
}

const tabs = ["Overview", "Admissions", "Academics", "Cost", "Financial Aid", "International", "Student Life", "Deadlines"];

export default async function CollegeProfilePage({ params }: Props) {
  const { slug } = await params;
  const college = await getCollegeBySlug(slug);
  if (!college) notFound();

  const [match, recommendations, history] = await Promise.all([
    getMatchView(college.id),
    getRecommendationsForCollege(college.id),
    getMatchHistory(college.id),
  ]);

  return (
    <>
      <Navigation />
      <main>
        {/* Hero */}
        <div className={styles.hero}>
          <div className={styles.heroImage}>
            <Image
              src={college.image}
              alt={`${college.name} campus`}
              fill
              style={{ objectFit: "cover", objectPosition: "center 40%" }}
              priority
              sizes="100vw"
            />
            <div className={styles.heroOverlay} />
          </div>

          <div className={`container ${styles.heroContent}`}>
            <div className={styles.heroTop}>
              <div className={styles.breadcrumb}>
                <Link href="/discover">Discover</Link>
                <span>/</span>
                <span>{college.name}</span>
              </div>

              <div className={styles.heroActions}>
                <SaveCollegeButton collegeId={college.id} />
                <button className="btn btn-ghost btn-sm" id={`compare-${slug}`}>
                  <BarChart2 size={15} />
                  Compare
                </button>
                <Link href="/discover/match" className="btn btn-primary btn-sm" id={`match-${slug}`}>
                  <Sparkles size={15} />
                  Match With Me
                </Link>
              </div>
            </div>

            <div className={styles.heroBottom}>
              <div>
                <div className={styles.collegeBadges}>
                  <span className="badge badge-primary">{college.type}</span>
                  <span className="badge badge-sky">{college.setting}</span>
                  {college.financial.internationalAid && (
                    <span className="badge badge-strong">Int&apos;l Aid Available</span>
                  )}
                </div>
                <h1 className={styles.collegeName}>{college.name}</h1>
                <p className={styles.collegeLocation}>
                  <MapPin size={14} />
                  {college.location.city}, {college.location.state}
                </p>
              </div>

              {/* Quick stats */}
              <div className={styles.quickStats}>
                <div className={styles.qStat}>
                  <span className={styles.qStatVal}>{college.admissions.acceptanceRate}%</span>
                  <span className={styles.qStatLbl}>Acceptance Rate</span>
                </div>
                <div className={styles.qStatDivider} />
                <div className={styles.qStat}>
                  <span className={styles.qStatVal}>{college.admissions.avgGPA}</span>
                  <span className={styles.qStatLbl}>Avg GPA</span>
                </div>
                <div className={styles.qStatDivider} />
                <div className={styles.qStat}>
                  <span className={styles.qStatVal}>{college.admissions.satRange[0]}–{college.admissions.satRange[1]}</span>
                  <span className={styles.qStatLbl}>SAT Range</span>
                </div>
                <div className={styles.qStatDivider} />
                <div className={styles.qStat}>
                  <span className={styles.qStatVal}>{college.international.internationalPercentage}%</span>
                  <span className={styles.qStatLbl}>International</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab nav */}
        <div className={styles.tabNav}>
          <div className="container">
            <div className={styles.tabs}>
              {tabs.map((tab, i) => (
                <button key={tab} className={`${styles.tab} ${i === 0 ? styles.tabActive : ""}`} id={`tab-${tab.toLowerCase().replace(/\s/g,"-")}`}>
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container section">
          <div className={styles.contentGrid}>
            {/* Main content */}
            <div className={styles.mainCol}>
              {/* Collegia Match */}
              {match && (
                <div className={styles.contentCard} style={{marginBottom: "var(--space-8)"}}>
                  <MatchPanel match={match} recommendations={recommendations} />
                  <MatchHistoryPanel history={history} />
                </div>
              )}

              {/* Overview */}
              <div className={styles.contentCard}>
                <h2 className={styles.cardTitle}>Overview</h2>
                <div className={styles.statGrid}>
                  <div className={styles.statBlock}>
                    <GraduationCap size={20} color="var(--color-primary)" />
                    <div>
                      <p className={styles.statVal}>{college.academics.graduationRate}%</p>
                      <p className={styles.statLbl}>Graduation Rate</p>
                    </div>
                  </div>
                  <div className={styles.statBlock}>
                    <Users size={20} color="var(--color-green)" />
                    <div>
                      <p className={styles.statVal}>{college.academics.studentFacultyRatio}</p>
                      <p className={styles.statLbl}>Student–Faculty Ratio</p>
                    </div>
                  </div>
                  <div className={styles.statBlock}>
                    <Globe size={20} color="var(--color-sky)" />
                    <div>
                      <p className={styles.statVal}>{college.international.countriesRepresented}+</p>
                      <p className={styles.statLbl}>Countries Represented</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Admissions */}
              <div className={styles.contentCard}>
                <h2 className={styles.cardTitle}>Admissions</h2>
                <div className={styles.admissionsGrid}>
                  <div className={styles.adField}>
                    <p className={styles.adLabel}>Acceptance Rate</p>
                    <div className={styles.adBar}>
                      <div className="progress-bar-track">
                        <div className="progress-bar-fill" style={{width:`${college.admissions.acceptanceRate}%`}} />
                      </div>
                      <span className={styles.adVal}>{college.admissions.acceptanceRate}%</span>
                    </div>
                  </div>
                  <div className={styles.adField}>
                    <p className={styles.adLabel}>Average GPA</p>
                    <div className={styles.adBar}>
                      <div className="progress-bar-track">
                        <div className="progress-bar-fill green" style={{width:`${(college.admissions.avgGPA / 4.0) * 100}%`}} />
                      </div>
                      <span className={styles.adVal}>{college.admissions.avgGPA}</span>
                    </div>
                  </div>
                  <div className={styles.adField}>
                    <p className={styles.adLabel}>SAT Middle 50%</p>
                    <p className={styles.adBig}>{college.admissions.satRange[0]}–{college.admissions.satRange[1]}</p>
                  </div>
                  <div className={styles.adField}>
                    <p className={styles.adLabel}>ACT Middle 50%</p>
                    <p className={styles.adBig}>{college.admissions.actRange[0]}–{college.admissions.actRange[1]}</p>
                  </div>
                </div>
                <p className={styles.admissionsNote}>
                  ⚠️ These are typical ranges for admitted students and should not be used to predict your admission outcome.
                </p>
              </div>

              {/* Academics */}
              <div className={styles.contentCard}>
                <h2 className={styles.cardTitle}>Strong Programs</h2>
                <div className={styles.programsList}>
                  {college.academics.strongPrograms.map((p) => (
                    <span key={p} className="chip active">{p}</span>
                  ))}
                </div>
              </div>

              {/* Cost */}
              <div className={styles.contentCard}>
                <h2 className={styles.cardTitle}>Cost (International Students)</h2>
                <div className={styles.costGrid}>
                  <div className={styles.costRow}>
                    <span className={styles.costLabel}>Tuition</span>
                    <span className={styles.costVal}>${college.cost.tuitionInternational.toLocaleString()}/yr</span>
                  </div>
                  <div className={styles.costRow}>
                    <span className={styles.costLabel}>Room & Board</span>
                    <span className={styles.costVal}>${college.cost.roomAndBoard.toLocaleString()}/yr</span>
                  </div>
                  <div className={`${styles.costRow} ${styles.costTotal}`}>
                    <span className={styles.costLabel}>Estimated Total</span>
                    <span className={styles.costVal}>${college.cost.totalCost.toLocaleString()}/yr</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <aside className={styles.sideCol}>
              {/* Quick apply */}
              <div className={styles.applyCard}>
                <div className={styles.applyHeader}>
                  <p className={styles.applyTitle}>Application Deadline</p>
                  <p className={styles.applyDate}>{college.admissions.applicationDeadline}</p>
                </div>
                {college.admissions.earlyDecisionDeadline && (
                  <div className={styles.applyHeader}>
                    <p className={styles.applyTitle}>Early Decision</p>
                    <p className={styles.applyDate}>{college.admissions.earlyDecisionDeadline}</p>
                  </div>
                )}
                <SaveCollegeButton collegeId={college.id} variant="solid" fullWidth />
              </div>

              {/* International */}
              <div className={styles.intlCard}>
                <p className={styles.intlTitle}>International Students</p>
                <div className={styles.intlStats}>
                  <div className={styles.intlStat}>
                    <p className={styles.intlVal}>{college.international.internationalPercentage}%</p>
                    <p className={styles.intlLbl}>International</p>
                  </div>
                  <div className={styles.intlStat}>
                    <p className={styles.intlVal}>{college.international.countriesRepresented}+</p>
                    <p className={styles.intlLbl}>Countries</p>
                  </div>
                </div>
                <div className={styles.intlChecks}>
                  <div className={styles.intlCheck}>
                    <span className={college.financial.internationalAid ? styles.checkYes : styles.checkNo}>
                      {college.financial.internationalAid ? "✓" : "✗"}
                    </span>
                    International Aid Available
                  </div>
                  <div className={styles.intlCheck}>
                    <span className={college.international.i20Support ? styles.checkYes : styles.checkNo}>
                      {college.international.i20Support ? "✓" : "✗"}
                    </span>
                    I-20 Support
                  </div>
                  <div className={styles.intlCheck}>
                    <span className={college.international.optAvailable ? styles.checkYes : styles.checkNo}>
                      {college.international.optAvailable ? "✓" : "✗"}
                    </span>
                    OPT Available
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className={styles.tagsCard}>
                <p className={styles.tagsTitle}>College Tags</p>
                <div className={styles.tagsRow}>
                  {college.tags.map((tag) => (
                    <span key={tag} className="chip">{tag}</span>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
