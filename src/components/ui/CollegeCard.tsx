import Image from "next/image";
import Link from "next/link";
import { MapPin, TrendingUp, Users } from "lucide-react";
import type { College } from "@/types";
import styles from "./CollegeCard.module.css";

interface CollegeCardProps {
  college: College;
  matchType?: "Strong Match" | "Target" | "Reach";
  matchScore?: number;
  variant?: "default" | "featured" | "compact";
}

const matchConfig = {
  "Strong Match": { cls: "badge-strong", dot: styles.dotGreen, label: "Strong Match" },
  "Target": { cls: "badge-target", dot: styles.dotAmber, label: "Target" },
  "Reach": { cls: "badge-reach", dot: styles.dotCoral, label: "Reach" },
};

export default function CollegeCard({ college, matchType, matchScore, variant = "default" }: CollegeCardProps) {
  const match = matchType ? matchConfig[matchType] : null;
  const badgeText = match ? `${matchScore != null ? `${matchScore} · ` : ""}${match.label}` : null;

  if (variant === "compact") {
    return (
      <Link href={`/college/${college.slug}`} className={styles.compact}>
        <div className={styles.compactImage}>
          <Image src={college.image} alt={college.name} fill style={{objectFit:"cover"}} />
        </div>
        <div className={styles.compactInfo}>
          <h3 className={styles.compactName}>{college.name}</h3>
          <p className={styles.compactLocation}>
            {college.location.city}, {college.location.stateCode}
          </p>
          {match && (
            <span className={`badge ${match.cls}`}>
              <span className={`${styles.dot} ${match.dot}`} />
              {badgeText}
            </span>
          )}
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/college/${college.slug}`} className={`${styles.card} ${variant === "featured" ? styles.featured : ""}`}>
      {/* Image */}
      <div className={styles.imageWrap}>
        <Image
          src={college.image}
          alt={`${college.name} campus`}
          fill
          style={{ objectFit: "cover" }}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className={styles.imageOverlay} />

        {/* Floating match badge */}
        {match && (
          <div className={`badge ${match.cls} ${styles.matchBadge}`}>
            <span className={`${styles.dot} ${match.dot}`} />
            {badgeText}
          </div>
        )}

        {/* College type pill */}
        <div className={styles.typePill}>{college.type}</div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        <div className={styles.header}>
          <div>
            <h3 className={styles.name}>{college.name}</h3>
            <p className={styles.location}>
              <MapPin size={12} />
              {college.location.city}, {college.location.state}
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statVal}>{college.admissions.acceptanceRate}%</span>
            <span className={styles.statLbl}>Acceptance</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statVal}>{college.admissions.avgGPA}</span>
            <span className={styles.statLbl}>Avg GPA</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statVal}>
              {college.admissions.satRange[0]}–{college.admissions.satRange[1]}
            </span>
            <span className={styles.statLbl}>SAT Range</span>
          </div>
        </div>

        {/* Tags */}
        <div className={styles.tags}>
          {college.tags.slice(0, 3).map((tag) => (
            <span key={tag} className={styles.tag}>{tag}</span>
          ))}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <div className={styles.costRow}>
            <TrendingUp size={13} />
            <span>${(college.cost.tuitionInternational / 1000).toFixed(0)}K/yr tuition</span>
          </div>
          {college.financial.internationalAid && (
            <div className={styles.aidBadge}>
              <Users size={11} />
              Aid available
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
