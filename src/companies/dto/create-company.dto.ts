import {
  IsOptional,
  IsString,
  IsEmail,
  IsUrl,
} from 'class-validator';

export class CreateCompanyDto {
  @IsString()
 nombreEmpresa!: string;

  @IsEmail()
  correo!: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsString()
  direccion?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  rutEmpresa?: string;

  @IsOptional()
  @IsString()
  encargado?: string;

  @IsOptional()
  @IsString()
  dueno?: string;

  @IsOptional()
  @IsString()
  horaApertura?: string;

  @IsOptional()
  @IsString()
  horaCierre?: string;

  @IsOptional()
  diasOperacion?: string; // se guarda como JSON string desde Flutter

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Debe ser una URL válida' })
  sitioWeb?: string; // 🔹 Nuevo campo de sitio web

  @IsOptional()
  userId?: number;
}