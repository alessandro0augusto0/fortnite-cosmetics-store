import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service';

export type SyncSummary = {
  catalogImported: number;
  catalogUpdated: number;
  markedOnSale: number;
  markedAsNew: number;
};

@Injectable()
export class FortniteSyncService {
  private readonly logger = new Logger(FortniteSyncService.name);
  private readonly apiBase = process.env.FORTNITE_API_BASE || 'https://fortnite-api.com/v2';
  private readonly maxItems = Number(process.env.FORTNITE_SYNC_LIMIT ?? 500);

  constructor(private readonly prisma: PrismaService) {}

  async syncEverything(): Promise<SyncSummary> {
    this.logger.log('Iniciando sincronização completa com a Fortnite API...');
    const catalog = await this.syncAllCosmetics();
    const onSale = await this.syncShop();
    const asNew = await this.syncNewItems();

    return {
      catalogImported: catalog.imported,
      catalogUpdated: catalog.updated,
      markedOnSale: onSale,
      markedAsNew: asNew,
    };
  }

  async syncAllCosmetics(): Promise<{ imported: number; updated: number }> {
    this.logger.log('Sincronizando catálogo base (v2/cosmetics/br)...');
    try {
      const response = await axios.get(`${this.apiBase}/cosmetics/br`);
      const items = response.data?.data;

      if (!Array.isArray(items)) {
        throw new Error('Formato inesperado retornado por /cosmetics/br');
      }

      let imported = 0;
      let updated = 0;

      for (const item of items) {
        if (!item?.id || !item?.name) continue;
        const image = item.images?.icon || item.images?.featured || item.images?.smallIcon;
        if (!image) continue;

        const payload = {
          name: item.name,
          description: item.description || 'Sem descrição',
          type: item.type?.displayValue || item.type?.value || 'Item',
          rarity: item.rarity?.value || 'common',
          image,
          addedAt: this.resolveDate(item.added) ?? new Date(),
          price: this.resolvePrice(item),
          isNew: false,
          isOnSale: false,
          lastSync: new Date(),
        };

        const exists = await this.prisma.cosmetic.findUnique({
          where: { id: item.id },
          select: { id: true },
        });

        if (exists) {
          await this.prisma.cosmetic.update({ where: { id: item.id }, data: payload });
          updated += 1;
        } else {
          await this.prisma.cosmetic.create({ data: { id: item.id, ...payload } });
          imported += 1;
        }

        if (imported + updated >= this.maxItems) break;
      }

      this.logger.log(`Catálogo sincronizado (${imported} novos | ${updated} atualizados).`);
      return { imported, updated };
    } catch (error) {
      this.logger.error(`Erro ao sincronizar catálogo: ${(error as Error).message}`);
      if ((await this.prisma.cosmetic.count()) === 0) {
        await this.seedMockData();
      }
      return { imported: 0, updated: 0 };
    }
  }

  async syncShop(): Promise<number> {
    this.logger.log('Atualizando sinalização de itens na loja...');
    try {
      await this.prisma.cosmetic.updateMany({ data: { isOnSale: false } });

      const response = await axios.get(`${this.apiBase}/shop/br`);
      const data = response.data?.data ?? {};
      const entries = [
        ...(data.featured?.entries || []),
        ...(data.daily?.entries || []),
        ...(data.specialFeatured?.entries || []),
      ];

      let saleCount = 0;
      for (const entry of entries) {
        const price = Number(entry.finalPrice ?? entry.regularPrice ?? entry.fullPrice ?? 1500);
        for (const item of entry.items || []) {
          try {
            await this.prisma.cosmetic.update({
              where: { id: item.id },
              data: { isOnSale: true, price: Number.isFinite(price) ? price : 1500 },
            });
            saleCount += 1;
          } catch {
            /* Item ainda não existe no banco nesta execução */
          }
        }
      }

      this.logger.log(`Loja atualizada: ${saleCount} itens marcados como "on sale".`);
      return saleCount;
    } catch (error) {
      this.logger.warn(`Erro ao sincronizar loja: ${(error as Error).message}`);
      return 0;
    }
  }

  async syncNewItems(): Promise<number> {
    this.logger.log('Atualizando flag de novidades...');
    try {
      await this.prisma.cosmetic.updateMany({ data: { isNew: false } });

      const response = await axios.get(`${this.apiBase}/cosmetics/new`);
      const newItems = response.data?.data?.items?.br || [];

      let newCount = 0;
      for (const item of newItems) {
        if (!item?.id) continue;
        const image = item.images?.icon || item.images?.smallIcon;
        if (!image) continue;

        await this.prisma.cosmetic.upsert({
          where: { id: item.id },
          update: { isNew: true, lastSync: new Date() },
          create: {
            id: item.id,
            name: item.name,
            description: item.description || '',
            type: item.type?.displayValue || 'Item',
            rarity: item.rarity?.value || 'common',
            image,
            addedAt: new Date(),
            price: this.resolvePrice(item),
            isNew: true,
            isOnSale: false,
            lastSync: new Date(),
          },
        });
        newCount += 1;
      }

      this.logger.log(`Novidades aplicadas: ${newCount} itens sinalizados.`);
      return newCount;
    } catch (error) {
      this.logger.error(`Erro ao sincronizar novidades: ${(error as Error).message}`);
      return 0;
    }
  }

  private resolvePrice(item: any): number {
    const sources = [item.price, item.priceInVbucks, item.price?.value, item.shopHistory?.finalPrice];
    for (const value of sources) {
      const parsed = Number(value);
      if (Number.isFinite(parsed) && parsed > 0) {
        return parsed;
      }
    }
    return 1500;
  }

  private resolveDate(value?: string): Date | undefined {
    if (!value) return undefined;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  }

  private async seedMockData() {
    this.logger.warn('API indisponível. Sem dados locais, ativando mock.');
    const mocks = [
      {
        id: 'mock_1',
        name: 'Ramirez Padrão',
        description: 'Fallback',
        type: 'outfit',
        rarity: 'common',
        price: 800,
        image: 'https://fortnite-api.com/images/cosmetics/br/cid_001_athena_commando_f_default/icon.png',
      },
      {
        id: 'mock_2',
        name: 'Cavaleiro Negro',
        description: 'Fallback',
        type: 'outfit',
        rarity: 'legendary',
        price: 2000,
        image: 'https://fortnite-api.com/images/cosmetics/br/cid_028_athena_commando_m/icon.png',
      },
      {
        id: 'mock_3',
        name: 'Peely',
        description: 'Fallback',
        type: 'outfit',
        rarity: 'epic',
        price: 1500,
        image: 'https://fortnite-api.com/images/cosmetics/br/cid_342_athena_commando_m_banana/icon.png',
      },
    ];

    for (const mock of mocks) {
      await this.prisma.cosmetic.upsert({
        where: { id: mock.id },
        update: {
          name: mock.name,
          description: mock.description,
          image: mock.image,
          price: mock.price,
          isNew: true,
          isOnSale: true,
          lastSync: new Date(),
        },
        create: {
          ...mock,
          addedAt: new Date(),
          isNew: true,
          isOnSale: true,
          lastSync: new Date(),
        },
      });
    }
  }
}
