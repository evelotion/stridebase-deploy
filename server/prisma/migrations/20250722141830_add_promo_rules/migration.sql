-- AlterTable
ALTER TABLE "Promo" ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "forNewUser" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "minTransaction" INTEGER,
ADD COLUMN     "startDate" TIMESTAMP(3),
ADD COLUMN     "usageCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "usageLimit" INTEGER;
