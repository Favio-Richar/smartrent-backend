// src/companies/companies.module.ts
import { Module } from '@nestjs/common';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [CompaniesController],
  providers: [CompaniesService, PrismaService],
})
export class CompaniesModule {}