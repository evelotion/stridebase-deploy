const { PrismaClient } = require("@prisma/client");
const { faker } = require("@faker-js/faker");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

// Konfigurasi Jumlah Data
const NUM_RANDOM_USERS = 1000;
const NUM_STORES_TOTAL = 50; // Total toko yang diinginkan
const NUM_SERVICES_PER_STORE = 5;
const NUM_BOOKINGS = 1000;

async function main() {
  console.log("🌱 Starting seeding process...");

  // --------------------------------------------------------
  // 0. BERSIHKAN DATA LAMA
  // --------------------------------------------------------
  console.log("🧹 Cleaning old data...");

  // Level 1
  await prisma.walletTransaction.deleteMany();
  await prisma.ledgerEntry.deleteMany();
  await prisma.securityLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.platformEarning.deleteMany();

  // Level 2
  await prisma.payoutRequest.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.invoice.deleteMany();

  // Level 3
  await prisma.storeWallet.deleteMany();
  await prisma.storePromo.deleteMany();
  await prisma.approvalRequest.deleteMany();
  await prisma.review.deleteMany();

  // Level 4
  await prisma.booking.deleteMany();
  await prisma.service.deleteMany();
  await prisma.storeSchedule.deleteMany();

  // Level 5
  await prisma.store.deleteMany();
  await prisma.user.deleteMany();

  console.log("✨ Old data cleaned successfully.");

  // --------------------------------------------------------
  // 1. CREATE USERS
  // --------------------------------------------------------
  console.log(`👤 Creating users...`);
  const passwordHash = await bcrypt.hash("password123", 10);

  // A. Akun Utama (Fixed Accounts untuk Login)
  const fixedUsers = [
    {
      email: "developer@stridebase.com",
      name: "Super Developer",
      role: "developer",
      phone: "081111111111",
    },
    {
      email: "admin@stridebase.com",
      name: "Super Admin",
      role: "admin",
      phone: "082222222222",
    },
    {
      email: "mitra@stridebase.com",
      name: "Mitra Utama",
      role: "mitra",
      phone: "083333333333",
    },
    {
      email: "customer@stridebase.com",
      name: "Andi Customer",
      role: "customer",
      phone: "084444444444",
    },
  ];

  // Map data fixed users agar punya struktur lengkap
  const fixedUsersData = fixedUsers.map((u) => ({
    ...u,
    password: passwordHash,
    isEmailVerified: true,
    createdAt: new Date(),
  }));

  // B. Random Users
  // Kita butuh (NUM_STORES_TOTAL - 1) mitra tambahan (karena 1 sudah di fixed)
  const numRandomMitras = NUM_STORES_TOTAL - 1;
  const numRandomCustomers = NUM_RANDOM_USERS - numRandomMitras;

  const randomMitras = Array.from({ length: numRandomMitras }).map(() => ({
    email: faker.internet.email(),
    name: faker.person.fullName(),
    password: passwordHash,
    role: "mitra",
    phone: faker.phone.number(),
    isEmailVerified: true,
    createdAt: faker.date.past(),
  }));

  const randomCustomers = Array.from({ length: numRandomCustomers }).map(() => ({
    email: faker.internet.email(),
    name: faker.person.fullName(),
    password: passwordHash,
    role: "customer",
    phone: faker.phone.number(),
    isEmailVerified: true,
    createdAt: faker.date.past(),
  }));

  // Gabungkan semua user & Insert
  const allUsersData = [...fixedUsersData, ...randomMitras, ...randomCustomers];
  await prisma.user.createMany({ data: allUsersData });

  console.log(`✅ ${allUsersData.length} Users created.`);

  // --------------------------------------------------------
  // 2. CREATE STORES (Hanya untuk Role Mitra)
  // --------------------------------------------------------
  
  // Ambil semua user dengan role 'mitra' yang baru saja dibuat
  const mitras = await prisma.user.findMany({ where: { role: "mitra" } });
  
  console.log(`🏪 Creating stores for ${mitras.length} partners...`);

  for (const mitra of mitras) {
    // Nama toko sedikit beda untuk akun fixed agar mudah dikenali
    const isFixedMitra = mitra.email === "mitra@stridebase.com";
    const storeName = isFixedMitra 
      ? "StrideBase Official Partner" 
      : `${faker.company.name()} Shoes Care`;

    await prisma.store.create({
      data: {
        name: storeName,
        location: faker.location.city(),
        description: faker.lorem.paragraph(),
        ownerId: mitra.id,
        storeStatus: "active",
        rating: faker.number.float({ min: 3.5, max: 5.0, precision: 0.1 }),
        headerImageUrl:
          "https://images.unsplash.com/photo-1556906781-9a412961c28c?q=80&w=2070&auto=format&fit=crop",
        images: [
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
          "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=800",
        ],
        wallet: {
          create: {
            balance: faker.number.int({ min: 100000, max: 5000000 }),
          },
        },
        services: {
          create: Array.from({ length: NUM_SERVICES_PER_STORE }).map(() => ({
            name: faker.helpers.arrayElement([
              "Deep Clean",
              "Fast Clean",
              "Unyellowing",
              "Repaint",
              "Repair",
            ]),
            description: faker.lorem.sentence(),
            price: faker.number.float({
              min: 30000,
              max: 250000,
              precision: 1000,
            }),
            shoeType: "All Types",
            duration: faker.number.int({ min: 30, max: 120 }),
          })),
        },
        schedules: {
          create: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ].map((day) => ({
            dayOfWeek: day,
            openTime: "08:00",
            closeTime: "21:00",
            isClosed: day === "Sunday",
          })),
        },
      },
    });
  }
  console.log("✅ Stores, Services & Wallets created.");

  // --------------------------------------------------------
  // 3. CREATE BOOKINGS
  // --------------------------------------------------------
  console.log(`📅 Creating ${NUM_BOOKINGS} bookings...`);

  // Ambil semua customer (kecuali admin/developer/mitra)
  const customers = await prisma.user.findMany({ where: { role: "customer" } });
  const allStores = await prisma.store.findMany({
    include: { services: true },
  });

  for (let i = 0; i < NUM_BOOKINGS; i++) {
    const randomUser = faker.helpers.arrayElement(customers);
    const randomStore = faker.helpers.arrayElement(allStores);

    if (!randomStore.services || randomStore.services.length === 0) continue;

    const randomService = faker.helpers.arrayElement(randomStore.services);
    const status = faker.helpers.arrayElement([
      "pending",
      "confirmed",
      "completed",
      "cancelled",
    ]);
    const isCompleted = status === "completed";

    await prisma.booking.create({
      data: {
        userId: randomUser.id,
        storeId: randomStore.id,
        serviceId: randomService.id,
        serviceName: randomService.name,
        deliveryOption: "pickup",
        totalPrice: randomService.price,
        status: status,
        workStatus: isCompleted ? "completed" : "in_progress",
        scheduleDate: faker.date.future(),

        payment: {
          create: {
            amount: randomService.price,
            status: isCompleted ? "paid" : "pending",
            paymentMethod: "bank_transfer",
            midtransOrderId: `ORDER-${faker.string.nanoid(10)}`,
          },
        },

        review:
          isCompleted && Math.random() > 0.3
            ? {
                create: {
                  userId: randomUser.id,
                  userName: randomUser.name,
                  storeId: randomStore.id,
                  rating: faker.number.int({ min: 3, max: 5 }),
                  comment: faker.lorem.sentence(),
                },
              }
            : undefined,
      },
    });
  }

  console.log("✅ Bookings, Payments, & Reviews created.");

  // --------------------------------------------------------
  // 4. CREATE PROMOS (Data Dummy Baru)
  // --------------------------------------------------------
  console.log(`🎟️ Creating Promos...`);

  const promoData = [
    {
      code: "BARU2025",
      description: "Diskon pengguna baru tahun 2025",
      discountType: "PERCENTAGE", // Sesuai dengan tipe String di schema
      value: 20, // 20%
      minTransaction: 50000,
      forNewUser: true,
    },
    {
      code: "FLAT10K",
      description: "Potongan langsung 10rb",
      discountType: "FIXED_AMOUNT",
      value: 10000,
      minTransaction: 100000,
      forNewUser: false,
    },
    {
      code: "LEBARAN",
      description: "Promo spesial lebaran cuci sepatu",
      discountType: "PERCENTAGE",
      value: 50,
      minTransaction: 0,
      forNewUser: false,
    },
  ];

  for (const p of promoData) {
    // 1. Buat Master Promo
    const createdPromo = await prisma.promo.create({
      data: {
        code: p.code,
        description: p.description,
        discountType: p.discountType,
        value: p.value,
        startDate: faker.date.recent(), // Mulai beberapa hari lalu
        endDate: faker.date.future(),   // Berakhir di masa depan
        usageLimit: 100,
        usageCount: faker.number.int({ min: 0, max: 50 }),
        minTransaction: p.minTransaction,
        forNewUser: p.forNewUser,
        status: "active",
      },
    });

    // 2. Hubungkan Promo ke Beberapa Toko Acak (StorePromo)
    // Misalnya setiap promo berlaku di 5 toko acak
    const randomStoresForPromo = faker.helpers.arrayElements(allStores, 5);
    
    for (const store of randomStoresForPromo) {
      await prisma.storePromo.create({
        data: {
          storeId: store.id,
          promoId: createdPromo.id,
          redeemed: faker.number.int({ min: 0, max: 20 }),
        },
      });
    }
  }
  
  console.log("✅ Promos & StorePromos created.");
  
  // --------------------------------------------------------
  // SUMMARY LOGIN
  // --------------------------------------------------------
  console.log("\n=============================================");
  console.log("🚀 SEEDING SELESAI! SILAKAN LOGIN DENGAN:");
  console.log("---------------------------------------------");
  console.log("🔑 PASSWORD SEMUA AKUN: password123");
  console.log("---------------------------------------------");
  console.log("1. DEVELOPER : developer@stridebase.com");
  console.log("2. ADMIN     : admin@stridebase.com");
  console.log("3. MITRA     : mitra@stridebase.com");
  console.log("4. CUSTOMER  : customer@stridebase.com");
  console.log("=============================================\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });