import { 
  Controller, 
  Post, 
  Get, 
  Body, 
  Param, 
  Delete, 
  BadRequestException 
} from '@nestjs/common';

import { ProfilePostService } from './profile-post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('profile-post')
export class ProfilePostController {
  constructor(private readonly service: ProfilePostService) {}

  @Post()
  async create(@Body() dto: CreatePostDto) {
    if (!dto.userId || dto.userId === 0) {
      throw new BadRequestException("userId inválido o no enviado");
    }
    return this.service.createPost(dto);
  }

  @Get()
  getAllPosts() {
    return this.service.getAllPosts();
  }

  @Get('user/:id')
  getUserPosts(@Param('id') id: string) {
    return this.service.getUserPosts(Number(id));
  }

  @Delete(':id/:userId')
  deletePost(@Param('id') id: string, @Param('userId') userId: string) {
    return this.service.deletePost(Number(id), Number(userId));
  }

  @Post(':id/like')
  toggleLike(@Param('id') id: string, @Body('userId') userId: number) {
    return this.service.toggleLike(Number(id), Number(userId));
  }

  @Post(':id/comment')
  addComment(@Param('id') id: string, @Body() dto: CreateCommentDto) {
    return this.service.addComment({
      postId: Number(id),
      userId: dto.userId,
      comentario: dto.comentario,
    });
  }

  @Get(':id/comments')
  getComments(@Param('id') id: string) {
    return this.service.getComments(Number(id));
  }

  @Get('feed/general')
  getFeed() {
    return this.service.getFeed();
  }
}
