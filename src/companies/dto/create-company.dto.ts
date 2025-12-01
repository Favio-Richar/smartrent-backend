import { IsOptional, IsString, IsEmail, IsUrl } from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  nombreEmpresa!: string;

  @IsEmail()
  correo!: string;

  @IsOptional() telefono?: string;
  @IsOptional() direccion?: string;
  @IsOptional() descripcion?: string;
  @IsOptional() rutEmpresa?: string;
  @IsOptional() encargado?: string;
  @IsOptional() dueno?: string;
  @IsOptional() horaApertura?: string;
  @IsOptional() horaCierre?: string;

  @IsOptional()
  diasOperacion?: string;  // 🔥 STRING, NO ARRAY

  @IsOptional()
  logo?: string | null;

  @IsOptional()
  @IsUrl()
  sitioWeb?: string;

  @IsOptional()
  userId?: number;
}
