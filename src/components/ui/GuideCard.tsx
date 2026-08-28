import Link from "next/link";
import { Clock, ArrowUpRight } from "lucide-react";
import type { Guide, GuideCategory } from "@/types/guides";
import { getCategoryLabel } from "@/types/guides";
import styles from "./GuideCard.module.css";

const CATEGORY_BADGE: Record<GuideCategory, string> = {
  application: "badge-primary",
  "financial-aid": "badge-strong",
  essays: "badge-lavender",
  international: "badge-sky",
};

export function categoryBadgeClass(category: GuideCategory): string {
  return CATEGORY_BADGE[category];
}

interface GuideCardProps {
  guide: Guide;
  variant?: "standard" | "featured";
}

export default function GuideCard({ guide, variant = "standard" }: GuideCardProps) {
  const isFeatured = variant === "featured";

  return (
    <Link
      href={`/learn/${guide.slug}`}
      className={`${styles.card} ${isFeatured ? styles.featured : ""}`}
    >
      <div className={styles.topRow}>
        <span className={`badge ${categoryBadgeClass(guide.category)}`}>
          {getCategoryLabel(guide.category)}
        </span>
        <span className={styles.difficulty}>{guide.difficulty}</span>
      </div>

      <h3 className={styles.title}>{guide.title}</h3>
      <p className={styles.description}>{guide.description}</p>

      <div className={styles.footer}>
        <span className={styles.meta}>
          <Clock size={13} />
          {guide.readTime} min read
        </span>
        <span className={styles.linkHint}>
          Read guide
          <ArrowUpRight size={14} />
        </span>
      </div>
    </Link>
  );
}
