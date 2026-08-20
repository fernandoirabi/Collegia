// ============================================================
// COLLEGIA — Type Definitions
// ============================================================

export interface College {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  location: {
    city: string;
    state: string;
    stateCode: string;
  };
  type: "Public" | "Private";
  size: "Small" | "Medium" | "Large";
  setting: "Urban" | "Suburban" | "Rural";
  admissions: {
    acceptanceRate: number;
    avgGPA: number;
    satRange: [number, number];
    actRange: [number, number];
    applicationDeadline: string;
    earlyDecisionDeadline?: string;
  };
  academics: {
    ranking?: number;
    strongPrograms: string[];
    graduationRate: number;
    studentFacultyRatio: string;
  };
  cost: {
    tuitionInternational: number;
    roomAndBoard: number;
    totalCost: number;
  };
  financial: {
    meetsFullNeed: boolean;
    internationalAid: boolean;
    avgAidAmount?: number;
  };
  international: {
    internationalPercentage: number;
    countriesRepresented: number;
    i20Support: boolean;
    optAvailable: boolean;
  };
  campusLife: {
    housing: string;
    clubs: number;
    sports: string[];
    greekLife: boolean;
  };
  image: string;
  coverImage: string;
  tags: string[];
  featured: boolean;
}

export interface StudentProfile {
  id: string;
  name: string;
  nationality: string;
  gpa: number;
  sat: number;
  act?: number;
  intendedMajor: string;
  budget: number;
  preferredLocation: string[];
  interests: string[];
  extracurriculars: string[];
  targetGPA: number;
  targetSAT: number;
}

export interface CollegeMatch extends College {
  matchType: "Strong Match" | "Target" | "Reach";
  matchScore: number;
  matchReasons: string[];
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: "How to Apply" | "Financial Aid" | "Essays" | "International Students";
  readTime: number;
  image: string;
  publishDate: string;
  featured: boolean;
}

export interface JourneyStep {
  id: string;
  title: string;
  status: "complete" | "in-progress" | "upcoming";
  completedAt?: string;
  dueDate?: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  current: number;
  target: number;
  unit: string;
  category: "Academic" | "Testing" | "Extracurricular" | "Application";
  priority: "High" | "Medium" | "Low";
}
