-- CreateEnum
CREATE TYPE "RecommendationCategory" AS ENUM ('ACADEMIC', 'TESTING', 'EXTRACURRICULAR', 'FINANCIAL', 'INTERNATIONAL', 'COLLEGE_LIST', 'GENERAL');

-- CreateEnum
CREATE TYPE "RecommendationStatus" AS ENUM ('OPEN', 'DONE', 'DISMISSED');

-- CreateTable
CREATE TABLE "match_scores" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "collegeId" TEXT NOT NULL,
    "matchScore" INTEGER NOT NULL,
    "classification" "MatchClassification" NOT NULL,
    "engineVersion" TEXT NOT NULL,
    "isDemo" BOOLEAN NOT NULL DEFAULT true,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "match_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_dimension_scores" (
    "id" TEXT NOT NULL,
    "matchScoreId" TEXT NOT NULL,
    "dimension" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "reasons" TEXT[],

    CONSTRAINT "match_dimension_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_history" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "collegeId" TEXT NOT NULL,
    "matchScore" INTEGER NOT NULL,
    "classification" "MatchClassification" NOT NULL,
    "engineVersion" TEXT NOT NULL,
    "isDemo" BOOLEAN NOT NULL DEFAULT true,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "match_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recommendations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "collegeId" TEXT,
    "goalId" TEXT,
    "category" "RecommendationCategory" NOT NULL DEFAULT 'GENERAL',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "suggestedAction" TEXT,
    "potentialImpact" INTEGER,
    "status" "RecommendationStatus" NOT NULL DEFAULT 'OPEN',
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "match_scores_userId_idx" ON "match_scores"("userId");

-- CreateIndex
CREATE INDEX "match_scores_collegeId_idx" ON "match_scores"("collegeId");

-- CreateIndex
CREATE UNIQUE INDEX "match_scores_userId_collegeId_key" ON "match_scores"("userId", "collegeId");

-- CreateIndex
CREATE INDEX "match_dimension_scores_matchScoreId_idx" ON "match_dimension_scores"("matchScoreId");

-- CreateIndex
CREATE INDEX "match_history_userId_collegeId_computedAt_idx" ON "match_history"("userId", "collegeId", "computedAt");

-- CreateIndex
CREATE INDEX "recommendations_userId_status_idx" ON "recommendations"("userId", "status");

-- AddForeignKey
ALTER TABLE "match_scores" ADD CONSTRAINT "match_scores_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_scores" ADD CONSTRAINT "match_scores_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "colleges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_dimension_scores" ADD CONSTRAINT "match_dimension_scores_matchScoreId_fkey" FOREIGN KEY ("matchScoreId") REFERENCES "match_scores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_history" ADD CONSTRAINT "match_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_history" ADD CONSTRAINT "match_history_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "colleges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "colleges"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "goals"("id") ON DELETE SET NULL ON UPDATE CASCADE;
