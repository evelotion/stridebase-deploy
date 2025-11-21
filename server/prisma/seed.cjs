// File: server/prisma/seed.cjs

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  console.log("🚀 [SEED] Memulai proses seeding ke Database Neon Baru...");

  // --- 1. BERSIHKAN DATA LAMA (Urutan Wajib: Anak dulu baru Induk) ---
  console.log("🔥 [SEED] Membersihkan database...");

  // Hapus data transaksi & detail
  await prisma.ledgerEntry.deleteMany();
  await prisma.walletTransaction.deleteMany();
  await prisma.platformEarning.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.invoice.deleteMany(); // Invoice bergantung pada Payment/Store
  
  // Hapus interaksi & notifikasi
  await prisma.review.deleteMany();
  await prisma.notification.deleteMany();
  
  // Hapus Booking (Data Transaksi Utama)
  await prisma.booking.deleteMany();

  // Hapus Data Relasi Toko
  await prisma.storePromo.deleteMany();
  await prisma.promo.deleteMany();
  await prisma.service.deleteMany();
  await prisma.storeSchedule.deleteMany();
  await prisma.payoutRequest.deleteMany(); // Payout bergantung pada Wallet
  await prisma.storeWallet.deleteMany();   // Wallet bergantung pada Store
  await prisma.approvalRequest.deleteMany();
  
  // Hapus Toko
  await prisma.store.deleteMany();

  // Hapus Data Relasi User
  await prisma.address.deleteMany();
  await prisma.loyaltyPoint.deleteMany();
  await prisma.securityLog.deleteMany();

  // Hapus Konfigurasi Global
  await prisma.banner.deleteMany();
  await prisma.globalSetting.deleteMany();

  // Terakhir: Hapus User
  await prisma.user.deleteMany();

  console.log("✅ [SEED] Database bersih.");

  // --- 2. MEMBUAT USER ---
  console.log("👤 [SEED] Membuat user...");
  const passwordHash = await bcrypt.hash("password123", 10);

  const dev = await prisma.user.create({
    data: {
      email: "developer@stridebase.com",
      name: "Developer Stride",
      password: passwordHash,
      role: "developer",
      isEmailVerified: true,
      phone: "08111111111"
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: "admin@stridebase.com",
      name: "Super Admin",
      password: passwordHash,
      role: "admin",
      isEmailVerified: true,
      phone: "08222222222"
    },
  });

  const mitra1 = await prisma.user.create({
    data: {
      email: "budi.clean@example.com",
      name: "Budi Santoso",
      password: passwordHash,
      role: "mitra",
      isEmailVerified: true,
      phone: "08333333333"
    },
  });

  const mitra2 = await prisma.user.create({
    data: {
      email: "citra.shine@example.com",
      name: "Citra Lestari",
      password: passwordHash,
      role: "mitra",
      isEmailVerified: true,
      phone: "08444444444"
    },
  });

  const cust1 = await prisma.user.create({
    data: {
      email: "siti.rahayu@example.com",
      name: "Siti Rahayu",
      password: passwordHash,
      role: "customer",
      isEmailVerified: true,
      phone: "08555555555"
    },
  });

  // --- 3. MEMBUAT ALAMAT ---
  await prisma.address.create({
    data: {
      userId: cust1.id,
      label: "Rumah",
      recipientName: "Siti Rahayu",
      phoneNumber: "08555555555",
      street: "Jl. Melati No. 123",
      city: "Jakarta Timur",
      province: "DKI Jakarta",
      postalCode: "13450",
      country: "Indonesia",
      isPrimary: true,
    },
  });

  // --- 4. MEMBUAT TOKO ---
  console.log("🏪 [SEED] Membuat toko...");
  
  const store1 = await prisma.store.create({
    data: {
      name: "CleanStep Express (PRO)",
      location: "Mall Grand Indonesia, Jakarta Pusat",
      description: "Layanan cuci sepatu premium dengan teknologi modern.",
      ownerId: mitra1.id,
      storeStatus: "active",
      tier: "PRO",
      subscriptionFee: 99000,
      rating: 4.8,
      headerImageUrl: "https://images.unsplash.com/photo-1556906781-9a412961c28c?q=80&w=870&auto=format&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1556906781-9a412961c28c?q=80&w=870&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1608231387042-89d0ac7c7895?q=80&w=870&auto=format&fit=crop",
      ],
      wallet: { create: { balance: 0 } },
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
      commissionRate: 15,
      rating: 4.5,
      headerImageUrl: "https://images.unsplash.com/photo-1608231387042-89d0ac7c7895?q=80&w=870&auto=format&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1608231387042-89d0ac7c7895?q=80&w=870&auto=format&fit=crop",
      ],
      wallet: { create: { balance: 0 } },
    },
  });

  // --- 5. MEMBUAT LAYANAN ---
  console.log("🧼 [SEED] Membuat layanan...");
  
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

  // --- 6. MEMBUAT BANNER (Penting untuk Hero Section) ---
  console.log("🖼️ [SEED] Membuat banner...");
  
  await prisma.banner.createMany({
    data: [
      {
        title: "Premium Care for Your Kicks",
        description: "Experience the best shoe cleaning service in town.",
        imageUrl: "https://images.unsplash.com/photo-1556906781-9a412961c28c?q=80&w=1920&auto=format&fit=crop",
        linkUrl: "/store",
        status: "active"
      },
      {
        title: "Restoration Experts",
        description: "Bring your old shoes back to life.",
        imageUrl: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=1920&auto=format&fit=crop",
        linkUrl: "/about",
        status: "active"
      }
    ]
  });

  // --- 7. SETTING GLOBAL ---
  await prisma.globalSetting.create({
    data: {
      key: "homePageTheme",
      value: "elevate", // Default tema ke Elevate sesuai request
      description: "Pilihan tema untuk Homepage: 'classic', 'modern', atau 'elevate'.",
    },
  });

  console.log("🎉 [SEED] Selesai! Data siap digunakan.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });