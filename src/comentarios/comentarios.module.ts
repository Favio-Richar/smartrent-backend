import { Module } from '@nestjs/common';
import { ComentariosController } from './comentarios.controller';
import { ComentariosService } from './comentarios.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [ComentariosController],
  providers: [ComentariosService, PrismaService],
  exports: [ComentariosService],
})
export class ComentariosModule {}
