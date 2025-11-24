import { IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateCommentDto {
  @IsNotEmpty()
  @IsNumber()
  postId!: number;

  @IsNotEmpty()
  @IsNumber()
  userId!: number;

  @IsNotEmpty()
  @IsString()
  comentario!: string;

  @IsOptional()
  @IsString()
  respuestaA?: string; 
}
