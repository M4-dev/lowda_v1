-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "adminConfirmedAvailability" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "adminConfirmedAvailabilityAt" TIMESTAMP(3);
