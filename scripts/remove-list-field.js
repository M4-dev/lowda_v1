// Script to remove the 'list' field from all products using Prisma (PostgreSQL)
// This script assumes the 'list' field is no longer in your schema, but old data may still exist in the database as a column.
// It will drop the 'list' column from the Product table if it exists.

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function removeListField() {
  try {
    // Remove the 'list' column from the Product table if it exists
    // This requires a raw SQL command because Prisma schema no longer has 'list'
    await prisma.$executeRawUnsafe(`ALTER TABLE "Product" DROP COLUMN IF EXISTS list`);
    console.log("'list' column removed from Product table (if it existed).");
  } catch (error) {
    console.error('Error removing list column:', error);
  } finally {
    await prisma.$disconnect();
  }
}

removeListField();
