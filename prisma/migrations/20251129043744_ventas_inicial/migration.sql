-- CreateTable
CREATE TABLE "Venta" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "category" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'producto',
    "image_url" TEXT,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "video_url" TEXT,
    "videos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "stock" INTEGER DEFAULT 0,
    "marca" TEXT,
    "modelo" TEXT,
    "color" TEXT,
    "estado" TEXT DEFAULT 'Nuevo',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "street" TEXT,
    "location" TEXT,
    "comuna" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "metro" TEXT,
    "companyName" TEXT,
    "contactName" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "whatsapp" TEXT,
    "website" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER,

    CONSTRAINT "Venta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReservaVenta" (
    "id" SERIAL NOT NULL,
    "ventaId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',

    CONSTRAINT "ReservaVenta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResenaVenta" (
    "id" SERIAL NOT NULL,
    "ventaId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "puntuacion" INTEGER NOT NULL,
    "comentario" TEXT,
    "respuesta" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResenaVenta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Venta_category_idx" ON "Venta"("category");

-- CreateIndex
CREATE INDEX "Venta_featured_idx" ON "Venta"("featured");

-- CreateIndex
CREATE INDEX "Venta_comuna_idx" ON "Venta"("comuna");

-- CreateIndex
CREATE INDEX "Venta_price_idx" ON "Venta"("price");

-- CreateIndex
CREATE INDEX "Venta_createdAt_idx" ON "Venta"("createdAt");

-- CreateIndex
CREATE INDEX "ReservaVenta_ventaId_idx" ON "ReservaVenta"("ventaId");

-- CreateIndex
CREATE INDEX "ReservaVenta_userId_idx" ON "ReservaVenta"("userId");

-- CreateIndex
CREATE INDEX "ReservaVenta_estado_idx" ON "ReservaVenta"("estado");

-- CreateIndex
CREATE INDEX "ResenaVenta_ventaId_idx" ON "ResenaVenta"("ventaId");

-- CreateIndex
CREATE INDEX "ResenaVenta_userId_idx" ON "ResenaVenta"("userId");

-- CreateIndex
CREATE INDEX "ResenaVenta_puntuacion_idx" ON "ResenaVenta"("puntuacion");

-- CreateIndex
CREATE INDEX "ResenaVenta_createdAt_idx" ON "ResenaVenta"("createdAt");

-- AddForeignKey
ALTER TABLE "Venta" ADD CONSTRAINT "Venta_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservaVenta" ADD CONSTRAINT "ReservaVenta_ventaId_fkey" FOREIGN KEY ("ventaId") REFERENCES "Venta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservaVenta" ADD CONSTRAINT "ReservaVenta_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResenaVenta" ADD CONSTRAINT "ResenaVenta_ventaId_fkey" FOREIGN KEY ("ventaId") REFERENCES "Venta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResenaVenta" ADD CONSTRAINT "ResenaVenta_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
