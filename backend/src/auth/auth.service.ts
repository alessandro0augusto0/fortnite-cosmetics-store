import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

type PublicUser = {
  id: string;
  email: string;
  vbucks: number;
  createdAt: Date;
  items: { id: string; cosmeticId: string }[];
};

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
      include: {
        items: {
          select: { id: true, cosmeticId: true },
        },
      },
    });

    const token = this.generateToken(user.id, user.email);
    return { token, user: this.buildPublicUser(user) };
  }

  /**
   * LOGIN
   */
  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        items: {
          select: { id: true, cosmeticId: true },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    const token = this.generateToken(user.id, user.email);

    return { token, user: this.buildPublicUser(user) };
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
      include: {
        items: {
          select: { id: true, cosmeticId: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    return this.buildPublicUser(user);
  }

  /**
   * GERAR TOKEN JWT
   */
  private generateToken(userId: string, email: string) {
    const payload = { sub: userId, email };
    return this.jwtService.sign(payload);
  }

  private buildPublicUser(user: {
    id: string;
    email: string;
    vbucks: number;
    createdAt: Date;
    items?: { id: string; cosmeticId: string }[];
  }): PublicUser {
    return {
      id: user.id,
      email: user.email,
      vbucks: user.vbucks,
      createdAt: user.createdAt,
      items: user.items?.map((item) => ({ id: item.id, cosmeticId: item.cosmeticId })) ?? [],
    };
  }
}
