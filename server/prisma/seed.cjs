// File: stridebase-app/server/prisma/seed.cjs

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

// Helper untuk membuat tanggal di masa lalu atau masa depan
const daysAgo = (days) => new Date(new Date().setDate(new Date().getDate() - days));
const daysLater = (days) => new Date(new Date().setDate(new Date().getDate() + days));

async function main() {
  console.log("🚀 Start seeding comprehensive dummy data...");

  // Hapus data lama untuk memastikan seeding yang bersih
  console.log("🔥 Deleting old data...");
  await prisma.notification.deleteMany();
  await prisma.pointTransaction.deleteMany();
  await prisma.loyaltyPoint.deleteMany();
  await prisma.approvalRequest.deleteMany();
  await prisma.review.deleteMany();
  await prisma.platformEarning.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.service.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.store.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();
  await prisma.promo.deleteMany();
  await prisma.banner.deleteMany();
  console.log("✅ Old data deleted.");

  // =================================================================
  // 1. SEED PENGGUNA (USERS) DENGAN SEMUA PERAN
  // =================================================================
  console.log("👤 Seeding users...");
  const passwordHash = await bcrypt.hash("password123", 10);

  const users = await prisma.user.createManyAndReturn({
    data: [
      { id: "user-dev-01", email: "developer@stridebase.com", name: "Developer Stride", password: passwordHash, role: "developer" },
      { id: "user-admin-01", email: "admin@stridebase.com", name: "Super Admin", password: passwordHash, role: "admin" },
      { id: "user-mitra-01", email: "budi.clean@example.com", name: "Budi Santoso", password: passwordHash, role: "mitra" },
      { id: "user-mitra-02", email: "ani.laundry@example.com", name: "Ani Wijaya", password: passwordHash, role: "mitra" },
      { id: "user-mitra-03", email: "tono.shoes@example.com", name: "Tono Stark", password: passwordHash, role: "mitra" },
      { id: "user-mitra-04", email: "dina.kicks@example.com", name: "Dina Kicks", password: passwordHash, role: "mitra" },
      { id: "user-customer-01", email: "siti.rahayu@example.com", name: "Siti Rahayu", password: passwordHash, role: "customer" },
      { id: "user-customer-02", email: "agus.wijoyo@example.com", name: "Agus Wijoyo", password: passwordHash, role: "customer" },
    ],
  });
  console.log(`✅ ${users.length} users created.`);

  // =================================================================
  // 2. SEED ALAMAT UNTUK CUSTOMER
  // =================================================================
  console.log("🏠 Seeding addresses...");
  await prisma.address.createMany({
    data: [
      { id: "addr-siti-01", userId: "user-customer-01", label: "Rumah", recipientName: "Siti Rahayu", phoneNumber: "081234567890", fullAddress: "Jl. Merdeka No. 17", city: "Jakarta Pusat", postalCode: "10110", isPrimary: true },
      { id: "addr-agus-01", userId: "user-customer-02", label: "Kantor", recipientName: "Agus Wijoyo", phoneNumber: "081987654321", fullAddress: "Gedung Cyber 2 Lt. 18, Jl. H.R. Rasuna Said", city: "Jakarta Selatan", postalCode: "12950", isPrimary: true },
    ]
  });
  console.log("✅ 2 addresses created.");

  // =================================================================
  // 3. SEED 4 TOKO (STORES) UNTUK PARA MITRA
  // =================================================================
  console.log("🏪 Seeding stores...");
  const stores = await prisma.store.createManyAndReturn({
    data: [
      { id: "store-01-pro", name: "CleanStep Express (PRO)", location: "Mall Grand Indonesia, Jakarta", ownerId: "user-mitra-01", storeStatus: "active", tier: "PRO", billingType: "INVOICE", commissionRate: 0, isFeatured: true, rating: 4.8, images: ["https://res.cloudinary.com/divbjgs3g/image/upload/v1/stridebase_assets/image-1752427316280.jpg"], latitude: -6.1954, longitude: 106.8221 },
      { id: "store-02-basic", name: "Ani Shoe Laundry (BASIC)", location: "Jl. Dago No. 123, Bandung", ownerId: "user-mitra-02", storeStatus: "active", tier: "BASIC", billingType: "COMMISSION", commissionRate: 12.5, isFeatured: false, rating: 4.5, images: ["https://res.cloudinary.com/divbjgs3g/image/upload/v1/stridebase_assets/image-1752427316280.jpg"], latitude: -6.8943, longitude: 107.6111 },
      { id: "store-03-pending", name: "Tono's Premium Care", location: "Jl. Malioboro, Yogyakarta", ownerId: "user-mitra-03", storeStatus: "pending", tier: "BASIC", billingType: "COMMISSION", commissionRate: 10, isFeatured: false, rating: 0, images: ["https://res.cloudinary.com/divbjgs3g/image/upload/v1/stridebase_assets/image-1752427316280.jpg"], latitude: -7.7928, longitude: 110.3659 },
      { id: "store-04-inactive", name: "Dina Kicks (Nonaktif)", location: "Jl. Basuki Rahmat, Surabaya", ownerId: "user-mitra-04", storeStatus: "inactive", tier: "BASIC", billingType: "COMMISSION", commissionRate: 10, isFeatured: false, rating: 4.2, images: ["https://res.cloudinary.com/divbjgs3g/image/upload/v1/stridebase_assets/image-1752427316280.jpg"], latitude: -7.2657, longitude: 112.7399 },
    ]
  });
  console.log(`✅ ${stores.length} stores created.`);

  // =================================================================
  // 4. SEED LAYANAN (SERVICES) UNTUK TOKO YANG AKTIF
  // =================================================================
  console.log("🧼 Seeding services...");
  const services = await prisma.service.createManyAndReturn({
    data: [
      { storeId: "store-01-pro", name: "Fast Clean Sneakers", price: 50000, shoeType: "sneakers" },
      { storeId: "store-01-pro", name: "Deep Clean Leather", price: 85000, shoeType: "kulit" },
      { storeId: "store-02-basic", name: "Cuci Cepat Reguler", price: 35000, shoeType: "sneakers" },
      { storeId: "store-02-basic", name: "Perawatan Suede", price: 60000, shoeType: "suede" },
    ]
  });
  console.log(`✅ ${services.length} services created.`);

  // =================================================================
  // 5. SEED BOOKING (TRANSAKSI)
  // =================================================================
  console.log("🧾 Seeding bookings...");
  const bookings = await prisma.booking.createManyAndReturn({
    data: [
      { id: "booking-01-reviewed", userId: "user-customer-01", storeId: "store-01-pro", serviceName: "Fast Clean Sneakers", totalPrice: 52000, status: "Reviewed", workStatus: "READY_FOR_PICKUP", scheduleDate: daysAgo(10) },
      { id: "booking-02-completed", userId: "user-customer-02", storeId: "store-01-pro", serviceName: "Deep Clean Leather", totalPrice: 87000, status: "Completed", workStatus: "READY_FOR_PICKUP", scheduleDate: daysAgo(3) },
      { id: "booking-03-processing", userId: "user-customer-01", storeId: "store-02-basic", serviceName: "Perawatan Suede", totalPrice: 72000, status: "Processing", workStatus: "WASHING", scheduleDate: daysAgo(1), deliveryOption: "pickup", deliveryFee: 10000, addressId: "addr-siti-01" },
    ]
  });
  console.log(`✅ ${bookings.length} bookings created.`);

  // =================================================================
  // 6. SEED PEMBAYARAN & PLATFORM EARNINGS
  // =================================================================
  console.log("💳 Seeding payments & earnings...");
  await prisma.payment.createMany({
    data: [
      { bookingId: "booking-01-reviewed", amount: 52000, status: "SUCCESS", provider: "Midtrans" },
      { bookingId: "booking-02-completed", amount: 87000, status: "SUCCESS", provider: "Midtrans" },
      { bookingId: "booking-03-processing", amount: 72000, status: "SUCCESS", provider: "Midtrans" },
    ]
  });
  await prisma.platformEarning.create({ data: { bookingId: "booking-03-processing", storeId: "store-02-basic", grossAmount: 72000, commissionRate: 12.5, earnedAmount: 72000 * 0.125 } });
  console.log("✅ Payments and earnings seeded.");

  // =================================================================
  // 7. SEED ULASAN (REVIEWS)
  // =================================================================
  console.log("⭐ Seeding reviews...");
  await prisma.review.create({
    data: {
      id: "review-to-delete-id",
      bookingId: "booking-01-reviewed",
      userId: "user-customer-01",
      storeId: "store-01-pro",
      userName: "Siti Rahayu",
      rating: 5,
      comment: "Pelayanannya cepat dan hasilnya bersih sekali!"
    }
  });
  console.log("✅ 1 review created.");

  // =================================================================
  // 8. SEED INVOICES & PERMINTAAN PERSETUJUAN (APPROVAL)
  // =================================================================
  console.log("📄🔔 Seeding invoices and approval requests...");
  const invoice = await prisma.invoice.create({ data: { storeId: "store-01-pro", invoiceNumber: `INV-${new Date().getFullYear()}-00001`, dueDate: daysLater(14), status: "SENT", totalAmount: 99000, notes: "Tagihan langganan StrideBase PRO." } });
  await prisma.invoiceItem.create({ data: { invoiceId: invoice.id, description: "Langganan StrideBase PRO", quantity: 1, unitPrice: 99000, total: 99000 } });
  await prisma.approvalRequest.create({
    data: {
      requestedById: "user-admin-01",
      actionType: "DELETE_REVIEW",
      payload: { reviewId: "review-to-delete-id", comment: "Ulasan ini mengandung SARA." },
      status: "PENDING",
    }
  });
  console.log("✅ Invoices and approval requests seeded.");

  console.log("🎉 Seeding promos and banners...");
  await prisma.promo.create({ data: { code: "STRIDEBARU", description: "Diskon 15% untuk pengguna baru!", discountType: "percentage", value: 15, forNewUser: true, minTransaction: 50000 } });
  await prisma.banner.create({ data: { imageUrl: "https://res.cloudinary.com/divbjgs3g/image/upload/v1/stridebase_assets/asset-1752737852107.png", linkUrl: "/store" } });
  console.log("✅ Promos and banners seeded.");

  console.log("✅ Seeding finished successfully!");
}

main()
  .catch((e) => {
    console.error("❌ An error occurred during seeding:", e);
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });