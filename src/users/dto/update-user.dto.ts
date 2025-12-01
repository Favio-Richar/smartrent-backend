import { IsOptional, IsString, IsBoolean, IsNumber } from 'class-validator';

export class UpdateUserDto {
  // DATOS PERSONALES
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsString()
  ciudad?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  // REDES SOCIALES
  @IsOptional()
  @IsString()
  facebook?: string;

  @IsOptional()
  @IsString()
  instagram?: string;

  @IsOptional()
  @IsString()
  linkedin?: string;

  @IsOptional()
  @IsString()
  web?: string;

  @IsOptional()
  @IsString()
  whatsapp?: string;

  // IMAGEN + PORTADA
  @IsOptional()
  @IsString()
  imagen?: string;

  @IsOptional()
  @IsString()
  portada?: string;

  // CONFIGURACIÓN
  @IsOptional()
  @IsBoolean()
  darkMode?: boolean;

  @IsOptional()
  @IsBoolean()
  animacionesPerfil?: boolean;

  @IsOptional()
  @IsBoolean()
  mostrarPortada?: boolean;

  @IsOptional()
  @IsString()
  estiloTarjetas?: string;

  @IsOptional()
  @IsString()
  colorTema?: string;

  @IsOptional()
  @IsNumber()
  fontSize?: number;

  // PRIVACIDAD
  @IsOptional()
  @IsBoolean()
  perfilPrivado?: boolean;

  @IsOptional()
  @IsBoolean()
  mostrarRedes?: boolean;

  @IsOptional()
  @IsBoolean()
  mostrarContacto?: boolean;
}
