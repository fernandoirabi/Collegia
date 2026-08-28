export type GuideCategory = 
  | "application"
  | "financial-aid"
  | "essays"
  | "international";

export interface GuideSection {
  id: string;
  title: string;
  content: string;
  checklist?: string[];
}

export interface RelatedGuide {
  slug: string;
  title: string;
  category: GuideCategory;
}

export interface GuideCTA {
  label: string;
  href: string;
  description?: string;
}

export interface Guide {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: GuideCategory;
  readTime: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  sections: GuideSection[];
  takeaways?: string[];
  relatedGuides: RelatedGuide[];
  cta?: GuideCTA;
  featured?: boolean;
  publishDate: string;
  lastUpdated: string;
}

export const GUIDE_CATEGORIES: Record<GuideCategory, { label: string; description: string; icon: string }> = {
  application: {
    label: "Application",
    description: "Step-by-step guides for the college application process",
    icon: "GraduationCap",
  },
  "financial-aid": {
    label: "Financial Aid",
    description: "Understanding costs, aid, scholarships, and comparing offers",
    icon: "DollarSign",
  },
  essays: {
    label: "Essays",
    description: "Writing compelling personal statements and supplemental essays",
    icon: "FileText",
  },
  international: {
    label: "International Students",
    description: "Specific guidance for international applicants",
    icon: "Globe",
  },
};

export function getCategoryLabel(category: GuideCategory): string {
  return GUIDE_CATEGORIES[category].label;
}

export function getCategoryDescription(category: GuideCategory): string {
  return GUIDE_CATEGORIES[category].description;
}