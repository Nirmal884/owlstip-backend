import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@owlstip.com";
  const rawPassword = "admin123";

  console.log("🌱 Database Seeding: Creating default Administrator account...");

  // Generate secure password hash
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(rawPassword, salt);

  // Upsert admin to prevent duplicate seeding errors
  const admin = await prisma.admin.upsert({
    where: { email },
    update: {
      password: hashedPassword,
    },
    create: {
      email,
      password: hashedPassword,
    },
  });

  console.log(`===============================================`);
  console.log(`✅ Default Admin Seeding Completed successfully.`);
  console.log(`📧 Email: ${admin.email}`);
  console.log(`🔑 Password: ${rawPassword}`);
  console.log(`===============================================`);
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed with error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
