import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 20) {
    page = Math.max(1, Number(page));
    limit = Math.min(100, Math.max(1, Number(limit)));

    const skip = (page - 1) * limit;

    const [total, users] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          createdAt: true,
          vbucks: true, // dado público
        },
      }),
    ]);

    return {
      data: users,
      meta: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, page = 1, limit = 12) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        createdAt: true,
        vbucks: true,
      },
    });

    if (!user) return null;

    page = Math.max(1, Number(page));
    limit = Math.min(100, Math.max(1, Number(limit)));

    const skip = (page - 1) * limit;

    const [total, purchases] = await Promise.all([
      this.prisma.purchase.count({ where: { userId: id } }),
      this.prisma.purchase.findMany({
        where: { userId: id },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          cosmetic: true,
        },
      }),
    ]);

    return {
      user,
      purchases: {
        data: purchases,
        meta: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    };
  }
}
