import type { College, Article, StudentProfile, JourneyStep, Goal } from "@/types";

// ============================================================
// MOCK COLLEGES
// ============================================================
export const colleges: College[] = [
  {
    id: "1",
    slug: "boston-college",
    name: "Boston College",
    shortName: "BC",
    location: { city: "Chestnut Hill", state: "Massachusetts", stateCode: "MA" },
    type: "Private",
    size: "Medium",
    setting: "Suburban",
    admissions: {
      acceptanceRate: 19,
      avgGPA: 3.9,
      satRange: [1390, 1530],
      actRange: [33, 35],
      applicationDeadline: "January 1",
      earlyDecisionDeadline: "November 1",
    },
    academics: {
      ranking: 35,
      strongPrograms: ["Business", "Engineering", "Nursing", "Philosophy"],
      graduationRate: 92,
      studentFacultyRatio: "13:1",
    },
    cost: {
      tuitionInternational: 62000,
      roomAndBoard: 16800,
      totalCost: 78800,
    },
    financial: {
      meetsFullNeed: true,
      internationalAid: true,
      avgAidAmount: 38000,
    },
    international: {
      internationalPercentage: 12,
      countriesRepresented: 94,
      i20Support: true,
      optAvailable: true,
    },
    campusLife: {
      housing: "Guaranteed 4 years",
      clubs: 230,
      sports: ["Football", "Basketball", "Soccer", "Hockey"],
      greekLife: false,
    },
    image: "/images/campus_boston.jpg",
    coverImage: "/images/campus_boston.jpg",
    tags: ["Research", "Jesuit", "Division I", "Need-Blind"],
    featured: true,
  },
  {
    id: "2",
    slug: "university-of-florida",
    name: "University of Florida",
    shortName: "UF",
    location: { city: "Gainesville", state: "Florida", stateCode: "FL" },
    type: "Public",
    size: "Large",
    setting: "Suburban",
    admissions: {
      acceptanceRate: 24,
      avgGPA: 4.1,
      satRange: [1330, 1490],
      actRange: [30, 34],
      applicationDeadline: "November 1",
    },
    academics: {
      ranking: 28,
      strongPrograms: ["Engineering", "Business", "Agriculture", "Public Health"],
      graduationRate: 88,
      studentFacultyRatio: "17:1",
    },
    cost: {
      tuitionInternational: 28700,
      roomAndBoard: 11000,
      totalCost: 39700,
    },
    financial: {
      meetsFullNeed: false,
      internationalAid: false,
    },
    international: {
      internationalPercentage: 8,
      countriesRepresented: 130,
      i20Support: true,
      optAvailable: true,
    },
    campusLife: {
      housing: "First year guaranteed",
      clubs: 1000,
      sports: ["Football", "Basketball", "Baseball", "Swimming"],
      greekLife: true,
    },
    image: "/images/campus_florida.jpg",
    coverImage: "/images/campus_florida.jpg",
    tags: ["Research University", "SEC", "Division I", "Flagship"],
    featured: true,
  },
  {
    id: "3",
    slug: "new-york-university",
    name: "New York University",
    shortName: "NYU",
    location: { city: "New York", state: "New York", stateCode: "NY" },
    type: "Private",
    size: "Large",
    setting: "Urban",
    admissions: {
      acceptanceRate: 12,
      avgGPA: 3.9,
      satRange: [1370, 1540],
      actRange: [31, 35],
      applicationDeadline: "January 1",
      earlyDecisionDeadline: "November 1",
    },
    academics: {
      ranking: 29,
      strongPrograms: ["Film", "Business", "Arts", "Law", "Medicine"],
      graduationRate: 85,
      studentFacultyRatio: "10:1",
    },
    cost: {
      tuitionInternational: 60000,
      roomAndBoard: 21000,
      totalCost: 81000,
    },
    financial: {
      meetsFullNeed: false,
      internationalAid: true,
      avgAidAmount: 22000,
    },
    international: {
      internationalPercentage: 24,
      countriesRepresented: 138,
      i20Support: true,
      optAvailable: true,
    },
    campusLife: {
      housing: "Available all years",
      clubs: 500,
      sports: ["Basketball", "Fencing", "Swimming", "Tennis"],
      greekLife: false,
    },
    image: "/images/campus_nyc.jpg",
    coverImage: "/images/campus_nyc.jpg",
    tags: ["Global", "Urban", "Arts", "Research"],
    featured: true,
  },
  {
    id: "4",
    slug: "ucla",
    name: "UCLA",
    shortName: "UCLA",
    location: { city: "Los Angeles", state: "California", stateCode: "CA" },
    type: "Public",
    size: "Large",
    setting: "Urban",
    admissions: {
      acceptanceRate: 9,
      avgGPA: 4.2,
      satRange: [1290, 1530],
      actRange: [29, 35],
      applicationDeadline: "November 30",
    },
    academics: {
      ranking: 20,
      strongPrograms: ["Film", "Engineering", "Medicine", "Business", "Arts"],
      graduationRate: 91,
      studentFacultyRatio: "18:1",
    },
    cost: {
      tuitionInternational: 44900,
      roomAndBoard: 18100,
      totalCost: 63000,
    },
    financial: {
      meetsFullNeed: false,
      internationalAid: false,
    },
    international: {
      internationalPercentage: 19,
      countriesRepresented: 140,
      i20Support: true,
      optAvailable: true,
    },
    campusLife: {
      housing: "First year guaranteed",
      clubs: 1000,
      sports: ["Football", "Basketball", "Soccer", "Volleyball"],
      greekLife: true,
    },
    image: "/images/campus_california.jpg",
    coverImage: "/images/campus_california.jpg",
    tags: ["Research", "Public Ivy", "Division I", "PAC-12"],
    featured: true,
  },
  {
    id: "5",
    slug: "university-of-michigan",
    name: "University of Michigan",
    shortName: "UMich",
    location: { city: "Ann Arbor", state: "Michigan", stateCode: "MI" },
    type: "Public",
    size: "Large",
    setting: "Suburban",
    admissions: {
      acceptanceRate: 18,
      avgGPA: 3.9,
      satRange: [1360, 1540],
      actRange: [32, 35],
      applicationDeadline: "February 1",
    },
    academics: {
      ranking: 23,
      strongPrograms: ["Engineering", "Business", "Law", "Medicine", "Public Policy"],
      graduationRate: 93,
      studentFacultyRatio: "15:1",
    },
    cost: {
      tuitionInternational: 55000,
      roomAndBoard: 13000,
      totalCost: 68000,
    },
    financial: {
      meetsFullNeed: false,
      internationalAid: true,
      avgAidAmount: 18000,
    },
    international: {
      internationalPercentage: 16,
      countriesRepresented: 125,
      i20Support: true,
      optAvailable: true,
    },
    campusLife: {
      housing: "First year guaranteed",
      clubs: 1600,
      sports: ["Football", "Basketball", "Swimming", "Hockey"],
      greekLife: true,
    },
    image: "/images/campus_boston.jpg",
    coverImage: "/images/campus_boston.jpg",
    tags: ["Research", "Public Ivy", "Big Ten", "Division I"],
    featured: false,
  },
  {
    id: "6",
    slug: "purdue-university",
    name: "Purdue University",
    shortName: "Purdue",
    location: { city: "West Lafayette", state: "Indiana", stateCode: "IN" },
    type: "Public",
    size: "Large",
    setting: "Suburban",
    admissions: {
      acceptanceRate: 53,
      avgGPA: 3.7,
      satRange: [1210, 1440],
      actRange: [26, 33],
      applicationDeadline: "February 1",
    },
    academics: {
      ranking: 49,
      strongPrograms: ["Engineering", "Agriculture", "Computer Science", "Aviation"],
      graduationRate: 84,
      studentFacultyRatio: "13:1",
    },
    cost: {
      tuitionInternational: 32000,
      roomAndBoard: 10600,
      totalCost: 42600,
    },
    financial: {
      meetsFullNeed: false,
      internationalAid: true,
      avgAidAmount: 12000,
    },
    international: {
      internationalPercentage: 22,
      countriesRepresented: 132,
      i20Support: true,
      optAvailable: true,
    },
    campusLife: {
      housing: "Available all years",
      clubs: 1000,
      sports: ["Football", "Basketball", "Swimming", "Golf"],
      greekLife: true,
    },
    image: "/images/campus_florida.jpg",
    coverImage: "/images/campus_florida.jpg",
    tags: ["STEM", "Engineering", "Research", "Big Ten"],
    featured: false,
  },
];

// ============================================================
// MOCK ARTICLES
// ============================================================
export const articles: Article[] = [
  {
    id: "1",
    slug: "how-to-build-your-college-list",
    title: "How to Build Your College List as an International Student",
    excerpt:
      "Building a balanced college list is one of the most strategic parts of the college application process. Here's how to do it right.",
    category: "How to Apply",
    readTime: 8,
    image: "/images/hero_campus.jpg",
    publishDate: "2026-08-10",
    featured: true,
  },
  {
    id: "2",
    slug: "understanding-financial-aid-international",
    title: "Understanding Financial Aid as an International Student",
    excerpt:
      "Financial aid for international students is limited but not impossible. Learn where to look, what to ask, and how to maximize your opportunities.",
    category: "Financial Aid",
    readTime: 10,
    image: "/images/problem_student.jpg",
    publishDate: "2026-08-05",
    featured: true,
  },
  {
    id: "3",
    slug: "common-app-international-guide",
    title: "The International Student's Complete Guide to Common App",
    excerpt:
      "Common App can be confusing for international students. Here's a step-by-step breakdown of everything you need to know.",
    category: "International Students",
    readTime: 12,
    image: "/images/campus_nyc.jpg",
    publishDate: "2026-07-28",
    featured: true,
  },
  {
    id: "4",
    slug: "writing-a-strong-college-essay",
    title: "How to Write a College Essay That Stands Out",
    excerpt:
      "Your personal statement is your chance to speak directly to the admissions committee. Here's how to write one that makes them remember you.",
    category: "Essays",
    readTime: 9,
    image: "/images/campus_california.jpg",
    publishDate: "2026-07-20",
    featured: true,
  },
  {
    id: "5",
    slug: "stem-majors-international-students",
    title: "Best STEM Programs for International Students in the US",
    excerpt:
      "STEM fields offer excellent opportunities for international students, including OPT extensions. Here are the top programs to consider.",
    category: "International Students",
    readTime: 7,
    image: "/images/campus_boston.jpg",
    publishDate: "2026-07-15",
    featured: false,
  },
  {
    id: "6",
    slug: "f1-visa-guide",
    title: "The F-1 Student Visa: Everything You Need to Know",
    excerpt:
      "Your F-1 visa is your gateway to studying in the US. Here's a comprehensive guide to the application process, requirements, and what to expect.",
    category: "International Students",
    readTime: 11,
    image: "/images/campus_florida.jpg",
    publishDate: "2026-07-10",
    featured: false,
  },
];

// ============================================================
// MOCK STUDENT PROFILE
// ============================================================
export const demoStudent: StudentProfile = {
  id: "demo",
  name: "Aiko Tanaka",
  nationality: "Japan",
  gpa: 3.6,
  sat: 1320,
  intendedMajor: "Engineering",
  budget: 35000,
  preferredLocation: ["East Coast", "California"],
  interests: ["Technology", "Robotics", "Sports"],
  extracurriculars: ["Math Club", "Robotics Team"],
  targetGPA: 3.8,
  targetSAT: 1400,
};

// ============================================================
// MOCK JOURNEY STEPS
// ============================================================
export const journeySteps: JourneyStep[] = [
  { id: "1", title: "Build College List", status: "complete", completedAt: "June 2026" },
  { id: "2", title: "Standardized Testing", status: "complete", completedAt: "July 2026" },
  { id: "3", title: "Personal Essays", status: "in-progress", dueDate: "October 2026" },
  { id: "4", title: "Recommendation Letters", status: "upcoming", dueDate: "October 2026" },
  { id: "5", title: "Submit Applications", status: "upcoming", dueDate: "January 2027" },
];

// ============================================================
// MOCK GOALS
// ============================================================
export const demoGoals: Goal[] = [
  {
    id: "1",
    title: "Reach 1400 SAT",
    description: "Focus on Math section — aim for 750+ to boost your score significantly.",
    current: 1320,
    target: 1400,
    unit: "points",
    category: "Testing",
    priority: "High",
  },
  {
    id: "2",
    title: "Strengthen GPA",
    description: "Maintain straight A's in your remaining semesters. Focus on science and math.",
    current: 3.6,
    target: 3.8,
    unit: "GPA",
    category: "Academic",
    priority: "High",
  },
  {
    id: "3",
    title: "Build Extracurriculars",
    description: "Add 1-2 meaningful activities aligned with Engineering. Consider IEEE, hackathons, or research.",
    current: 2,
    target: 4,
    unit: "activities",
    category: "Extracurricular",
    priority: "Medium",
  },
];

// ============================================================
// FILTER OPTIONS
// ============================================================
export const majorOptions = [
  "Engineering", "Business", "Computer Science", "Medicine",
  "Arts & Design", "Law", "Education", "Sciences", "Social Sciences",
];

export const locationOptions = [
  "East Coast", "West Coast", "Midwest", "South", "Northeast", "Southwest",
];

export const costRanges = [
  "Under $20K", "$20K–$35K", "$35K–$50K", "$50K–$65K", "$65K+",
];

export const campusSizes = ["Small (Under 5K)", "Medium (5K–15K)", "Large (15K+)"];
