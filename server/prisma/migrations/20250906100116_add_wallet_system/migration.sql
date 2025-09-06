/*
  Warnings:

  - The values [PENDING,SUCCESS,FAILED,CANCELLED] on the enum `PaymentStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [RECEIVED,WASHING,DRYING,QUALITY_CHECK,READY_FOR_PICKUP] on the enum `WorkStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `fullAddress` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `label` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `phoneNumber` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `recipientName` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `actionType` on the `ApprovalRequest` table. All the data in the column will be lost.
  - You are about to drop the column `payload` on the `ApprovalRequest` table. All the data in the column will be lost.
  - You are about to drop the column `resolvedAt` on the `ApprovalRequest` table. All the data in the column will be lost.
  - You are about to drop the column `resolvedById` on the `ApprovalRequest` table. All the data in the column will be lost.
  - The `status` column on the `ApprovalRequest` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `deliveryFee` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `deliveryOption` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `scheduleDate` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `serviceName` on the `Booking` table. All the data in the column will be lost.
  - The `status` column on the `Booking` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `invoiceNumber` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `issueDate` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `totalAmount` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `LoyaltyPoint` table. All the data in the column will be lost.
  - You are about to drop the column `linkUrl` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `readStatus` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `invoiceId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `provider` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `redirectUrl` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `subscriptionId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `transactionToken` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `commissionRate` on the `PlatformEarning` table. All the data in the column will be lost.
  - You are about to drop the column `grossAmount` on the `PlatformEarning` table. All the data in the column will be lost.
  - You are about to drop the column `discountType` on the `Promo` table. All the data in the column will be lost.
  - You are about to drop the column `endDate` on the `Promo` table. All the data in the column will be lost.
  - You are about to drop the column `forNewUser` on the `Promo` table. All the data in the column will be lost.
  - You are about to drop the column `isRedeemed` on the `Promo` table. All the data in the column will be lost.
  - You are about to drop the column `minTransaction` on the `Promo` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `Promo` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Promo` table. All the data in the column will be lost.
  - You are about to drop the column `storeId` on the `Promo` table. All the data in the column will be lost.
  - You are about to drop the column `usageCount` on the `Promo` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Promo` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `partnerReplyDate` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `userName` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `SecurityLog` table. All the data in the column will be lost.
  - You are about to drop the column `eventType` on the `SecurityLog` table. All the data in the column will be lost.
  - You are about to drop the column `shoeType` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `headerImage` on the `Store` table. All the data in the column will be lost.
  - You are about to drop the column `images` on the `Store` table. All the data in the column will be lost.
  - You are about to drop the column `isFeatured` on the `Store` table. All the data in the column will be lost.
  - You are about to drop the column `photoLimit` on the `Store` table. All the data in the column will be lost.
  - You are about to drop the column `rating` on the `Store` table. All the data in the column will be lost.
  - You are about to drop the column `schedule` on the `Store` table. All the data in the column will be lost.
  - You are about to drop the column `serviceLimit` on the `Store` table. All the data in the column will be lost.
  - You are about to drop the column `servicesAvailable` on the `Store` table. All the data in the column will be lost.
  - The `storeStatus` column on the `Store` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `tier` column on the `Store` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `billingType` column on the `Store` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `emailVerified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `User` table. All the data in the column will be lost.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `AuditLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Banner` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ErrorLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `InvoiceItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PointTransaction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Subscription` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[paymentId]` on the table `Invoice` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[midtransOrderId]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[resetPasswordToken]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `country` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `province` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `street` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `details` to the `ApprovalRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `requestType` to the `ApprovalRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeId` to the `ApprovalRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ApprovalRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bookingTime` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serviceId` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amount` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `items` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `midtransOrderId` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Made the column `bookingId` on table `Payment` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `minPurchase` to the `Promo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scope` to the `Promo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Promo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Promo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `validFrom` to the `Promo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `validUntil` to the `Promo` table without a default value. This is not possible if the table is not empty.
  - Made the column `usageLimit` on table `Promo` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `updatedAt` to the `Review` table without a default value. This is not possible if the table is not empty.
  - Added the required column `action` to the `SecurityLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `SecurityLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `duration` to the `Service` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Service` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Store` table without a default value. This is not possible if the table is not empty.
  - Made the column `ownerId` on table `Store` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('customer', 'mitra', 'admin', 'developer');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('pending', 'confirmed', 'cancelled', 'completed', 'in_progress');

-- CreateEnum
CREATE TYPE "StoreStatus" AS ENUM ('pending', 'active', 'inactive', 'rejected');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "Tier" AS ENUM ('BASIC', 'PRO');

-- CreateEnum
CREATE TYPE "PromoType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT');

-- CreateEnum
CREATE TYPE "PromoScope" AS ENUM ('GLOBAL', 'STORE_SPECIFIC');

-- CreateEnum
CREATE TYPE "LogAction" AS ENUM ('LOGIN_SUCCESS', 'LOGIN_FAILURE', 'PASSWORD_RESET_REQUEST', 'PASSWORD_RESET_SUCCESS', 'USER_REGISTERED', 'STORE_CREATED', 'BOOKING_CREATED', 'PAYMENT_SUCCESS', 'ADMIN_ACTION', 'DEVELOPER_ACTION');

-- CreateEnum
CREATE TYPE "WalletTransactionType" AS ENUM ('CREDIT', 'DEBIT');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterEnum
BEGIN;
CREATE TYPE "PaymentStatus_new" AS ENUM ('pending', 'paid', 'failed');
ALTER TABLE "Payment" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Payment" ALTER COLUMN "status" TYPE "PaymentStatus_new" USING ("status"::text::"PaymentStatus_new");
ALTER TYPE "PaymentStatus" RENAME TO "PaymentStatus_old";
ALTER TYPE "PaymentStatus_new" RENAME TO "PaymentStatus";
DROP TYPE "PaymentStatus_old";
ALTER TABLE "Payment" ALTER COLUMN "status" SET DEFAULT 'pending';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "WorkStatus_new" AS ENUM ('not_started', 'in_progress', 'completed', 'pending_verification');
ALTER TABLE "Booking" ALTER COLUMN "workStatus" DROP DEFAULT;
ALTER TABLE "Booking" ALTER COLUMN "workStatus" TYPE "WorkStatus_new" USING ("workStatus"::text::"WorkStatus_new");
ALTER TYPE "WorkStatus" RENAME TO "WorkStatus_old";
ALTER TYPE "WorkStatus_new" RENAME TO "WorkStatus";
DROP TYPE "WorkStatus_old";
ALTER TABLE "Booking" ALTER COLUMN "workStatus" SET DEFAULT 'not_started';
COMMIT;

-- DropForeignKey
ALTER TABLE "ApprovalRequest" DROP CONSTRAINT "ApprovalRequest_resolvedById_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_userId_fkey";

-- DropForeignKey
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_storeId_fkey";

-- DropForeignKey
ALTER TABLE "InvoiceItem" DROP CONSTRAINT "InvoiceItem_invoiceId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_bookingId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_bookingId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_invoiceId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_subscriptionId_fkey";

-- DropForeignKey
ALTER TABLE "PlatformEarning" DROP CONSTRAINT "PlatformEarning_storeId_fkey";

-- DropForeignKey
ALTER TABLE "PointTransaction" DROP CONSTRAINT "PointTransaction_bookingId_fkey";

-- DropForeignKey
ALTER TABLE "PointTransaction" DROP CONSTRAINT "PointTransaction_loyaltyPointId_fkey";

-- DropForeignKey
ALTER TABLE "Promo" DROP CONSTRAINT "Promo_storeId_fkey";

-- DropForeignKey
ALTER TABLE "Promo" DROP CONSTRAINT "Promo_userId_fkey";

-- DropForeignKey
ALTER TABLE "Store" DROP CONSTRAINT "Store_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "Subscription" DROP CONSTRAINT "Subscription_storeId_fkey";

-- DropIndex
DROP INDEX "ApprovalRequest_requestedById_idx";

-- DropIndex
DROP INDEX "ApprovalRequest_resolvedById_idx";

-- DropIndex
DROP INDEX "Invoice_invoiceNumber_key";

-- DropIndex
DROP INDEX "Notification_userId_idx";

-- DropIndex
DROP INDEX "Payment_invoiceId_key";

-- AlterTable
ALTER TABLE "Address" DROP COLUMN "fullAddress",
DROP COLUMN "label",
DROP COLUMN "phoneNumber",
DROP COLUMN "recipientName",
ADD COLUMN     "country" TEXT NOT NULL,
ADD COLUMN     "province" TEXT NOT NULL,
ADD COLUMN     "street" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "ApprovalRequest" DROP COLUMN "actionType",
DROP COLUMN "payload",
DROP COLUMN "resolvedAt",
DROP COLUMN "resolvedById",
ADD COLUMN     "details" JSONB NOT NULL,
ADD COLUMN     "requestType" TEXT NOT NULL,
ADD COLUMN     "reviewedById" TEXT,
ADD COLUMN     "storeId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "deliveryFee",
DROP COLUMN "deliveryOption",
DROP COLUMN "scheduleDate",
DROP COLUMN "serviceName",
ADD COLUMN     "bookingTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deliveryTime" TIMESTAMP(3),
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "serviceId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "totalPrice" SET DATA TYPE DOUBLE PRECISION,
DROP COLUMN "status",
ADD COLUMN     "status" "BookingStatus" NOT NULL DEFAULT 'pending',
ALTER COLUMN "workStatus" SET DEFAULT 'not_started';

-- AlterTable
ALTER TABLE "GlobalSetting" ADD COLUMN     "description" TEXT,
ALTER COLUMN "value" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Invoice" DROP COLUMN "invoiceNumber",
DROP COLUMN "issueDate",
DROP COLUMN "notes",
DROP COLUMN "totalAmount",
ADD COLUMN     "amount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "items" JSONB NOT NULL,
ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "paymentId" TEXT,
ALTER COLUMN "status" DROP DEFAULT;

-- AlterTable
ALTER TABLE "LoyaltyPoint" DROP COLUMN "createdAt";

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "linkUrl",
DROP COLUMN "readStatus",
ADD COLUMN     "isRead" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "invoiceId",
DROP COLUMN "provider",
DROP COLUMN "redirectUrl",
DROP COLUMN "subscriptionId",
DROP COLUMN "transactionToken",
ADD COLUMN     "midtransOrderId" TEXT NOT NULL,
ADD COLUMN     "midtransToken" TEXT,
ADD COLUMN     "paymentMethod" TEXT,
ALTER COLUMN "amount" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "status" SET DEFAULT 'pending',
ALTER COLUMN "bookingId" SET NOT NULL;

-- AlterTable
ALTER TABLE "PlatformEarning" DROP COLUMN "commissionRate",
DROP COLUMN "grossAmount";

-- AlterTable
ALTER TABLE "Promo" DROP COLUMN "discountType",
DROP COLUMN "endDate",
DROP COLUMN "forNewUser",
DROP COLUMN "isRedeemed",
DROP COLUMN "minTransaction",
DROP COLUMN "startDate",
DROP COLUMN "status",
DROP COLUMN "storeId",
DROP COLUMN "usageCount",
DROP COLUMN "userId",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "maxDiscount" DOUBLE PRECISION,
ADD COLUMN     "minPurchase" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "scope" "PromoScope" NOT NULL,
ADD COLUMN     "timesUsed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "type" "PromoType" NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "validFrom" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "validUntil" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "value" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "usageLimit" SET NOT NULL;

-- AlterTable
ALTER TABLE "Review" DROP COLUMN "date",
DROP COLUMN "partnerReplyDate",
DROP COLUMN "userName",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "SecurityLog" DROP COLUMN "createdAt",
DROP COLUMN "eventType",
ADD COLUMN     "action" "LogAction" NOT NULL,
ADD COLUMN     "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Service" DROP COLUMN "shoeType",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "duration" INTEGER NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "price" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Store" DROP COLUMN "headerImage",
DROP COLUMN "images",
DROP COLUMN "isFeatured",
DROP COLUMN "photoLimit",
DROP COLUMN "rating",
DROP COLUMN "schedule",
DROP COLUMN "serviceLimit",
DROP COLUMN "servicesAvailable",
ADD COLUMN     "headerImageUrl" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "storeStatus",
ADD COLUMN     "storeStatus" "StoreStatus" NOT NULL DEFAULT 'pending',
ALTER COLUMN "ownerId" SET NOT NULL,
DROP COLUMN "tier",
ADD COLUMN     "tier" "Tier" NOT NULL DEFAULT 'BASIC',
DROP COLUMN "billingType",
ADD COLUMN     "billingType" TEXT NOT NULL DEFAULT 'COMMISSION';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "emailVerified",
DROP COLUMN "status",
ADD COLUMN     "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "resetPasswordExpires" TIMESTAMP(3),
ADD COLUMN     "resetPasswordToken" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "role",
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'customer';

-- DropTable
DROP TABLE "AuditLog";

-- DropTable
DROP TABLE "Banner";

-- DropTable
DROP TABLE "ErrorLog";

-- DropTable
DROP TABLE "InvoiceItem";

-- DropTable
DROP TABLE "PointTransaction";

-- DropTable
DROP TABLE "Subscription";

-- DropEnum
DROP TYPE "BillingType";

-- DropEnum
DROP TYPE "StoreTier";

-- CreateTable
CREATE TABLE "StoreSchedule" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "openTime" TEXT NOT NULL,
    "closeTime" TEXT NOT NULL,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoreSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StorePromo" (
    "storeId" TEXT NOT NULL,
    "promoId" TEXT NOT NULL,
    "redeemed" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StorePromo_pkey" PRIMARY KEY ("storeId","promoId")
);

-- CreateTable
CREATE TABLE "StoreWallet" (
    "id" TEXT NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "storeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoreWallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WalletTransaction" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "type" "WalletTransactionType" NOT NULL,
    "description" TEXT NOT NULL,
    "bookingId" TEXT,
    "payoutRequestId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WalletTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayoutRequest" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "requestedById" TEXT NOT NULL,
    "processedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PayoutRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StoreSchedule_storeId_dayOfWeek_key" ON "StoreSchedule"("storeId", "dayOfWeek");

-- CreateIndex
CREATE UNIQUE INDEX "StoreWallet_storeId_key" ON "StoreWallet"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "WalletTransaction_bookingId_key" ON "WalletTransaction"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "WalletTransaction_payoutRequestId_key" ON "WalletTransaction"("payoutRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_paymentId_key" ON "Invoice"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_midtransOrderId_key" ON "Payment"("midtransOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "User_resetPasswordToken_key" ON "User"("resetPasswordToken");

-- AddForeignKey
ALTER TABLE "Store" ADD CONSTRAINT "Store_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreSchedule" ADD CONSTRAINT "StoreSchedule_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalRequest" ADD CONSTRAINT "ApprovalRequest_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalRequest" ADD CONSTRAINT "ApprovalRequest_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecurityLog" ADD CONSTRAINT "SecurityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StorePromo" ADD CONSTRAINT "StorePromo_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StorePromo" ADD CONSTRAINT "StorePromo_promoId_fkey" FOREIGN KEY ("promoId") REFERENCES "Promo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreWallet" ADD CONSTRAINT "StoreWallet_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletTransaction" ADD CONSTRAINT "WalletTransaction_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "StoreWallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletTransaction" ADD CONSTRAINT "WalletTransaction_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletTransaction" ADD CONSTRAINT "WalletTransaction_payoutRequestId_fkey" FOREIGN KEY ("payoutRequestId") REFERENCES "PayoutRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayoutRequest" ADD CONSTRAINT "PayoutRequest_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayoutRequest" ADD CONSTRAINT "PayoutRequest_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "StoreWallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayoutRequest" ADD CONSTRAINT "PayoutRequest_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayoutRequest" ADD CONSTRAINT "PayoutRequest_processedById_fkey" FOREIGN KEY ("processedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
