-- AlterTable
ALTER TABLE "public"."Invoice" ALTER COLUMN "amount_in_cents" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "public"."Payout" ALTER COLUMN "amount_paid_in_cents" SET DATA TYPE TEXT,
ALTER COLUMN "token_price" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "total_balance" TEXT;
