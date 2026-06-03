/*
  Warnings:

  - The `requirements` column on the `jobs` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "jobs" ADD COLUMN     "responsibilities" TEXT[],
DROP COLUMN "requirements",
ADD COLUMN     "requirements" TEXT[];
