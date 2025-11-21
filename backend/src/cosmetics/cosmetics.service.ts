import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { FortniteSyncService, SyncSummary } from './fortnite-sync.service';

export type FindAllParams = {
  page?: number;
  search?: string;
  type?: string;
  rarity?: string;
  isNew?: string | boolean;
  isOnSale?: string | boolean;
};

@Injectable()
export class CosmeticsService {
  private readonly logger = new Logger(CosmeticsService.name);
  private readonly perPage = 20;

  constructor(
    private readonly prisma: PrismaService,
    private readonly fortniteSyncService: FortniteSyncService,
  ) {}

  async findAll(params: FindAllParams = {}, currentUserId?: string, retried = false) {
    const page = this.normalizePage(params.page);
    const skip = (page - 1) * this.perPage;
    const where = this.buildFilters(params);

    const [total, cosmetics] = await this.prisma.$transaction([
      this.prisma.cosmetic.count({ where }),
      this.prisma.cosmetic.findMany({
        where,
        skip,
        take: this.perPage,
        orderBy: { addedAt: 'desc' },
      }),
    ]);

    if (total === 0 && !retried) {
      this.logger.warn('Nenhum cosmético encontrado localmente. Executando sincronização automática.');
      await this.syncWithRemote();
      return this.findAll(params, currentUserId, true);
    }

    const ownedSet = await this.loadOwnedCosmetics(currentUserId, cosmetics.map((c) => c.id));

    return {
      data: cosmetics.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        type: c.type,
        rarity: c.rarity,
        image: c.image,
        price: c.price,
        isNew: c.isNew,
        isOnSale: c.isOnSale,
        addedAt: c.addedAt,
        lastSync: c.lastSync,
        owned: ownedSet.has(c.id),
      })),
      meta: {
        total,
        page,
        lastPage: Math.max(1, Math.ceil(total / this.perPage)),
      },
    };
  }

  async findOne(id: string, currentUserId?: string) {
    const cosmetic = await this.prisma.cosmetic.findUnique({ where: { id } });
    if (!cosmetic) return null;

    let owned = false;
    if (currentUserId) {
      const ownership = await this.prisma.userItem.findUnique({
        where: { userId_cosmeticId: { userId: currentUserId, cosmeticId: id } },
        select: { cosmeticId: true },
      });
      owned = Boolean(ownership);
    }

    return {
      id: cosmetic.id,
      name: cosmetic.name,
      description: cosmetic.description,
      type: cosmetic.type,
      rarity: cosmetic.rarity,
      image: cosmetic.image,
      price: cosmetic.price,
      isNew: cosmetic.isNew,
      isOnSale: cosmetic.isOnSale,
      addedAt: cosmetic.addedAt,
      lastSync: cosmetic.lastSync,
      owned,
    };
  }

  async syncWithRemote(): Promise<SyncSummary> {
    this.logger.log('Iniciando sincronização completa com a Fortnite API...');
    return this.fortniteSyncService.syncEverything();
  }

  private buildFilters(params: FindAllParams): Prisma.CosmeticWhereInput {
    const where: Prisma.CosmeticWhereInput = {};
    const search = params.search?.trim();
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (params.type) where.type = params.type;
    if (params.rarity) where.rarity = params.rarity;
    if (this.isTruthy(params.isNew)) where.isNew = true;
    if (this.isTruthy(params.isOnSale)) where.isOnSale = true;
    return where;
  }

  private normalizePage(page?: number) {
    const parsed = Number(page);
    return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 1;
  }

  private isTruthy(value?: string | boolean) {
    if (typeof value === 'boolean') return value;
    return value?.toString().toLowerCase() === 'true';
  }

  private async loadOwnedCosmetics(userId: string | undefined, cosmeticIds: string[]) {
    const owned = new Set<string>();
    if (!userId || cosmeticIds.length === 0) return owned;

    const ownedItems = await this.prisma.userItem.findMany({
      where: { userId, cosmeticId: { in: cosmeticIds } },
      select: { cosmeticId: true },
    });

    ownedItems.forEach((item) => owned.add(item.cosmeticId));
    return owned;
  }
}
