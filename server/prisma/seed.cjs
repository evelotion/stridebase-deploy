const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

// Helper untuk membuat tanggal di masa lalu atau masa depan
const daysAgo = (days) => new Date(new Date().setDate(new Date().getDate() - days));
const daysLater = (days) => new Date(new Date().setDate(new Date().getDate() + days));

async function main() {
  console.log("🚀 Memulai proses seeding data dummy...");

  // Hapus data lama untuk memastikan seeding yang bersih
  console.log("🔥 Menghapus data lama...");
  // Urutan penghapusan penting untuk menghindari error relasi
  await prisma.notification.deleteMany();
  await prisma.walletTransaction.deleteMany();
  await prisma.payoutRequest.deleteMany();
  await prisma.storeWallet.deleteMany();
  await prisma.approvalRequest.deleteMany();
  await prisma.review.deleteMany();
  await prisma.platformEarning.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.service.deleteMany();
  await prisma.storeSchedule.deleteMany();
  await prisma.storePromo.deleteMany();
  await prisma.promo.deleteMany();
  await prisma.store.deleteMany();
  await prisma.address.deleteMany();
  await prisma.loyaltyPoint.deleteMany();
  await prisma.securityLog.deleteMany();
  await prisma.user.deleteMany();
  await prisma.globalSetting.deleteMany();
  
  console.log("✅ Data lama berhasil dihapus.");

  // =================================================================
  // 1. SEED PENGGUNA (USERS)
  // =================================================================
  console.log("👤 Membuat data pengguna...");
  const passwordHash = await bcrypt.hash("password123", 10);

  await prisma.user.createMany({
    data: [
      { id: "user-dev-01", email: "developer@stridebase.com", name: "Developer Stride", password: passwordHash, role: "developer", isEmailVerified: true},
      { id: "user-admin-01", email: "admin@stridebase.com", name: "Super Admin", password: passwordHash, role: "admin", isEmailVerified: true},
      { id: "user-mitra-01", email: "budi.clean@example.com", name: "Budi Santoso", password: passwordHash, role: "mitra", isEmailVerified: true},
      { id: "user-mitra-02", email: "ani.laundry@example.com", name: "Ani Wijaya", password: passwordHash, role: "mitra", isEmailVerified: true},
      { id: "user-mitra-03", email: "tono.shoes@example.com", name: "Tono Stark", password: passwordHash, role: "mitra", isEmailVerified: true},
      { id: "user-mitra-04", email: "dina.kicks@example.com", name: "Dina Kicks", password: passwordHash, role: "mitra", isEmailVerified: true},
      { id: "user-customer-01", email: "siti.rahayu@example.com", name: "Siti Rahayu", password: passwordHash, role: "customer", isEmailVerified: true },
      { id: "user-customer-02", email: "agus.wijoyo@example.com", name: "Agus Wijoyo", password: passwordHash, role: "customer", isEmailVerified: true },
    ],
  });
  console.log(`✅ 8 pengguna berhasil dibuat.`);

  // =================================================================
  // 2. SEED ALAMAT
  // =================================================================
  console.log("🏠 Membuat data alamat...");
  await prisma.address.createMany({
    data: [
      { id: "addr-siti-01", userId: "user-customer-01", street: "Jl. Merdeka No. 17", city: "Jakarta Pusat", province: "DKI Jakarta", country: "Indonesia", postalCode: "10110", isPrimary: true },
      { id: "addr-agus-01", userId: "user-customer-02", street: "Gedung Cyber 2 Lt. 18", city: "Jakarta Selatan", province: "DKI Jakarta", country: "Indonesia", postalCode: "12950", isPrimary: true },
    ]
  });
  console.log("✅ 2 alamat berhasil dibuat.");

  // =================================================================
  // 3. SEED TOKO & DOMPET DIGITAL
  // =================================================================
  console.log("🏪 Membuat data toko...");
  const createdStores = await Promise.all([
      prisma.store.create({ data: { id: "store-01-pro", name: "CleanStep Express (PRO)", location: "Mall Grand Indonesia, Jakarta", ownerId: "user-mitra-01", storeStatus: "active", tier: "PRO", billingType: "INVOICE", commissionRate: 0, latitude: -6.1954, longitude: 106.8221 }}),
      prisma.store.create({ data: { id: "store-02-basic", name: "Ani Shoe Laundry (BASIC)", location: "Jl. Dago No. 123, Bandung", ownerId: "user-mitra-02", storeStatus: "active", tier: "BASIC", billingType: "COMMISSION", commissionRate: 12.5, latitude: -6.8943, longitude: 107.6111 }}),
      prisma.store.create({ data: { id: "store-03-pending", name: "Tono's Premium Care", location: "Jl. Malioboro, Yogyakarta", ownerId: "user-mitra-03", storeStatus: "pending", tier: "BASIC", billingType: "COMMISSION", commissionRate: 10, latitude: -7.7928, longitude: 110.3659 }}),
      prisma.store.create({ data: { id: "store-04-inactive", name: "Dina Kicks (Nonaktif)", location: "Jl. Basuki Rahmat, Surabaya", ownerId: "user-mitra-04", storeStatus: "inactive", tier: "BASIC", billingType: "COMMISSION", commissionRate: 10, latitude: -7.2657, longitude: 112.7399 }}),
  ]);
  console.log(`✅ ${createdStores.length} toko berhasil dibuat.`);

  console.log("💰 Membuat dompet digital untuk setiap toko...");
  await prisma.storeWallet.createMany({
    data: createdStores.map(store => ({ storeId: store.id }))
  });
  console.log(`✅ ${createdStores.length} dompet berhasil dibuat.`);


  // =================================================================
  // 4. SEED LAYANAN
  // =================================================================
  console.log("🧼 Membuat data layanan...");
  await prisma.service.createMany({
    data: [
      { id:"service-01", storeId: "store-01-pro", name: "Fast Clean Sneakers", price: 50000, duration: 30 },
      { id:"service-02", storeId: "store-01-pro", name: "Deep Clean Leather", price: 85000, duration: 60 },
      { id:"service-03", storeId: "store-02-basic", name: "Cuci Cepat Reguler", price: 35000, duration: 45 },
      { id:"service-04", storeId: "store-02-basic", name: "Perawatan Suede", price: 60000, duration: 75 },
    ]
  });
  console.log(`✅ 4 layanan berhasil dibuat.`);

  // =================================================================
  // 5. SEED BOOKING
  // =================================================================
  console.log("🧾 Membuat data booking...");
  const bookings = await prisma.booking.createManyAndReturn({
    data: [
      { id: "booking-01-reviewed", userId: "user-customer-01", storeId: "store-01-pro", serviceId: "service-01", bookingTime: daysAgo(10), totalPrice: 50000, status: "completed", workStatus: "completed" },
      { id: "booking-02-completed", userId: "user-customer-02", storeId: "store-01-pro", serviceId: "service-02", bookingTime: daysAgo(3), totalPrice: 85000, status: "completed", workStatus: "completed" },
      { id: "booking-03-processing", userId: "user-customer-01", storeId: "store-02-basic", serviceId: "service-04", bookingTime: daysAgo(1), totalPrice: 60000, status: "confirmed", workStatus: "in_progress", addressId: "addr-siti-01" },
    ]
  });
  console.log(`✅ ${bookings.length} booking berhasil dibuat.`);

  // =================================================================
  // 6. SEED PEMBAYARAN & PROSES DOMPET DIGITAL
  // =================================================================
  console.log("💳 Membuat data pembayaran & memproses transaksi dompet...");
  await prisma.payment.createMany({
    data: [
      { bookingId: "booking-01-reviewed", amount: 50000, status: "paid", midtransOrderId: `stride-dummy-1` },
      { bookingId: "booking-02-completed", amount: 85000, status: "paid", midtransOrderId: `stride-dummy-2` },
      { bookingId: "booking-03-processing", amount: 60000, status: "paid", midtransOrderId: `stride-dummy-3` },
    ]
  });

  // Simulasi potong komisi untuk toko "Ani Shoe Laundry"
  const aniStore = createdStores.find(s => s.id === "store-02-basic");
  const aniWallet = await prisma.storeWallet.findUnique({ where: { storeId: aniStore.id } });
  const bookingToProcess = bookings.find(b => b.id === "booking-03-processing");

  const commission = bookingToProcess.totalPrice * (aniStore.commissionRate / 100);
  const netIncome = bookingToProcess.totalPrice - commission;

  await prisma.storeWallet.update({
    where: { id: aniWallet.id },
    data: { balance: { increment: netIncome } }
  });

  await prisma.walletTransaction.create({
    data: {
      walletId: aniWallet.id,
      amount: netIncome,
      type: 'CREDIT',
      description: `Pendapatan dari booking #${bookingToProcess.id.slice(0,8)}`,
      bookingId: bookingToProcess.id
    }
  });

  await prisma.platformEarning.create({ data: { bookingId: "booking-03-processing", storeId: "store-02-basic", earnedAmount: commission } });
  
  console.log("✅ Pembayaran dan transaksi dompet berhasil dibuat.");

  // =================================================================
  // 7. SEED ULASAN (REVIEWS)
  // =================================================================
  console.log("⭐ Membuat data ulasan...");
  await prisma.review.create({
    data: {
      id: "review-to-delete-id",
      bookingId: "booking-01-reviewed",
      userId: "user-customer-01",
      storeId: "store-01-pro",
      rating: 5,
      comment: "Pelayanannya cepat dan hasilnya bersih sekali!",
    }
  });
  console.log("✅ 1 ulasan berhasil dibuat.");

  // =================================================================
  // 8. SEED PERMINTAAN PERSETUJUAN & PENARIKAN DANA
  // =================================================================
  console.log("🔔💰 Membuat permintaan persetujuan & penarikan dana...");
  await prisma.approvalRequest.create({
    data: {
      storeId: "store-01-pro",
      requestType: "DELETE_REVIEW",
      details: { reviewId: "review-to-delete-id", comment: "Ulasan ini mengandung SARA." },
      status: "PENDING",
      requestedById: "user-admin-01"
    }
  });

  // Simulasi permintaan penarikan dana dari Ani
  await prisma.payoutRequest.create({
      data: {
          storeId: aniStore.id,
          walletId: aniWallet.id,
          amount: 25000,
          status: "PENDING",
          requestedById: aniStore.ownerId
      }
  })
  
  console.log("✅ Permintaan persetujuan & penarikan dana berhasil dibuat.");

  // =================================================================
  // 9. SEED PROMO
  // =================================================================
  console.log("🎉 Membuat data promo...");
  await prisma.promo.create({ data: { id: "promo-1", code: "STRIDEBARU", description: "Diskon 15% untuk pengguna baru!", type: 'PERCENTAGE', value: 15, minPurchase: 50000, validFrom: daysAgo(5), validUntil: daysLater(30), usageLimit: 100, scope: 'GLOBAL', isActive: true } });
  console.log("✅ Promo berhasil dibuat.");

  console.log("✅ Proses seeding berhasil!");
}

main()
  .catch((e) => {
    console.error("❌ Terjadi error saat proses seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });