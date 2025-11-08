import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ShopService {
  constructor(private prisma: PrismaService) {}

  async buyCosmetic(userId: string, cosmeticId: string, cosmeticName: string, price: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('Usuário não encontrado.');

    if (user.vbucks < price) {
      throw new ForbiddenException('Saldo insuficiente.');
    }

    // Cria a compra
    await this.prisma.purchase.create({
      data: {
        userId,
        cosmeticId,
        cosmeticName,
        price,
      },
    });

    // Atualiza o saldo
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { vbucks: user.vbucks - price },
    });

    return {
      message: `Compra de ${cosmeticName} concluída com sucesso!`,
      newBalance: updatedUser.vbucks,
    };
  }

  async getPurchases(userId: string) {
    return this.prisma.purchase.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
