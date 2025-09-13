// File: server/prisma/seed.cjs (Perbaikan Final)

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  console.log("🚀 [SEED] Memulai proses seeding data trial yang lebih lengkap (Versi Final)...");

  // Hapus data lama dengan urutan yang benar untuk menghindari error relasi
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
    where: {
      role: {
        in: ['customer', 'mitra']
      }
    }
  });
  console.log("✅ [SEED] Data lama berhasil dibersihkan.");

  // 1. BUAT ATAU UPDATE USERS ESENSIAL
  console.log("👤 [SEED] Membuat atau memperbarui pengguna...");
  const passwordHash = await bcrypt.hash("password123", 10);
  
  const dev = await prisma.user.upsert({
    where: { email: "developer@stridebase.com" },
    update: { password: passwordHash, name: "Developer Stride", isEmailVerified: true },
    create: { id: "user-dev-01", email: "developer@stridebase.com", name: "Developer Stride", password: passwordHash, role: "developer", isEmailVerified: true }
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@stridebase.com" },
    update: { password: passwordHash, name: "Super Admin", isEmailVerified: true },
    create: { id: "user-admin-01", email: "admin@stridebase.com", name: "Super Admin", password: passwordHash, role: "admin", isEmailVerified: true }
  });

  const mitra1 = await prisma.user.create({ data: { id: "user-mitra-01", email: "budi.clean@example.com", name: "Budi Santoso", password: passwordHash, role: "mitra", isEmailVerified: true } });
  const mitra2 = await prisma.user.create({ data: { id: "user-mitra-02", email: "citra.shine@example.com", name: "Citra Lestari", password: passwordHash, role: "mitra", isEmailVerified: true } });
  const cust1 = await prisma.user.create({ data: { id: "user-customer-01", email: "siti.rahayu@example.com", name: "Siti Rahayu", password: passwordHash, role: "customer", isEmailVerified: true } });
  const cust2 = await prisma.user.create({ data: { id: "user-customer-02", email: "agus.wijaya@example.com", name: "Agus Wijaya", password: passwordHash, role: "customer", isEmailVerified: true } });
  
  console.log(`✅ [SEED] Pengguna berhasil dibuat: ${mitra1.email}, ${mitra2.email}, ${cust1.email}, ${cust2.email}`);
  
  await prisma.address.create({
    data: {
      userId: cust1.id,
      street: "Jl. Melati No. 123",
      city: "Jakarta Timur",
      province: "DKI Jakarta",
      postalCode: "13450",
      country: "Indonesia",
      isPrimary: true
    }
  });
  console.log("✅ [SEED] Alamat untuk customer berhasil dibuat.");

  // 2. BUAT DATA TOKO (STORES)
  console.log("🏪 [SEED] Membuat data toko...");
  const store1 = await prisma.store.create({
    data: {
      name: "CleanStep Express (PRO)",
      location: "Mall Grand Indonesia, Jakarta Pusat",
      description: "Layanan cuci sepatu premium dengan teknologi modern. Terletak di pusat perbelanjaan paling bergengsi di Jakarta.",
      ownerId: mitra1.id,
      storeStatus: "active",
      tier: "PRO",
      rating: 4.8,
      headerImageUrl: "https://images.unsplash.com/photo-1556906781-9a412961c28c?q=80&w=870&auto=format&fit=crop",
      // 'images' field DIHAPUS karena tidak ada di schema.prisma
      wallet: { create: {} }
    }
  });

  const store2 = await prisma.store.create({
    data: {
      name: "Citra Shine Shoes",
      location: "Jl. Pahlawan No. 45, Bandung",
      description: "Perawatan sepatu suede dan kulit terbaik di Bandung. Dikerjakan oleh tenaga ahli berpengalaman.",
      ownerId: mitra2.id,
      storeStatus: "active",
      tier: "BASIC",
      rating: 4.5,
      headerImageUrl: "https://images.unsplash.com/photo-1608231387042-89d0ac7c7895?q=80&w=870&auto=format&fit=crop",
      // 'images' field DIHAPUS
      wallet: { create: {} }
    }
  });

   const store3 = await prisma.store.create({
    data: {
      name: "Sneaker Station",
      location: "Jl. Pemuda No. 101, Semarang",
      description: "Pusat cuci dan unyellowing sepatu sneakers. Bikin sepatumu terlihat seperti baru lagi!",
      ownerId: mitra1.id,
      storeStatus: "pending",
      tier: "BASIC",
      rating: 0,
      wallet: { create: {} }
    }
  });
  console.log(`✅ [SEED] Toko berhasil dibuat: ${store1.name}, ${store2.name}, ${store3.name}`);

  // 3. BUAT DATA LAYANAN (SERVICES)
  console.log("🧼 [SEED] Membuat data layanan untuk setiap toko...");
  
  await prisma.service.createMany({
    data: [
      { name: "Fast Clean Sneakers", description: "Pembersihan cepat bagian luar dan midsole.", price: 50000, duration: 60, storeId: store1.id },
      { name: "Deep Clean Sneakers", description: "Pembersihan total luar, dalam, dan tali.", price: 85000, duration: 90, storeId: store1.id },
      { name: "Leather Care & Polish", description: "Perawatan khusus sepatu kulit agar kembali berkilau.", price: 95000, duration: 120, storeId: store1.id },
      { name: "Unyellowing Premium", description: "Menghilangkan noda kuning pada midsole sepatu.", price: 75000, duration: 120, storeId: store1.id },
      { name: "Suede & Nubuck Treatment", description: "Pembersihan kering khusus bahan suede.", price: 90000, duration: 120, storeId: store2.id },
      { name: "Standard Clean", description: "Pembersihan standar untuk semua jenis sepatu.", price: 40000, duration: 60, storeId: store2.id },
      { name: "Recoloring Kulit", description: "Mewarnai ulang sepatu kulit yang pudar.", price: 150000, duration: 180, storeId: store2.id },
    ]
  });

  console.log("✅ [SEED] Layanan berhasil dibuat untuk semua toko aktif.");
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