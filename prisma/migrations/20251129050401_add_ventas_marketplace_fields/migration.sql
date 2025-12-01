/*
  Warnings:

  - You are about to drop the column `destacado` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `ubicacion` on the `Property` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Property" DROP COLUMN "destacado",
DROP COLUMN "ubicacion",
ADD COLUMN     "color" TEXT,
ADD COLUMN     "estado" TEXT,
ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "marca" TEXT,
ADD COLUMN     "metro" TEXT,
ADD COLUMN     "modelo" TEXT,
ADD COLUMN     "stock" INTEGER,
ADD COLUMN     "street" TEXT;
