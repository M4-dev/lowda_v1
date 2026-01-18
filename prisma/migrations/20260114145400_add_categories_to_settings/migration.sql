-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "categories" TEXT[] DEFAULT ARRAY[]::TEXT[];
