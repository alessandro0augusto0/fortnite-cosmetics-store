import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /**
   * REGISTRAR USUÁRIO
   */
  async register(email: string, password: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new UnauthorizedException('Email já está em uso.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        vbucks: 10000,
      },
    });

    const token = this.generateToken(user.id, user.email);

    return { token };
  }

  /**
   * LOGIN
   */
  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    const token = this.generateToken(user.id, user.email);

    return { token };
  }

  /**
   * PERFIL /auth/me
   */
  async getUserProfile(userId: string) {
    if (!userId) {
      throw new UnauthorizedException('Token inválido ou expirado.');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, vbucks: true, createdAt: true },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    return user;
  }

  /**
   * GERAR TOKEN JWT
   */
  private generateToken(userId: string, email: string) {
    const payload = { sub: userId, email };
    return this.jwtService.sign(payload);
  }
}
