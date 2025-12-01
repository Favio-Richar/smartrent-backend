-- CreateTable
CREATE TABLE "FavoritoVenta" (
    "id" SERIAL NOT NULL,
    "ventaId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FavoritoVenta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FavoritoVenta_ventaId_idx" ON "FavoritoVenta"("ventaId");

-- CreateIndex
CREATE INDEX "FavoritoVenta_userId_idx" ON "FavoritoVenta"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "FavoritoVenta_ventaId_userId_key" ON "FavoritoVenta"("ventaId", "userId");

-- AddForeignKey
ALTER TABLE "FavoritoVenta" ADD CONSTRAINT "FavoritoVenta_ventaId_fkey" FOREIGN KEY ("ventaId") REFERENCES "Venta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoritoVenta" ADD CONSTRAINT "FavoritoVenta_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
