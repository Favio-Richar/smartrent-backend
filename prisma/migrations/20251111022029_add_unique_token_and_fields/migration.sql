/*
  Warnings:

  - A unique constraint covering the columns `[token]` on the table `SubscriptionPayment` will be added. If there are existing duplicate values, this will fail.
  - Made the column `token` on table `SubscriptionPayment` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "SubscriptionPayment" ADD COLUMN     "authorizationCode" TEXT,
ADD COLUMN     "cardLast4" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3),
ALTER COLUMN "token" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionPayment_token_key" ON "SubscriptionPayment"("token");
