import { Body, Controller, Post, Get, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * REGISTRO
   */
  @Post('register')
  async register(@Body() body: RegisterDto) {
    const { email, password } = body;
    return this.authService.register(email, password);
  }

  /**
   * LOGIN
   */
  @Post('login')
  async login(@Body() body: LoginDto) {
    const { email, password } = body;
    return this.authService.login(email, password);
  }

  /**
   * PERFIL - /auth/me
   * A JwtStrategy retorna: { sub: userId, email }
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req) {
    return this.authService.getUserProfile(req.user.sub);
  }
}
