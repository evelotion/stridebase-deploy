-- AlterTable
ALTER TABLE "Promo" ADD COLUMN     "storeId" TEXT;

-- AddForeignKey
ALTER TABLE "Promo" ADD CONSTRAINT "Promo_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;
