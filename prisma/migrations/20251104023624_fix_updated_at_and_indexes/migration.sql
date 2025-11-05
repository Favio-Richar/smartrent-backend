-- AlterTable
ALTER TABLE "Property" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "Property_userId_idx" ON "Property"("userId");

-- CreateIndex
CREATE INDEX "Property_companyId_idx" ON "Property"("companyId");
