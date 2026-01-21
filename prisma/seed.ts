import bcrypt from "bcryptjs";
import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function seedAdmin() {
  try {
    const email = "admin@lowda.com";
    const password = "lowdaAdmin123_`";
    const name = "Admin User";
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({ where: { email } });
    if (existingAdmin) {
      console.log("Admin user already exists. Skipping.");
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        name,
        email,
        hashedPassword,
        role: Role.ADMIN,
      },
    });
    console.log("✓ Admin user created successfully!");
    console.log(`  Email: ${email}`);
    console.log(`  Password: ${password}`);
    console.log(`  Role: ADMIN`);
  } catch (error) {
    console.error("Error seeding admin user:", error);
    process.exit(1);
  }
}


// Only seed admin user for PostgreSQL
async function main() {
  await seedAdmin();
  await prisma.$disconnect();
}

main();
