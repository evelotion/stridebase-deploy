// File: server/prisma/seed.cjs (GANTI TOTAL ISINYA DENGAN INI)

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

const daysAgo = (days) => new Date(new Date().setDate(new Date().getDate() - days));
const daysLater = (days) => new Date(new Date().setDate(new Date().getDate() + days));

async function main() {
  console.log("🚀 [SEED] Memulai proses seeding v2 (dengan upsert)...");

  // Hapus data lama (kecuali User)
  console.log("🔥 [SEED] Menghapus data lama (kecuali User)...");
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
  await prisma.globalSetting.deleteMany();

  // Hapus user non-esensial, biarkan admin/dev jika ada untuk di-update
  await prisma.user.deleteMany({
    where: {
      role: {
        in: ['customer', 'mitra']
      }
    }
  });

  console.log("✅ [SEED] Data lama berhasil dibersihkan.");

  // 1. BUAT ATAU UPDATE USERS
  console.log("👤 [SEED] Membuat atau memperbarui pengguna esensial...");
  const passwordHash = await bcrypt.hash("password123", 10);
  
  const dev = await prisma.user.upsert({
    where: { email: "developer@stridebase.com" },
    update: { password: passwordHash, name: "Developer Stride", role: "developer", isEmailVerified: true },
    create: { id: "user-dev-01", email: "developer@stridebase.com", name: "Developer Stride", password: passwordHash, role: "developer", isEmailVerified: true }
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@stridebase.com" },
    update: { password: passwordHash, name: "Super Admin", role: "admin", isEmailVerified: true },
    create: { id: "user-admin-01", email: "admin@stridebase.com", name: "Super Admin", password: passwordHash, role: "admin", isEmailVerified: true }
  });

  console.log(`✅ [SEED] Pengguna Developer & Admin berhasil di-upsert.`);
  
  // Buat pengguna lain
  const mitra1 = await prisma.user.create({ data: { id: "user-mitra-01", email: "budi.clean@example.com", name: "Budi Santoso", password: passwordHash, role: "mitra", isEmailVerified: true } });
  const cust1 = await prisma.user.create({ data: { id: "user-customer-01", email: "siti.rahayu@example.com", name: "Siti Rahayu", password: passwordHash, role: "customer", isEmailVerified: true } });
  console.log("✅ [SEED] Pengguna lainnya berhasil dibuat.");

  // 2. SEED TOKO
  console.log("🏪 [SEED] Membuat data toko...");
  const store1 = await prisma.store.create({ data: { id: "store-01-pro", name: "CleanStep Express (PRO)", location: "Mall Grand Indonesia, Jakarta", ownerId: mitra1.id, storeStatus: "active", tier: "PRO", billingType: "INVOICE", commissionRate: 0, rating: 4.8 } });
  console.log("✅ [SEED] Toko berhasil dibuat.");

  // 3. SEED LAYANAN
  console.log("🧼 [SEED] Membuat data layanan...");
  const service1 = await prisma.service.create({ data: { id:"service-01", storeId: store1.id, name: "Fast Clean Sneakers", price: 50000, duration: 30, shoeType: 'sneakers' } });
  console.log("✅ [SEED] Layanan berhasil dibuat.");

  // 4. SEED BOOKING
  console.log("🧾 [SEED] Membuat data booking...");
  const booking1 = await prisma.booking.create({ data: { id: "booking-01-reviewed", userId: cust1.id, storeId: store1.id, serviceId: service1.id, serviceName: service1.name, bookingTime: daysAgo(10), totalPrice: 50000, status: "completed", workStatus: "completed" } });
  console.log("✅ [SEED] Booking berhasil dibuat.");

  // 5. SEED ULASAN
  console.log("⭐ [SEED] Membuat data ulasan...");
  await prisma.review.create({ data: { bookingId: booking1.id, userId: cust1.id, storeId: store1.id, rating: 5, comment: "Mantap, bersih lagi!", userName: cust1.name } });
  console.log("✅ [SEED] Ulasan berhasil dibuat.");


  console.log("✅ [SEED] Proses seeding v2 berhasil!");
}

module.exports = { main };