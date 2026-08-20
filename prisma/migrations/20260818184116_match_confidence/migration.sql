-- CreateEnum
CREATE TYPE "MatchConfidence" AS ENUM ('HIGH', 'MEDIUM', 'LIMITED');

-- AlterTable
ALTER TABLE "match_dimension_scores" ADD COLUMN     "confidence" "MatchConfidence" NOT NULL DEFAULT 'MEDIUM';
