-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('STUDENT', 'ADMIN');

-- CreateEnum
CREATE TYPE "CollegeType" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "CollegeSize" AS ENUM ('SMALL', 'MEDIUM', 'LARGE');

-- CreateEnum
CREATE TYPE "CampusSetting" AS ENUM ('URBAN', 'SUBURBAN', 'RURAL');

-- CreateEnum
CREATE TYPE "CollegeRegion" AS ENUM ('EAST_COAST', 'WEST_COAST', 'MIDWEST', 'SOUTH', 'SOUTHWEST', 'NORTHEAST', 'OTHER');

-- CreateEnum
CREATE TYPE "MatchClassification" AS ENUM ('STRONG_MATCH', 'TARGET', 'REACH');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('NOT_STARTED', 'DRAFTING', 'SUBMITTED', 'DECISION_PENDING', 'ACCEPTED', 'WAITLISTED', 'DEFERRED', 'REJECTED', 'ENROLLED', 'DECLINED');

-- CreateEnum
CREATE TYPE "ApplicationPlan" AS ENUM ('EARLY_ACTION', 'EARLY_DECISION', 'RESTRICTIVE_EARLY_ACTION', 'REGULAR_DECISION', 'ROLLING', 'TRANSFER', 'OTHER');

-- CreateEnum
CREATE TYPE "ApplicationPlatform" AS ENUM ('COMMON_APP', 'COALITION', 'SCHOOL_APPLICATION', 'OTHER');

-- CreateEnum
CREATE TYPE "GoalCategory" AS ENUM ('ACADEMIC', 'TESTING', 'EXTRACURRICULAR', 'APPLICATION', 'FINANCIAL');

-- CreateEnum
CREATE TYPE "GoalPriority" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "GoalStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "DataVerificationStatus" AS ENUM ('DEMO', 'UNVERIFIED', 'PENDING_VERIFICATION', 'VERIFIED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'STUDENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "country" TEXT,
    "isInternationalStudent" BOOLEAN NOT NULL DEFAULT true,
    "gpa" DOUBLE PRECISION,
    "gpaScale" DOUBLE PRECISION DEFAULT 4.0,
    "satScore" INTEGER,
    "actScore" INTEGER,
    "classYear" INTEGER,
    "intendedMajor" TEXT,
    "applicationYear" INTEGER,
    "intendedEnrollmentYear" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "college_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "preferredStates" TEXT[],
    "preferredRegions" TEXT[],
    "preferredSizes" TEXT[],
    "publicPrivate" TEXT[],
    "settings" TEXT[],
    "sports" TEXT[],
    "clubs" TEXT[],
    "interests" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "college_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_aid_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "annualBudget" INTEGER,
    "requiresFinancialAid" BOOLEAN,
    "requiresScholarship" BOOLEAN,
    "currency" TEXT DEFAULT 'USD',
    "fundingSource" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financial_aid_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "international_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "country" TEXT,
    "englishProficiencyTest" TEXT,
    "englishProficiencyScore" INTEGER,
    "ieltsScore" DOUBLE PRECISION,
    "visaType" TEXT,
    "needsI20Support" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "international_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_colleges" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "collegeId" TEXT NOT NULL,
    "matchClassification" "MatchClassification",
    "matchScore" INTEGER,
    "notes" TEXT,
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_colleges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goals" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "currentValue" DOUBLE PRECISION,
    "targetValue" DOUBLE PRECISION,
    "unit" TEXT,
    "category" "GoalCategory" NOT NULL DEFAULT 'ACADEMIC',
    "priority" "GoalPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "GoalStatus" NOT NULL DEFAULT 'ACTIVE',
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "collegeId" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "plan" "ApplicationPlan",
    "applicationYear" INTEGER,
    "submittedAt" TIMESTAMP(3),
    "decisionAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "colleges" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "website" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "stateCode" TEXT NOT NULL,
    "region" "CollegeRegion",
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "type" "CollegeType" NOT NULL,
    "setting" "CampusSetting",
    "sizeCategory" "CollegeSize",
    "undergraduateEnrollment" INTEGER,
    "campusSizeAcres" INTEGER,
    "acceptanceRate" DOUBLE PRECISION,
    "avgGpa" DOUBLE PRECISION,
    "gpaScale" DOUBLE PRECISION DEFAULT 4.0,
    "satRangeMin" INTEGER,
    "satRangeMax" INTEGER,
    "actRangeMin" INTEGER,
    "actRangeMax" INTEGER,
    "graduationRate" DOUBLE PRECISION,
    "studentFacultyRatio" TEXT,
    "tuitionInState" INTEGER,
    "tuitionOutOfState" INTEGER,
    "tuitionInternational" INTEGER,
    "roomAndBoard" INTEGER,
    "estimatedTotalCostInternational" INTEGER,
    "internationalAidAvailable" BOOLEAN,
    "meritScholarshipsAvailable" BOOLEAN,
    "needBasedAidAvailable" BOOLEAN,
    "meetsFullNeed" BOOLEAN,
    "avgAidInternational" INTEGER,
    "internationalPercentage" DOUBLE PRECISION,
    "internationalPopulation" INTEGER,
    "englishProficiencyRequirement" TEXT,
    "toeflMinimum" INTEGER,
    "ieltsMinimum" DOUBLE PRECISION,
    "i20Support" BOOLEAN,
    "optAvailable" BOOLEAN,
    "housing" TEXT,
    "clubsCount" INTEGER,
    "sports" TEXT[],
    "greekLife" BOOLEAN,
    "image" TEXT,
    "coverImage" TEXT,
    "tags" TEXT[],
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "isDemoData" BOOLEAN NOT NULL DEFAULT true,
    "dataSource" TEXT,
    "dataSourceUrl" TEXT,
    "dataCollectedAt" TIMESTAMP(3),
    "dataYear" INTEGER,
    "verificationStatus" "DataVerificationStatus" NOT NULL DEFAULT 'DEMO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "colleges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "majors" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,

    CONSTRAINT "majors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "college_majors" (
    "id" TEXT NOT NULL,
    "collegeId" TEXT NOT NULL,
    "majorId" TEXT NOT NULL,
    "isStrongProgram" BOOLEAN NOT NULL DEFAULT false,
    "strength" INTEGER,

    CONSTRAINT "college_majors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "college_statistics" (
    "id" TEXT NOT NULL,
    "collegeId" TEXT NOT NULL,
    "dataYear" INTEGER,
    "acceptanceRate" DOUBLE PRECISION,
    "avgGpa" DOUBLE PRECISION,
    "satRangeMin" INTEGER,
    "satRangeMax" INTEGER,
    "actRangeMin" INTEGER,
    "actRangeMax" INTEGER,
    "internationalPercentage" DOUBLE PRECISION,
    "internationalPopulation" INTEGER,
    "graduationRate" DOUBLE PRECISION,
    "undergraduateEnrollment" INTEGER,
    "isDemoData" BOOLEAN NOT NULL DEFAULT true,
    "dataSource" TEXT,
    "dataSourceUrl" TEXT,
    "dataCollectedAt" TIMESTAMP(3),
    "verificationStatus" "DataVerificationStatus" NOT NULL DEFAULT 'DEMO',

    CONSTRAINT "college_statistics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application_deadlines" (
    "id" TEXT NOT NULL,
    "collegeId" TEXT NOT NULL,
    "plan" "ApplicationPlan" NOT NULL,
    "date" TIMESTAMP(3),
    "deadlineDescription" TEXT,
    "isPriorityDeadline" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "application_deadlines_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "student_profiles_userId_key" ON "student_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "college_preferences_userId_key" ON "college_preferences"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "financial_aid_profiles_userId_key" ON "financial_aid_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "international_profiles_userId_key" ON "international_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "saved_colleges_userId_collegeId_key" ON "saved_colleges"("userId", "collegeId");

-- CreateIndex
CREATE INDEX "applications_userId_collegeId_idx" ON "applications"("userId", "collegeId");

-- CreateIndex
CREATE UNIQUE INDEX "colleges_slug_key" ON "colleges"("slug");

-- CreateIndex
CREATE INDEX "colleges_state_idx" ON "colleges"("state");

-- CreateIndex
CREATE INDEX "colleges_region_idx" ON "colleges"("region");

-- CreateIndex
CREATE INDEX "colleges_type_idx" ON "colleges"("type");

-- CreateIndex
CREATE INDEX "colleges_sizeCategory_idx" ON "colleges"("sizeCategory");

-- CreateIndex
CREATE UNIQUE INDEX "majors_name_key" ON "majors"("name");

-- CreateIndex
CREATE UNIQUE INDEX "college_majors_collegeId_majorId_key" ON "college_majors"("collegeId", "majorId");

-- CreateIndex
CREATE INDEX "college_statistics_collegeId_dataYear_idx" ON "college_statistics"("collegeId", "dataYear");

-- CreateIndex
CREATE INDEX "application_deadlines_collegeId_plan_idx" ON "application_deadlines"("collegeId", "plan");

-- AddForeignKey
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "college_preferences" ADD CONSTRAINT "college_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_aid_profiles" ADD CONSTRAINT "financial_aid_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "international_profiles" ADD CONSTRAINT "international_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_colleges" ADD CONSTRAINT "saved_colleges_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_colleges" ADD CONSTRAINT "saved_colleges_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "colleges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goals" ADD CONSTRAINT "goals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "colleges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "college_majors" ADD CONSTRAINT "college_majors_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "colleges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "college_majors" ADD CONSTRAINT "college_majors_majorId_fkey" FOREIGN KEY ("majorId") REFERENCES "majors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "college_statistics" ADD CONSTRAINT "college_statistics_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "colleges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_deadlines" ADD CONSTRAINT "application_deadlines_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "colleges"("id") ON DELETE CASCADE ON UPDATE CASCADE;
