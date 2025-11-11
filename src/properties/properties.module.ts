import { Module } from '@nestjs/common';
import { PropertiesController } from './properties.controller';
import { PropertiesService } from './properties.service';
import { PrismaService } from '../prisma/prisma.service';
import { UploadsModule } from '../uploads/uploads.module'; // ✅ Importación necesaria

@Module({
  imports: [UploadsModule], // ✅ Permite usar UploadsService dentro de PropertiesService
  controllers: [PropertiesController],
  providers: [PropertiesService, PrismaService],
  exports: [PropertiesService],
})
export class PropertiesModule {}
