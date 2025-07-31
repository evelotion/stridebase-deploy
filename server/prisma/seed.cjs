// File: server/prisma/seed.cjs (Versi Super Ringan)
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Starting SUPER LIGHT seeding for Render...");

  console.log("🔥 Deleting old user data...");
  await prisma.user.deleteMany();
  console.log("✅ Users deleted.");

  console.log("👤 Seeding essential admin and dev users...");
  const passwordHash = await bcrypt.hash("password123", 10);

  await prisma.user.createMany({
    data: [
      {
        id: "user-dev-01",
        email: "developer@stridebase.com",
        name: "Developer Stride",
        password: passwordHash,
        role: "developer",
      },
      {
        id: "user-admin-01",
        email: "admin@stridebase.com",
        name: "Super Admin",
        password: passwordHash,
        role: "admin",
      },
    ],
  });
  console.log("✅ 2 essential users created.");
  console.log("🎉 Super light seeding finished successfully!");
}

main()
  .catch((e) => {
    console.error("❌ An error occurred during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
