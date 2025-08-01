/*
  Warnings:

  - Added the required column `name` to the `Invoice` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Invoice" ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Payout" ADD COLUMN     "metadata" JSONB,
ALTER COLUMN "amount_paid_in_cents" DROP NOT NULL,
ALTER COLUMN "source_token" DROP NOT NULL,
ALTER COLUMN "token_price" DROP NOT NULL,
ALTER COLUMN "source_chain" DROP NOT NULL;
