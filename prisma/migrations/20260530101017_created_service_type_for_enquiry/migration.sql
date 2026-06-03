/*
  Warnings:

  - The `services` column on the `contacts` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('WEB_DEVELOPMENT', 'APP_DEVELOPMENT', 'UI_UX_DESIGN', 'DIGITAL_MARKETING', 'SEO_OPTIMIZATION', 'BRANDING', 'OTHERS');

-- AlterTable
ALTER TABLE "contacts" DROP COLUMN "services",
ADD COLUMN     "services" "ServiceType"[];
