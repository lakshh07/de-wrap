/*
  Warnings:

  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[clerk_id]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `clerk_id` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "name",
DROP COLUMN "password",
ADD COLUMN     "clerk_id" TEXT NOT NULL,
ADD COLUMN     "first_name" TEXT,
ADD COLUMN     "image_url" TEXT,
ADD COLUMN     "last_name" TEXT,
ADD COLUMN     "preferred_chain" INTEGER,
ADD COLUMN     "preferred_token" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_clerk_id_key" ON "public"."User"("clerk_id");
