/*
  Warnings:

  - Added the required column `shoeType` to the `Service` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "shoeType" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Store" ADD COLUMN     "images" TEXT[];
