/*
  Warnings:

  - A unique constraint covering the columns `[userId,ventaId]` on the table `FavoritoVenta` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "FavoritoVenta_ventaId_userId_key";

-- CreateIndex
CREATE UNIQUE INDEX "FavoritoVenta_userId_ventaId_key" ON "FavoritoVenta"("userId", "ventaId");
