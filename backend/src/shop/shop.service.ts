import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ShopService {
  constructor(private readonly prisma: PrismaService) {}

  async purchaseCosmetic(userId: string, cosmeticId: string) {
    const [user, cosmetic] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId } }),
      this.prisma.cosmetic.findUnique({ where: { id: cosmeticId } }),
    ]);

    if (!user) {
      throw new BadRequestException('Usuário não encontrado.');
    }

    if (!cosmetic) {
      throw new NotFoundException('Cosmético não encontrado.');
    }

    if (user.vbucks < cosmetic.price) {
      throw new ForbiddenException('Saldo insuficiente.');
    }

    const alreadyOwned = await this.prisma.userItem.findUnique({
      where: { userId_cosmeticId: { userId, cosmeticId } },
    });

    if (alreadyOwned) {
      throw new BadRequestException('Você já possui este item.');
    }

    const [, , updatedUser] = await this.prisma.$transaction([
      this.prisma.userItem.create({
        data: { userId, cosmeticId },
      }),
      this.prisma.transaction.create({
        data: {
          userId,
          cosmeticId,
          type: 'PURCHASE',
          amount: cosmetic.price,
        },
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: { vbucks: { decrement: cosmetic.price } },
        select: { vbucks: true },
      }),
    ]);

    return {
      success: true,
      message: `Compra de ${cosmetic.name} concluída com sucesso!`,
      newBalance: updatedUser.vbucks,
    };
  }

  async refundCosmetic(userId: string, cosmeticId: string) {
    const ownedItem = await this.prisma.userItem.findUnique({
      where: { userId_cosmeticId: { userId, cosmeticId } },
      include: { cosmetic: true },
    });

    if (!ownedItem) {
      throw new BadRequestException('Item não encontrado na sua mochila.');
    }

    const cosmeticPrice = ownedItem.cosmetic.price;

    const [, , updatedUser] = await this.prisma.$transaction([
      this.prisma.userItem.delete({
        where: { userId_cosmeticId: { userId, cosmeticId } },
      }),
      this.prisma.transaction.create({
        data: {
          userId,
          cosmeticId,
          type: 'REFUND',
          amount: cosmeticPrice,
        },
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: { vbucks: { increment: cosmeticPrice } },
        select: { vbucks: true },
      }),
    ]);

    return {
      success: true,
      message: `${ownedItem.cosmetic.name} devolvido e saldo reembolsado!`,
      newBalance: updatedUser.vbucks,
    };
  }

  async getInventory(userId: string) {
    return this.prisma.userItem.findMany({
      where: { userId },
      include: { cosmetic: true },
      orderBy: { acquiredAt: 'desc' },
    });
  }

  async getHistory(userId: string) {
    return this.prisma.transaction.findMany({
      where: { userId },
      include: { cosmetic: true },
      orderBy: { date: 'desc' },
    });
  }
}
