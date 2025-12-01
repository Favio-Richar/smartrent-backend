-- AlterTable
ALTER TABLE "ReservaVenta" ADD COLUMN     "total" INTEGER;

-- AlterTable
ALTER TABLE "Venta" ADD COLUMN     "visitas" INTEGER NOT NULL DEFAULT 0;
