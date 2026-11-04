-- CreateEnum
CREATE TYPE "AdminPermission" AS ENUM ('MANAGE_USERS', 'REVIEW_REQUESTS', 'MANAGE_DONATIONS', 'VIEW_NOTIFICATIONS');

-- AlterTable
ALTER TABLE "User"
    ADD COLUMN "isSuperAdmin" BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN "permissions" "AdminPermission"[] DEFAULT ARRAY[]::"AdminPermission"[];

-- Backfill existing admins with every permission so current behaviour is preserved.
UPDATE "User"
SET "permissions" = ARRAY[
    'MANAGE_USERS',
    'REVIEW_REQUESTS',
    'MANAGE_DONATIONS',
    'VIEW_NOTIFICATIONS'
]::"AdminPermission"[]
WHERE "role" = 'ADMIN';
