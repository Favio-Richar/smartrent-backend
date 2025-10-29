-- CreateIndex
CREATE INDEX "Application_estado_idx" ON "Application"("estado");

-- CreateIndex
CREATE INDEX "Application_fechaPostulacion_idx" ON "Application"("fechaPostulacion");

-- CreateIndex
CREATE INDEX "Comment_fecha_idx" ON "Comment"("fecha");

-- CreateIndex
CREATE INDEX "Company_fechaRegistro_idx" ON "Company"("fechaRegistro");

-- CreateIndex
CREATE INDEX "Job_categoria_idx" ON "Job"("categoria");

-- CreateIndex
CREATE INDEX "Job_tipoContrato_idx" ON "Job"("tipoContrato");

-- CreateIndex
CREATE INDEX "Job_fechaPublicacion_idx" ON "Job"("fechaPublicacion");

-- CreateIndex
CREATE INDEX "Subscription_nivel_idx" ON "Subscription"("nivel");

-- CreateIndex
CREATE INDEX "SupportTicket_estado_idx" ON "SupportTicket"("estado");

-- CreateIndex
CREATE INDEX "SupportTicket_fechaCreacion_idx" ON "SupportTicket"("fechaCreacion");

-- CreateIndex
CREATE INDEX "User_tipoCuenta_idx" ON "User"("tipoCuenta");

-- CreateIndex
CREATE INDEX "User_fechaRegistro_idx" ON "User"("fechaRegistro");
