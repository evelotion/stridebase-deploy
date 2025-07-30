-- AlterTable
ALTER TABLE "Promo" ADD COLUMN     "isRedeemed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "userId" TEXT;

-- AddForeignKey
ALTER TABLE "Promo" ADD CONSTRAINT "Promo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
