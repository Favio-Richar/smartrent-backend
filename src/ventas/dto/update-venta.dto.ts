// src/ventas/dto/update-venta.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateVentaDto } from './create-venta.dto';

export class UpdateVentaDto extends PartialType(CreateVentaDto) {}
