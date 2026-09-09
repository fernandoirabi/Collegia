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
    acceptanceRate: number | null;
    avgGPA: number | null;
    satRange: [number | null, number | null];
    actRange: [number | null, number | null];
    applicationDeadline: string;
    earlyDecisionDeadline?: string;
  };
  academics: {
    ranking?: number;
    strongPrograms: string[];
    graduationRate: number | null;
    studentFacultyRatio: string;
  };
  cost: {
    tuitionInternational: number | null;
    roomAndBoard: number | null;
    totalCost: number | null;
  };
  financial: {
    meetsFullNeed: boolean;
    internationalAid: boolean;
    avgAidAmount?: number;
  };
  international: {
    internationalPercentage: number | null;
    countriesRepresented: number | null;
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
  isDemoData: boolean;
  verificationStatus: "DEMO" | "UNVERIFIED" | "PENDING_VERIFICATION" | "VERIFIED";
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
