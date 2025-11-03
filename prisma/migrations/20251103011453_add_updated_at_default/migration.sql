-- CreateEnum
CREATE TYPE "PropertyState" AS ENUM ('draft', 'published', 'paused', 'archived');

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "reservas" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "state" "PropertyState" NOT NULL DEFAULT 'draft',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "visitas" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Property_state_idx" ON "Property"("state");
