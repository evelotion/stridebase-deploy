-- CreateEnum
CREATE TYPE "StoreTier" AS ENUM ('BASIC', 'PRO');

-- AlterTable
ALTER TABLE "Store" ADD COLUMN     "tier" "StoreTier" NOT NULL DEFAULT 'BASIC';