-- AlterTable
ALTER TABLE "User" ADD COLUMN     "animacionesPerfil" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "colorTema" TEXT DEFAULT 'azul',
ADD COLUMN     "darkMode" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "estiloTarjetas" TEXT DEFAULT 'moderno',
ADD COLUMN     "fontSize" DOUBLE PRECISION DEFAULT 1.0,
ADD COLUMN     "mostrarContacto" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "mostrarPortada" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "mostrarRedes" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "perfilPrivado" BOOLEAN NOT NULL DEFAULT false;
