// File: server/prisma/seed.cjs (Versi Definitif untuk Seeding Awal di Render)

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Starting DEFINITIVE LIGHT seeding for Render...");
  
  console.log("🔥 Deleting all data in correct dependency order...");
  // Hapus data dari tabel 'anak' terlebih dahulu
  await prisma.pointTransaction.deleteMany();
  await prisma.platformEarning.deleteMany();
  await prisma.review.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.invoiceItem.deleteMany();
  
  // Hapus data dari tabel yang bergantung pada Store dan User
  await prisma.booking.deleteMany();
  await prisma.service.deleteMany();
  await prisma.invoice.deleteMany();
  
  // Hapus data yang bergantung pada Store
  await prisma.subscription.deleteMany();
  
  // Sekarang aman untuk menghapus data yang bergantung pada User
  await prisma.promo.deleteMany(); // Promo bisa bergantung pada User dan Store
  await prisma.store.deleteMany();
  await prisma.address.deleteMany();
  await prisma.loyaltyPoint.deleteMany();
  await prisma.approvalRequest.deleteMany();
  
  // Terakhir, hapus data User
  await prisma.user.deleteMany();
  
  // Hapus Banner (tidak punya dependensi)
  await prisma.banner.deleteMany();
  
  console.log("✅ All data deleted successfully.");

  console.log("👤 Seeding essential admin and dev users...");
  const passwordHash = await bcrypt.hash("password123", 10);

  await prisma.user.createMany({
    data: [
      { id: "user-dev-01", email: "developer@stridebase.com", name: "Developer Stride", password: passwordHash, role: "developer" },
      { id: "user-admin-01", email: "admin@stridebase.com", name: "Super Admin", password: passwordHash, role: "admin" },
    ],
  });
  console.log("✅ 2 essential users created.");
  console.log("🎉 Definitive light seeding finished successfully!");
}

main()
  .catch((e) => {
    console.error("❌ An error occurred during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });