/*
  Warnings:

  - The values [GITHUB,APPLE] on the enum `AuthProvider` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN', 'HOSPITAL');

-- AlterEnum
BEGIN;
CREATE TYPE "AuthProvider_new" AS ENUM ('PASSWORD', 'GOOGLE');
ALTER TABLE "OauthAccount" ALTER COLUMN "provider" TYPE "AuthProvider_new" USING ("provider"::text::"AuthProvider_new");
ALTER TYPE "AuthProvider" RENAME TO "AuthProvider_old";
ALTER TYPE "AuthProvider_new" RENAME TO "AuthProvider";
DROP TYPE "public"."AuthProvider_old";
COMMIT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER';
