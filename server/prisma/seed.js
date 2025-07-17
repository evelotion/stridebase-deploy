const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding ...");

  // Data Pengguna (Users)
  const passwordHash = await bcrypt.hash("password123", 10);
  const usersData = [
    {
      id: "user-budi-mitra",
      email: "budi.santoso@example.com",
      name: "Budi Santoso",
      password: passwordHash,
      role: "mitra",
    },
    {
      id: "user-siti-customer",
      email: "siti.rahayu@example.com",
      name: "Siti Rahayu",
      password: passwordHash,
      role: "customer",
    },
    {
      id: "user-admin",
      email: "admin@stridebase.com",
      name: "Admin StrideBase",
      password: passwordHash,
      role: "admin",
    },
  ];

  // Data Toko (Stores) - Diperbarui dengan benar
  const storesData = [
    {
      id: "store-1",
      name: "CleanStep Express",
      location: "Jakarta",
      owner: "Budi Santoso", // Tetap simpan nama sebagai string untuk data denormalisasi
      storeStatus: "active",
      rating: 4.8,
      servicesAvailable: 3,
      images: [
        "/images/store1.jpg",
        "/images/store2.jpg",
        "/images/store3.jpg",
      ],
      latitude: -6.2088,
      longitude: 106.8456,
      ownerId: "user-budi-mitra", // <-- PERBAIKAN: Hubungkan via ownerId
    },
    {
      id: "store-2",
      name: "ShoeCare Deep",
      location: "Bandung",
      owner: "Citra Lestari", // Tetap simpan nama sebagai string
      storeStatus: "pending",
      rating: 4.6,
      servicesAvailable: 4,
      images: ["/images/store3.jpg", "/images/store4.jpg"],
      latitude: -6.9175,
      longitude: 107.6191,
    },
    {
      id: "store-3",
      name: "DeepSole Care",
      location: "Yogyakarta",
      owner: "Andi Wijaya", // Tetap simpan nama sebagai string
      storeStatus: "inactive",
      rating: 4.7,
      servicesAvailable: 4,
      images: ["/images/store9.jpg", "/images/store4.jpg"],
      latitude: -7.7956,
      longitude: 110.3695,
    },
  ];

  // Data Promo (tidak berubah)
  const promosData = [
    {
      id: "PROMO1",
      code: "HEMAT20",
      description: "Diskon 20% khusus akhir pekan ini!",
      discountType: "percentage",
      value: 20,
      status: "active",
    },
    {
      id: "PROMO2",
      code: "CLEAN10K",
      description: "Potongan Rp 10.000, hanya untuk 10 orang per hari!",
      discountType: "fixed",
      value: 10000,
      status: "active",
    },
    {
      id: "PROMO3",
      code: "MEMBERBARU",
      description: "Potongan Rp 5.000 untuk pengguna baru.",
      discountType: "fixed",
      value: 5000,
      status: "inactive",
    },
  ];

  // Data Banner (tidak berubah)
  const bannersData = [
    {
      id: "banner-1",
      imageUrl: "/images/banner1.jpg",
      linkUrl: "/store",
      status: "active",
    },
    {
      id: "banner-2",
      imageUrl: "/images/banner2.jpg",
      linkUrl: "/promo",
      status: "active",
    },
  ];

  // Proses Seeding (Diperbarui)
  console.log("Seeding users...");
  for (const user of usersData) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
  }

  console.log("Seeding stores...");
  for (const store of storesData) {
    await prisma.store.upsert({
      where: { id: store.id },
      update: {},
      create: store,
    });
  }

  console.log("Seeding promos...");
  for (const promo of promosData) {
    await prisma.promo.upsert({
      where: { code: promo.code },
      update: {},
      create: promo,
    });
  }

  console.log("Seeding banners...");
  for (const banner of bannersData) {
    await prisma.banner.upsert({
      where: { id: banner.id },
      update: {},
      create: banner,
    });
  }

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
