import { Module } from '@nestjs/common';
import { ProfilePostService } from './profile-post.service';
import { ProfilePostController } from './profile-post.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [ProfilePostController],
  providers: [ProfilePostService, PrismaService],
})
export class ProfilePostModule {}
