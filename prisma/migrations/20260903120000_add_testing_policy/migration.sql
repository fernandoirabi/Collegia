-- CreateEnum
CREATE TYPE "TestingPolicy" AS ENUM ('TEST_OPTIONAL', 'TEST_FLEXIBLE', 'TEST_REQUIRED', 'UNKNOWN');

-- AlterTable
ALTER TABLE "colleges" ADD COLUMN     "testingPolicy" "TestingPolicy";
