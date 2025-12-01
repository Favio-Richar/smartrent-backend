/*
  Warnings:

  - Made the column `userId` on table `Venta` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Venta" DROP CONSTRAINT "Venta_userId_fkey";

-- AlterTable
ALTER TABLE "Venta" ALTER COLUMN "userId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Venta" ADD CONSTRAINT "Venta_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
