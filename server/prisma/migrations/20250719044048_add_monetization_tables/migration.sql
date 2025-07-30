/*
  Warnings:

  - You are about to drop the column `addressId` on the `Booking` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_addressId_fkey";

-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "addressId";

-- AlterTable
ALTER TABLE "Store" ADD COLUMN     "commissionRate" DOUBLE PRECISION NOT NULL DEFAULT 10.0;

-- CreateTable
CREATE TABLE "PlatformEarning" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "grossAmount" INTEGER NOT NULL,
    "commissionRate" DOUBLE PRECISION NOT NULL,
    "earnedAmount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlatformEarning_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlatformEarning_bookingId_key" ON "PlatformEarning"("bookingId");

-- AddForeignKey
ALTER TABLE "PlatformEarning" ADD CONSTRAINT "PlatformEarning_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlatformEarning" ADD CONSTRAINT "PlatformEarning_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
