-- CreateIndex
CREATE INDEX "Booking_userId_idx" ON "Booking"("userId");

-- CreateIndex
CREATE INDEX "Booking_storeId_idx" ON "Booking"("storeId");

-- CreateIndex
CREATE INDEX "Booking_status_idx" ON "Booking"("status");

-- CreateIndex
CREATE INDEX "Service_storeId_idx" ON "Service"("storeId");

-- CreateIndex
CREATE INDEX "Store_ownerId_idx" ON "Store"("ownerId");

-- CreateIndex
CREATE INDEX "Store_storeStatus_idx" ON "Store"("storeStatus");

-- CreateIndex
CREATE INDEX "Store_tier_idx" ON "Store"("tier");
