-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "auto_swap" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "onboarded" BOOLEAN NOT NULL DEFAULT false;
