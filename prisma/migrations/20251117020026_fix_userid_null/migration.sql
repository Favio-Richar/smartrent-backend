-- CreateEnum
CREATE TYPE "PropertyState" AS ENUM ('draft', 'published', 'paused', 'archived');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "email" TEXT,
    "contrasena" TEXT NOT NULL,
    "telefono" TEXT,
    "ciudad" TEXT,
    "imagen" TEXT,
    "bio" TEXT,
    "facebook" TEXT,
    "instagram" TEXT,
    "linkedin" TEXT,
    "web" TEXT,
    "tipoCuenta" TEXT NOT NULL DEFAULT 'Usuario',
    "suscripcionNivel" TEXT NOT NULL DEFAULT 'free',
    "fechaRegistro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLogin" TIMESTAMP(3),
    "resetCode" TEXT,
    "resetCodeExpires" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" SERIAL NOT NULL,
    "rutEmpresa" TEXT,
    "nombreEmpresa" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "contrasena" TEXT NOT NULL,
    "telefono" TEXT,
    "direccion" TEXT,
    "descripcion" TEXT,
    "logo" TEXT,
    "encargado" TEXT,
    "dueno" TEXT,
    "horaApertura" TEXT,
    "horaCierre" TEXT,
    "diasOperacion" TEXT,
    "sitioWeb" TEXT,
    "userId" INTEGER,
    "fechaRegistro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Property" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "precio" DOUBLE PRECISION NOT NULL,
    "categoria" TEXT NOT NULL,
    "ubicacion" TEXT,
    "comuna" TEXT,
    "tipo" TEXT,
    "imagen" TEXT,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "videoUrl" TEXT,
    "videos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "destacado" BOOLEAN NOT NULL DEFAULT false,
    "area" INTEGER,
    "dormitorios" INTEGER,
    "banos" INTEGER,
    "anio" INTEGER,
    "fechaPublicacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,
    "companyName" TEXT,
    "contactName" TEXT,
    "contactPhone" TEXT,
    "contactEmail" TEXT,
    "whatsapp" TEXT,
    "website" TEXT,
    "visitas" INTEGER NOT NULL DEFAULT 0,
    "reservas" INTEGER NOT NULL DEFAULT 0,
    "state" "PropertyState" NOT NULL DEFAULT 'draft',
    "status" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER,
    "companyId" INTEGER,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "tipoContrato" TEXT NOT NULL,
    "ubicacion" TEXT NOT NULL,
    "salario" DOUBLE PRECISION,
    "fechaPublicacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "companyId" INTEGER,
    "userId" INTEGER,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "jobId" INTEGER NOT NULL,
    "fechaPostulacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" TEXT NOT NULL DEFAULT 'En revisión',

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" SERIAL NOT NULL,
    "nombrePlan" TEXT NOT NULL,
    "precio" DOUBLE PRECISION NOT NULL,
    "descripcion" TEXT,
    "duracionDias" INTEGER NOT NULL,
    "nivel" TEXT NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Favorite" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "propertyId" INTEGER,
    "jobId" INTEGER,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" SERIAL NOT NULL,
    "contenido" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    "propertyId" INTEGER,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportTicket" (
    "id" SERIAL NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT DEFAULT 'General',
    "imageBase64" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Pendiente',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER,
    "respuesta" TEXT,

    CONSTRAINT "SupportTicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" SERIAL NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "respuesta" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
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

-- CreateTable
CREATE TABLE "Reservation" (
    "id" SERIAL NOT NULL,
    "propertyId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "message" TEXT,
    "people" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'Pendiente',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityPost" (
    "id" SERIAL NOT NULL,
    "author" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunityPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionPayment" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "plan" TEXT NOT NULL,
    "buyOrder" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentType" TEXT,
    "authorizationCode" TEXT,
    "cardLast4" TEXT,
    "transactionDate" TIMESTAMP(3),
    "confirmedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "SubscriptionPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActiveSubscription" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "plan" TEXT NOT NULL,
    "nivel" TEXT NOT NULL DEFAULT 'basic',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3) NOT NULL,
    "autoRenew" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActiveSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "paymentId" INTEGER NOT NULL,
    "pdfUrl" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "plan" TEXT NOT NULL,
    "authorizationCode" TEXT,
    "last4" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_correo_key" ON "User"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_tipoCuenta_idx" ON "User"("tipoCuenta");

-- CreateIndex
CREATE INDEX "User_fechaRegistro_idx" ON "User"("fechaRegistro");

-- CreateIndex
CREATE INDEX "User_resetCode_idx" ON "User"("resetCode");

-- CreateIndex
CREATE UNIQUE INDEX "Company_correo_key" ON "Company"("correo");

-- CreateIndex
CREATE INDEX "Company_fechaRegistro_idx" ON "Company"("fechaRegistro");

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
CREATE INDEX "Property_state_idx" ON "Property"("state");

-- CreateIndex
CREATE INDEX "Property_status_idx" ON "Property"("status");

-- CreateIndex
CREATE INDEX "Property_userId_idx" ON "Property"("userId");

-- CreateIndex
CREATE INDEX "Property_companyId_idx" ON "Property"("companyId");

-- CreateIndex
CREATE INDEX "Job_categoria_idx" ON "Job"("categoria");

-- CreateIndex
CREATE INDEX "Job_tipoContrato_idx" ON "Job"("tipoContrato");

-- CreateIndex
CREATE INDEX "Job_fechaPublicacion_idx" ON "Job"("fechaPublicacion");

-- CreateIndex
CREATE INDEX "Application_userId_idx" ON "Application"("userId");

-- CreateIndex
CREATE INDEX "Application_jobId_idx" ON "Application"("jobId");

-- CreateIndex
CREATE INDEX "Application_estado_idx" ON "Application"("estado");

-- CreateIndex
CREATE INDEX "Application_fechaPostulacion_idx" ON "Application"("fechaPostulacion");

-- CreateIndex
CREATE INDEX "Subscription_nivel_idx" ON "Subscription"("nivel");

-- CreateIndex
CREATE INDEX "Favorite_userId_idx" ON "Favorite"("userId");

-- CreateIndex
CREATE INDEX "Favorite_propertyId_idx" ON "Favorite"("propertyId");

-- CreateIndex
CREATE INDEX "Favorite_jobId_idx" ON "Favorite"("jobId");

-- CreateIndex
CREATE INDEX "Comment_userId_idx" ON "Comment"("userId");

-- CreateIndex
CREATE INDEX "Comment_propertyId_idx" ON "Comment"("propertyId");

-- CreateIndex
CREATE INDEX "Comment_fecha_idx" ON "Comment"("fecha");

-- CreateIndex
CREATE INDEX "SupportTicket_userId_idx" ON "SupportTicket"("userId");

-- CreateIndex
CREATE INDEX "SupportTicket_status_idx" ON "SupportTicket"("status");

-- CreateIndex
CREATE INDEX "SupportTicket_createdAt_idx" ON "SupportTicket"("createdAt");

-- CreateIndex
CREATE INDEX "Feedback_rating_idx" ON "Feedback"("rating");

-- CreateIndex
CREATE INDEX "Feedback_createdAt_idx" ON "Feedback"("createdAt");

-- CreateIndex
CREATE INDEX "Reservation_propertyId_idx" ON "Reservation"("propertyId");

-- CreateIndex
CREATE INDEX "Reservation_userId_idx" ON "Reservation"("userId");

-- CreateIndex
CREATE INDEX "Reservation_status_idx" ON "Reservation"("status");

-- CreateIndex
CREATE INDEX "Reservation_createdAt_idx" ON "Reservation"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionPayment_token_key" ON "SubscriptionPayment"("token");

-- CreateIndex
CREATE INDEX "SubscriptionPayment_userId_idx" ON "SubscriptionPayment"("userId");

-- CreateIndex
CREATE INDEX "SubscriptionPayment_plan_idx" ON "SubscriptionPayment"("plan");

-- CreateIndex
CREATE INDEX "SubscriptionPayment_status_idx" ON "SubscriptionPayment"("status");

-- CreateIndex
CREATE INDEX "SubscriptionPayment_createdAt_idx" ON "SubscriptionPayment"("createdAt");

-- CreateIndex
CREATE INDEX "SubscriptionPayment_token_status_idx" ON "SubscriptionPayment"("token", "status");

-- CreateIndex
CREATE INDEX "ActiveSubscription_userId_plan_status_idx" ON "ActiveSubscription"("userId", "plan", "status");

-- CreateIndex
CREATE INDEX "ActiveSubscription_userId_idx" ON "ActiveSubscription"("userId");

-- CreateIndex
CREATE INDEX "ActiveSubscription_plan_idx" ON "ActiveSubscription"("plan");

-- CreateIndex
CREATE INDEX "ActiveSubscription_status_idx" ON "ActiveSubscription"("status");

-- CreateIndex
CREATE INDEX "ActiveSubscription_endDate_idx" ON "ActiveSubscription"("endDate");

-- CreateIndex
CREATE INDEX "Invoice_userId_idx" ON "Invoice"("userId");

-- CreateIndex
CREATE INDEX "Invoice_paymentId_idx" ON "Invoice"("paymentId");

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionPayment" ADD CONSTRAINT "SubscriptionPayment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActiveSubscription" ADD CONSTRAINT "ActiveSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "SubscriptionPayment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
