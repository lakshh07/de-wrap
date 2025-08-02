/*
  Warnings:

  - Added the required column `amount` to the `Invoice` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
-- First add the amount column as nullable
ALTER TABLE "public"."Invoice" ADD COLUMN     "amount" TEXT;

-- Populate the amount field with data from amount_in_cents
UPDATE "public"."Invoice" SET "amount" = "amount_in_cents" WHERE "amount" IS NULL;

-- Now make the amount column required
ALTER TABLE "public"."Invoice" ALTER COLUMN "amount" SET NOT NULL;

-- Make amount_in_cents nullable
ALTER TABLE "public"."Invoice" ALTER COLUMN "amount_in_cents" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."Payout" ADD COLUMN     "amount_left" TEXT,
ADD COLUMN     "amount_paid" TEXT;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "total_withdrawn" TEXT;
