import { Module } from '@nestjs/common';
import { VentasService } from './ventas.service';
import { VentasController } from './ventas.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads/ventas'),
        filename: (req, file, cb) => {
          const unique = Date.now() + '-' + file.originalname.replace(/\s/g, '_');
          cb(null, unique);
        },
      }),
    }),
  ],
  controllers: [VentasController],
  providers: [VentasService, PrismaService],
})
export class VentasModule {}
