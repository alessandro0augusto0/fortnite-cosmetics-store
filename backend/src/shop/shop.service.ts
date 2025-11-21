import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ShopService {
  constructor(private prisma: PrismaService) {}

  // ============================================================
  // COMPRA DE COSMÉTICO
  // ============================================================
  async buyCosmetic(
    userId: string,
    cosmeticId: string,
    cosmeticName: string,
    price: number,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new BadRequestException('Usuário não encontrado.');

    if (user.vbucks < price) {
      throw new ForbiddenException('Saldo insuficiente.');
    }

    // Criar compra
    await this.prisma.purchase.create({
      data: {
        userId,
        cosmeticId,
        cosmeticName,
        price,
      },
    });

    // Atualizar saldo
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { vbucks: user.vbucks - price },
    });

    return {
      message: `Compra de ${cosmeticName} concluída com sucesso!`,
      newBalance: updatedUser.vbucks,
    };
  }

  // ============================================================
  // LISTAR COMPRAS
  // ============================================================
  async getPurchases(userId: string) {
    return this.prisma.purchase.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ============================================================
  // DEVOLUÇÃO DE COSMÉTICOS
  // ============================================================
  async returnPurchase(userId: string, purchaseId: string) {
    const purchase = await this.prisma.purchase.findUnique({
      where: { id: purchaseId },
    });

    if (!purchase) {
      throw new NotFoundException('Compra não encontrada.');
    }

    if (purchase.userId !== userId) {
      throw new ForbiddenException(
        'Você não tem permissão para devolver esta compra.',
      );
    }

    if (purchase.returned) {
      throw new BadRequestException('Este item já foi devolvido.');
    }

    // Marcar compra como devolvida
    await this.prisma.purchase.update({
      where: { id: purchaseId },
      data: { returned: true },
    });

    // Reembolsar usuário
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { vbucks: { increment: purchase.price } },
    });

    return {
      message: 'Cosmético devolvido com sucesso!',
      refunded: purchase.price,
      newBalance: updatedUser.vbucks,
    };
  }
}
