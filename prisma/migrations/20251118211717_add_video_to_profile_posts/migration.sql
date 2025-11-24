-- AlterTable
ALTER TABLE "ProfilePost" ADD COLUMN     "duracion" INTEGER,
ADD COLUMN     "editedAt" TIMESTAMP(3),
ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "miniatura" TEXT,
ADD COLUMN     "repostId" INTEGER,
ADD COLUMN     "tags" TEXT,
ADD COLUMN     "tipo" TEXT NOT NULL DEFAULT 'text',
ADD COLUMN     "titulo" TEXT,
ADD COLUMN     "ubicacion" TEXT;

-- CreateIndex
CREATE INDEX "ProfilePost_tipo_idx" ON "ProfilePost"("tipo");

-- CreateIndex
CREATE INDEX "ProfilePost_createdAt_idx" ON "ProfilePost"("createdAt");

-- AddForeignKey
ALTER TABLE "ProfilePost" ADD CONSTRAINT "ProfilePost_repostId_fkey" FOREIGN KEY ("repostId") REFERENCES "ProfilePost"("id") ON DELETE SET NULL ON UPDATE CASCADE;
