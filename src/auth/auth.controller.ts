import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() body: any) {
    return this.authService.register(body);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: any) {
    return this.authService.login(body);
  }

  // 🔹 Solicitar código de recuperación
  @Post('forgot')
  @HttpCode(HttpStatus.OK)
  async forgot(@Body() body: any) {
    return this.authService.forgotPassword(body);
  }

  // 🔹 Cambiar contraseña usando el código
  @Post('reset')
  @HttpCode(HttpStatus.OK)
  async reset(@Body() body: any) {
    return this.authService.resetPassword(body);
  }
}
