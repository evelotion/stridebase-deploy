// File: server/prisma/seed.cjs (Perbaikan Final dengan images dan alamat yang benar)

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  console.log(
    "🚀 [SEED] Memulai proses seeding data trial dengan skema final..."
  );
  console.log("🔥 [SEED] Menghapus data transaksi dan toko lama...");
  await prisma.review.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.platformEarning.deleteMany();
  await prisma.walletTransaction.deleteMany();
  await prisma.payoutRequest.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.service.deleteMany();
  await prisma.storeSchedule.deleteMany();
  await prisma.storePromo.deleteMany();
  await prisma.promo.deleteMany();
  await prisma.approvalRequest.deleteMany();
  await prisma.storeWallet.deleteMany();
  await prisma.store.deleteMany();
  await prisma.address.deleteMany();
  await prisma.loyaltyPoint.deleteMany();
  await prisma.user.deleteMany({
    where: { role: { in: ["customer", "mitra"] } },
  });
  console.log("✅ [SEED] Data lama berhasil dibersihkan.");

  console.log("👤 [SEED] Membuat atau memperbarui pengguna...");
  const passwordHash = await bcrypt.hash("password123", 10);

  const dev = await prisma.user.upsert({
    where: { email: "developer@stridebase.com" },
    update: { password: passwordHash, name: "Developer Stride", isEmailVerified: true },
    create: {
      id: "user-dev-01",
      email: "developer@stridebase.com",
      name: "Developer Stride",
      password: passwordHash,
      role: "developer",
      isEmailVerified: true,
    },
  });
  const admin = await prisma.user.upsert({
    where: { email: "admin@stridebase.com" },
    update: { password: passwordHash, name: "Super Admin", isEmailVerified: true },
    create: {
      id: "user-admin-01",
      email: "admin@stridebase.com",
      name: "Super Admin",
      password: passwordHash,
      role: "admin",
      isEmailVerified: true,
    },
  });
  const mitra1 = await prisma.user.create({
    data: {
      id: "user-mitra-01",
      email: "budi.clean@example.com",
      name: "Budi Santoso",
      password: passwordHash,
      role: "mitra",
      isEmailVerified: true,
    },
  });
  const mitra2 = await prisma.user.create({
    data: {
      id: "user-mitra-02",
      email: "citra.shine@example.com",
      name: "Citra Lestari",
      password: passwordHash,
      role: "mitra",
      isEmailVerified: true,
    },
  });
  const cust1 = await prisma.user.create({
    data: {
      id: "user-customer-01",
      email: "siti.rahayu@example.com",
      name: "Siti Rahayu",
      password: passwordHash,
      role: "customer",
      isEmailVerified: true,
    },
  });
  console.log(`✅ [SEED] Pengguna berhasil dibuat.`);

  // --- PERBAIKAN DI SINI ---
  await prisma.address.create({
    data: {
      userId: cust1.id,
      label: "Rumah",
      recipientName: "Siti Rahayu", // Field yang hilang ditambahkan
      phoneNumber: "081234567890", // Field yang hilang ditambahkan
      street: "Jl. Melati No. 123",
      city: "Jakarta Timur",
      province: "DKI Jakarta",
      postalCode: "13450",
      country: "Indonesia",
      isPrimary: true,
    },
  });
  console.log("✅ [SEED] Alamat untuk customer berhasil dibuat.");

  console.log("🏪 [SEED] Membuat data toko...");
  const store1 = await prisma.store.create({
    data: {
      name: "CleanStep Express (PRO)",
      location: "Mall Grand Indonesia, Jakarta Pusat",
      description: "Layanan cuci sepatu premium dengan teknologi modern.",
      ownerId: mitra1.id,
      storeStatus: "active",
      tier: "PRO",
      rating: 4.8,
      headerImageUrl:
        "https://images.unsplash.com/photo-1556906781-9a412961c28c?q=80&w=870&auto=format&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1556906781-9a412961c28c?q=80&w=870&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1608231387042-89d0ac7c7895?q=80&w=870&auto=format&fit=crop",
      ],
      wallet: { create: {} },
    },
  });
  const store2 = await prisma.store.create({
    data: {
      name: "Citra Shine Shoes",
      location: "Jl. Pahlawan No. 45, Bandung",
      description: "Perawatan sepatu suede dan kulit terbaik di Bandung.",
      ownerId: mitra2.id,
      storeStatus: "active",
      tier: "BASIC",
      rating: 4.5,
      headerImageUrl:
        "https://images.unsplash.com/photo-1608231387042-89d0ac7c7895?q=80&w=870&auto=format&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1608231387042-89d0ac7c7895?q=80&w=870&auto=format&fit=crop",
      ],
      wallet: { create: {} },
    },
  });
  console.log(`✅ [SEED] Toko berhasil dibuat.`);

  console.log("🧼 [SEED] Membuat data layanan...");
  await prisma.service.createMany({
    data: [
      {
        name: "Fast Clean Sneakers",
        description: "Pembersihan cepat.",
        price: 50000,
        shoeType: "sneakers",
        duration: 60,
        storeId: store1.id,
      },
      {
        name: "Deep Clean Sneakers",
        description: "Pembersihan total.",
        price: 85000,
        shoeType: "sneakers",
        duration: 90,
        storeId: store1.id,
      },
      {
        name: "Leather Care & Polish",
        description: "Perawatan khusus kulit.",
        price: 95000,
        shoeType: "kulit",
        duration: 120,
        storeId: store1.id,
      },
      {
        name: "Suede & Nubuck Treatment",
        description: "Pembersihan kering suede.",
        price: 90000,
        shoeType: "suede",
        duration: 120,
        storeId: store2.id,
      },
      {
        name: "Standard Clean",
        description: "Pembersihan standar.",
        price: 40000,
        shoeType: "lainnya",
        duration: 60,
        storeId: store2.id,
      },
    ],
  });
  console.log("✅ [SEED] Layanan berhasil dibuat.");
  console.log("🎉 [SEED] Proses seeding data trial selesai!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });