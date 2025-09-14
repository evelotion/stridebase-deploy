/*
  Warnings:

  - You are about to drop the column `bookingTime` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `deliveryTime` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `amount` on the `Invoice` table. All the data in the column will be lost.
  - The `status` column on the `Payment` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `isActive` on the `Promo` table. All the data in the column will be lost.
  - You are about to drop the column `maxDiscount` on the `Promo` table. All the data in the column will be lost.
  - You are about to drop the column `minPurchase` on the `Promo` table. All the data in the column will be lost.
  - You are about to drop the column `scope` on the `Promo` table. All the data in the column will be lost.
  - You are about to drop the column `timesUsed` on the `Promo` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Promo` table. All the data in the column will be lost.
  - You are about to drop the column `validFrom` on the `Promo` table. All the data in the column will be lost.
  - You are about to drop the column `validUntil` on the `Promo` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[invoiceNumber]` on the table `Invoice` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `phoneNumber` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recipientName` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deliveryOption` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serviceName` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `invoiceNumber` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `issueDate` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalAmount` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `discountType` to the `Promo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userName` to the `Review` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "BookingStatus" ADD VALUE 'reviewed';

-- DropForeignKey
ALTER TABLE "ApprovalRequest" DROP CONSTRAINT "ApprovalRequest_storeId_fkey";

-- AlterTable
ALTER TABLE "Address" ADD COLUMN     "label" TEXT,
ADD COLUMN     "phoneNumber" TEXT NOT NULL,
ADD COLUMN     "recipientName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ApprovalRequest" ALTER COLUMN "storeId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "bookingTime",
DROP COLUMN "deliveryTime",
ADD COLUMN     "deliveryOption" TEXT NOT NULL,
ADD COLUMN     "scheduleDate" TIMESTAMP(3),
ADD COLUMN     "serviceName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Invoice" DROP COLUMN "amount",
ADD COLUMN     "invoiceNumber" TEXT NOT NULL,
ADD COLUMN     "issueDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "totalAmount" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "LoyaltyPoint" ADD COLUMN     "transactions" JSONB[];

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "linkUrl" TEXT;

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE "Promo" DROP COLUMN "isActive",
DROP COLUMN "maxDiscount",
DROP COLUMN "minPurchase",
DROP COLUMN "scope",
DROP COLUMN "timesUsed",
DROP COLUMN "type",
DROP COLUMN "validFrom",
DROP COLUMN "validUntil",
ADD COLUMN     "discountType" TEXT NOT NULL,
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "forNewUser" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "minTransaction" DOUBLE PRECISION,
ADD COLUMN     "startDate" TIMESTAMP(3),
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'active',
ADD COLUMN     "usageCount" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "usageLimit" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "userName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Store" ADD COLUMN     "photoLimit" INTEGER NOT NULL DEFAULT 5;

-- AlterTable
ALTER TABLE "StoreSchedule" ALTER COLUMN "dayOfWeek" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'active';

-- CreateTable
CREATE TABLE "Banner" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT NOT NULL,
    "linkUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Banner_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber");

-- AddForeignKey
ALTER TABLE "ApprovalRequest" ADD CONSTRAINT "ApprovalRequest_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;
