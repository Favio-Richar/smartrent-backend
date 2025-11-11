/*
  Warnings:

  - You are about to drop the column `asunto` on the `SupportTicket` table. All the data in the column will be lost.
  - You are about to drop the column `descripcion` on the `SupportTicket` table. All the data in the column will be lost.
  - You are about to drop the column `estado` on the `SupportTicket` table. All the data in the column will be lost.
  - You are about to drop the column `fechaCreacion` on the `SupportTicket` table. All the data in the column will be lost.
  - Added the required column `description` to the `SupportTicket` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subject` to the `SupportTicket` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."SupportTicket_estado_idx";

-- DropIndex
DROP INDEX "public"."SupportTicket_fechaCreacion_idx";

-- AlterTable
ALTER TABLE "SupportTicket" DROP COLUMN "asunto",
DROP COLUMN "descripcion",
DROP COLUMN "estado",
DROP COLUMN "fechaCreacion",
ADD COLUMN     "category" TEXT DEFAULT 'General',
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "imageBase64" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'Pendiente',
ADD COLUMN     "subject" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Feedback" (
    "id" SERIAL NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Faq" (
    "id" SERIAL NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Faq_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Feedback_rating_idx" ON "Feedback"("rating");

-- CreateIndex
CREATE INDEX "Feedback_createdAt_idx" ON "Feedback"("createdAt");

-- CreateIndex
CREATE INDEX "SupportTicket_status_idx" ON "SupportTicket"("status");

-- CreateIndex
CREATE INDEX "SupportTicket_createdAt_idx" ON "SupportTicket"("createdAt");

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
