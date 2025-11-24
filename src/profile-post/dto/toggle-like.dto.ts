import { IsNotEmpty, IsNumber } from 'class-validator';

export class ToggleLikeDto {
  @IsNotEmpty()
  @IsNumber()
  postId!: number;

  @IsNotEmpty()
  @IsNumber()
  userId!: number;
}
