import type { Guide, GuideCategory } from "@/types/guides";
import { applicationGuides } from "./application";
import { financialAidGuides } from "./financial-aid";
import { essayGuides } from "./essays";
import { internationalGuides } from "./international";

// ============================================================
// GUIDE LIBRARY
// Static, typed educational content. No database models.
// ============================================================

export const guides: Guide[] = [
  ...applicationGuides,
  ...financialAidGuides,
  ...essayGuides,
  ...internationalGuides,
];

export function getGuideBySlug(slug: string): Guide | undefined {
  return guides.find((g) => g.slug === slug);
}

export function getCategoryHref(category: GuideCategory): string {
  switch (category) {
    case "application":
      return "/learn/how-to-apply";
    case "financial-aid":
      return "/learn/financial-aid";
    case "essays":
      return "/learn/essays";
    case "international":
      return "/learn/international-students";
  }
}

export function getGuidesByCategory(category: GuideCategory): Guide[] {
  return guides.filter((g) => g.category === category);
}

export function getFeaturedGuides(limit?: number): Guide[] {
  const featured = guides.filter((g) => g.featured);
  const rest = guides.filter((g) => !g.featured);
  const ordered = [...featured, ...rest];
  return limit ? ordered.slice(0, limit) : ordered;
}

export function getRelatedGuides(guide: Guide, limit = 3): Guide[] {
  const bySlug = guide.relatedGuides.map((r) => r.slug);
  const related = bySlug
    .map((slug) => getGuideBySlug(slug))
    .filter((g): g is Guide => Boolean(g));
  if (related.length >= limit) return related.slice(0, limit);
  const sameCategory = guides
    .filter((g) => g.category === guide.category && g.slug !== guide.slug && !bySlug.includes(g.slug))
    .slice(0, limit - related.length);
  return [...related, ...sameCategory];
}
