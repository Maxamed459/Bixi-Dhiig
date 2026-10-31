-- CreateEnum
CREATE TYPE "BloodType" AS ENUM ('A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE');

-- CreateEnum
CREATE TYPE "UrgencyLevel" AS ENUM ('NORMAL', 'URGENT', 'CRITICAL');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'FULFILLED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DonationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'COMPLETED', 'DECLINED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('WHATSAPP', 'EMAIL');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('SENT', 'FAILED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "phone" TEXT,
ADD COLUMN     "bloodType" "BloodType",
ADD COLUMN     "city" TEXT,
ADD COLUMN     "receiveAlerts" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_bloodType_city_idx" ON "User"("bloodType", "city");

-- CreateTable
CREATE TABLE "BloodRequest" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "requesterId" UUID NOT NULL,
    "patientName" TEXT NOT NULL,
    "bloodType" "BloodType" NOT NULL,
    "unitsNeeded" INTEGER NOT NULL DEFAULT 1,
    "unitsFulfilled" INTEGER NOT NULL DEFAULT 0,
    "urgency" "UrgencyLevel" NOT NULL DEFAULT 'NORMAL',
    "hospitalName" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "address" TEXT,
    "contactPhone" TEXT NOT NULL,
    "notes" TEXT,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "approvedById" UUID,
    "approvedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BloodRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BloodRequest_status_idx" ON "BloodRequest"("status");

-- CreateIndex
CREATE INDEX "BloodRequest_bloodType_city_status_idx" ON "BloodRequest"("bloodType", "city", "status");

-- CreateIndex
CREATE INDEX "BloodRequest_requesterId_idx" ON "BloodRequest"("requesterId");

-- CreateTable
CREATE TABLE "Donation" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "donorId" UUID NOT NULL,
    "bloodRequestId" UUID NOT NULL,
    "unitsOffered" INTEGER NOT NULL DEFAULT 1,
    "status" "DonationStatus" NOT NULL DEFAULT 'PENDING',
    "confirmedById" UUID,
    "scheduledAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Donation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Donation_donorId_bloodRequestId_key" ON "Donation"("donorId", "bloodRequestId");

-- CreateIndex
CREATE INDEX "Donation_status_idx" ON "Donation"("status");

-- CreateIndex
CREATE INDEX "Donation_bloodRequestId_idx" ON "Donation"("bloodRequestId");

-- CreateIndex
CREATE INDEX "Donation_donorId_idx" ON "Donation"("donorId");

-- CreateTable
CREATE TABLE "NotificationLog" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID,
    "channel" "NotificationChannel" NOT NULL,
    "event" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "status" "NotificationStatus" NOT NULL,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificationLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NotificationLog_userId_idx" ON "NotificationLog"("userId");

-- CreateIndex
CREATE INDEX "NotificationLog_event_idx" ON "NotificationLog"("event");

-- AddForeignKey
ALTER TABLE "BloodRequest" ADD CONSTRAINT "BloodRequest_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BloodRequest" ADD CONSTRAINT "BloodRequest_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_bloodRequestId_fkey" FOREIGN KEY ("bloodRequestId") REFERENCES "BloodRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_confirmedById_fkey" FOREIGN KEY ("confirmedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
