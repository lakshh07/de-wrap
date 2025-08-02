-- CreateEnum
CREATE TYPE "public"."MetricType" AS ENUM ('BALANCE', 'INVESTMENT');

-- CreateTable
CREATE TABLE "public"."UserMetric" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "public"."MetricType" NOT NULL,
    "value" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserMetric_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserMetric_user_id_type_timestamp_idx" ON "public"."UserMetric"("user_id", "type", "timestamp");

-- AddForeignKey
ALTER TABLE "public"."UserMetric" ADD CONSTRAINT "UserMetric_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
