/*
  Warnings:

  - Added the required column `experience` to the `applications` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "applications" ADD COLUMN     "experience" TEXT NOT NULL,
ADD COLUMN     "socialProfile" TEXT,
ALTER COLUMN "coverLetter" DROP NOT NULL;
