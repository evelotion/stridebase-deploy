// File: server/prisma/seed.cjs

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const { faker } = require("@faker-js/faker");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Start seeding database to Neon/Production...");

  // 1. BERSIHKAN DATABASE
  // Kita pakai deleteMany() agar aman
  await prisma.notification.deleteMany();
  await prisma.securityLog.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.platformEarning.deleteMany();
  await prisma.walletTransaction.deleteMany();
  await prisma.payoutRequest.deleteMany();
  await prisma.ledgerEntry.deleteMany();
  await prisma.review.deleteMany();
  await prisma.approvalRequest.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.storeSchedule.deleteMany();
  await prisma.storePromo.deleteMany();
  await prisma.promo.deleteMany();
  await prisma.service.deleteMany();
  await prisma.storeWallet.deleteMany();
  await prisma.store.deleteMany();
  await prisma.address.deleteMany();
  await prisma.loyaltyPoint.deleteMany();
  await prisma.user.deleteMany();

  console.log("🧹 Database cleaned.");

  // 2. SETUP PASSWORD HASH
  const password = await bcrypt.hash("password123", 10);

  // 3. BUAT USER UTAMA (FIXED ACCOUNTS)
  const developer = await prisma.user.create({
    data: {
      name: "Indra Developer",
      email: "dev@stridebase.com",
      password,
      role: "developer",
      isEmailVerified: true,
      status: "active",
    },
  });

  const admin = await prisma.user.create({
    data: {
      name: "Super Admin",
      email: "admin@stridebase.com",
      password,
      role: "admin",
      isEmailVerified: true,
      status: "active",
    },
  });

  const demoPartner = await prisma.user.create({
    data: {
      name: "Mitra Sukses",
      email: "partner@stridebase.com",
      password,
      role: "mitra", // Sesuai enum UserRole
      isEmailVerified: true,
      status: "active",
    },
  });

  const demoUser = await prisma.user.create({
    data: {
      name: "Budi Customer",
      email: "user@stridebase.com",
      password,
      role: "customer",
      isEmailVerified: true,
      status: "active",
    },
  });

  console.log("✅ Main users created (Pass: password123)");

  // 4. BUAT 20 USER TAMBAHAN
  const users = [];
  for (let i = 0; i < 20; i++) {
    const role = i < 10 ? "mitra" : "customer";

    const user = await prisma.user.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        password,
        role: role,
        phone: faker.phone.number("08##########"),
        isEmailVerified: true,
        status: "active",
        addresses: {
          create: {
            street: faker.location.streetAddress(),
            city: "Jakarta",
            province: "DKI Jakarta",
            postalCode: faker.location.zipCode(),
            country: "Indonesia",
            recipientName: faker.person.fullName(),
            phoneNumber: faker.phone.number("08##########"),
            isPrimary: true,
          },
        },
      },
    });
    users.push(user);
  }

  // Pisahkan list partner dan customer
  const allPartners = users.filter((u) => u.role === "mitra");
  allPartners.push(demoPartner);

  const allCustomers = users.filter((u) => u.role === "customer");
  allCustomers.push(demoUser);

  console.log(`✅ ${users.length} Random users created.`);

  // 5. BUAT TOKO (STORE)
  const stores = [];
  for (const partner of allPartners) {
    const storeName = faker.company.name() + " Shoes Care";

    // Create Store
    const store = await prisma.store.create({
      data: {
        name: storeName,
        description: faker.lorem.paragraph(),
        location: faker.location.streetAddress() + ", Jakarta Selatan",
        images: [faker.image.url(), faker.image.url()],
        headerImageUrl: faker.image.url(),
        ownerId: partner.id,
        storeStatus: "active",
        tier: "PRO",
        rating: 0,
        commissionRate: 10.0,

        // --- PERBAIKAN DI SINI ---
        // Di schema namanya 'wallet', bukan 'storeWallet'
        wallet: {
          create: {
            balance: faker.number.int({ min: 100000, max: 5000000 }),
          },
        },
      },
    });
    stores.push(store);

    // Create Services
    const servicesList = [
      { name: "Deep Clean", price: 50000, desc: "Cuci mendalam" },
      { name: "Fast Clean", price: 30000, desc: "Cuci cepat" },
      { name: "Repaint Full", price: 150000, desc: "Cat ulang" },
    ];

    for (let j = 0; j < 3; j++) {
      const svc = servicesList[j];
      await prisma.service.create({
        data: {
          name: svc.name,
          description: svc.desc,
          price: svc.price,
          duration: 60 * (j + 1),
          storeId: store.id,
          shoeType: "All Types",
        },
      });
    }
  }
  console.log(`✅ ${stores.length} Stores & Services created.`);

  // 6. BUAT BOOKING (TRANSAKSI)
  const bookings = [];
  const statuses = [
    "pending",
    "confirmed",
    "in_progress",
    "completed",
    "cancelled",
  ];

  for (let i = 0; i < 40; i++) {
    const randomStore = stores[Math.floor(Math.random() * stores.length)];
    const servicesInStore = await prisma.service.findMany({
      where: { storeId: randomStore.id },
    });
    if (servicesInStore.length === 0) continue;

    const randomService =
      servicesInStore[Math.floor(Math.random() * servicesInStore.length)];
    const randomCustomer =
      allCustomers[Math.floor(Math.random() * allCustomers.length)];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

    const booking = await prisma.booking.create({
      data: {
        userId: randomCustomer.id,
        storeId: randomStore.id,
        serviceId: randomService.id,
        serviceName: randomService.name,
        deliveryOption: "drop_off",
        totalPrice: randomService.price,
        status: randomStatus,
        notes: faker.lorem.sentence(),
      },
    });

    // Jika COMPLETED, buat Review
    if (randomStatus === "completed") {
      await prisma.review.create({
        data: {
          userId: randomCustomer.id,
          userName: randomCustomer.name,
          storeId: randomStore.id,
          bookingId: booking.id,
          rating: faker.number.int({ min: 3, max: 5 }),
          comment: faker.lorem.sentence(),
        },
      });
    }

    bookings.push(booking);
  }

  console.log(`✅ ${bookings.length} Bookings & Reviews created.`);

  // 7. RECALCULATE RATINGS
  console.log("🔄 Recalculating store ratings...");
  const storesToUpdate = await prisma.store.findMany({
    include: { reviews: true },
  });

  for (const store of storesToUpdate) {
    if (store.reviews.length > 0) {
      const totalRating = store.reviews.reduce((sum, r) => sum + r.rating, 0);
      const avg = totalRating / store.reviews.length;
      await prisma.store.update({
        where: { id: store.id },
        data: { rating: parseFloat(avg.toFixed(1)) },
      });
    }
  }

  console.log("🎉 Seeding finished successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
