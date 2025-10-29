-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "anio" INTEGER,
ADD COLUMN     "area" INTEGER,
ADD COLUMN     "banos" INTEGER,
ADD COLUMN     "comuna" TEXT,
ADD COLUMN     "destacado" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "dormitorios" INTEGER,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "tipo" TEXT,
ADD COLUMN     "videoUrl" TEXT;

-- CreateIndex
CREATE INDEX "Application_userId_idx" ON "Application"("userId");

-- CreateIndex
CREATE INDEX "Application_jobId_idx" ON "Application"("jobId");

-- CreateIndex
CREATE INDEX "Comment_userId_idx" ON "Comment"("userId");

-- CreateIndex
CREATE INDEX "Comment_propertyId_idx" ON "Comment"("propertyId");

-- CreateIndex
CREATE INDEX "Favorite_userId_idx" ON "Favorite"("userId");

-- CreateIndex
CREATE INDEX "Favorite_propertyId_idx" ON "Favorite"("propertyId");

-- CreateIndex
CREATE INDEX "Favorite_jobId_idx" ON "Favorite"("jobId");

-- CreateIndex
CREATE INDEX "Property_categoria_idx" ON "Property"("categoria");

-- CreateIndex
CREATE INDEX "Property_comuna_idx" ON "Property"("comuna");

-- CreateIndex
CREATE INDEX "Property_tipo_idx" ON "Property"("tipo");

-- CreateIndex
CREATE INDEX "Property_precio_idx" ON "Property"("precio");

-- CreateIndex
CREATE INDEX "Property_fechaPublicacion_idx" ON "Property"("fechaPublicacion");

-- CreateIndex
CREATE INDEX "SupportTicket_userId_idx" ON "SupportTicket"("userId");
