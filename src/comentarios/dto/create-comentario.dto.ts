import { IsInt, IsString, MinLength } from 'class-validator';

export class CreateComentarioDto {
  @IsString()
  @MinLength(1)
  contenido!: string; 

  @IsInt()
  propertyId!: number; 

  @IsInt()
  userId!: number; 
}
