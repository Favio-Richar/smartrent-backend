-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "status" TEXT,
ADD COLUMN     "views" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Property_status_idx" ON "Property"("status");
