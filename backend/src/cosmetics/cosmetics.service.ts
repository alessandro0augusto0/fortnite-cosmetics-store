import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

export type FindAllParams = {
  page?: number;
  limit?: number;
  q?: string;
  type?: string;
  rarity?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

@Injectable()
export class CosmeticsService {
  private readonly logger = new Logger(CosmeticsService.name);
  private readonly apiBase: string;

  constructor(private readonly prisma: PrismaService) {
    this.apiBase = process.env.FORTNITE_API_BASE || 'https://fortnite-api.com/v2';
  }

  // LISTAGEM COM PAGINAÇÃO + FILTROS + ORDENAÇÃO
  async findAll(params: FindAllParams = {}, currentUserId?: string) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(params.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.q) {
      const q = params.q.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (params.type) where.type = params.type;
    if (params.rarity) where.rarity = params.rarity;

    if (params.dateFrom || params.dateTo) {
      where.createdAt = {};
      if (params.dateFrom) {
        const d = new Date(params.dateFrom);
        if (!isNaN(d.getTime())) where.createdAt.gte = d;
      }
      if (params.dateTo) {
        const d = new Date(params.dateTo);
        if (!isNaN(d.getTime())) where.createdAt.lte = d;
      }
      if (Object.keys(where.createdAt).length === 0) delete where.createdAt;
    }

    const orderBy: any = {};
    if (params.sortBy) {
      const allowed = ['createdAt', 'price', 'name'];
      if (allowed.includes(params.sortBy)) {
        orderBy[params.sortBy] = params.sortOrder === 'asc' ? 'asc' : 'desc';
      }
    } else {
      orderBy.createdAt = 'desc';
    }

    const [total, data] = await Promise.all([
      this.prisma.cosmetic.count({ where }),
      this.prisma.cosmetic.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
    ]);

    // owned set for current user
    const ownedSet = new Set<string>();
    if (currentUserId && data.length) {
      const ids = data.map((d) => d.id);
      const purchases = await this.prisma.purchase.findMany({
        where: { userId: currentUserId, cosmeticId: { in: ids }, returned: false },
        select: { cosmeticId: true },
      });
      for (const p of purchases) ownedSet.add(p.cosmeticId);
    }

    const mapped = data.map((c) => {
      const regular = c.regularPrice ?? null;
      const final = c.finalPrice ?? null;
      const isPromo = (final ?? c.price) < (regular ?? c.price);
      return {
        id: c.id,
        name: c.name,
        description: c.description,
        type: c.type,
        rarity: c.rarity,
        image: c.image,
        price: c.price,
        regularPrice: regular,
        finalPrice: final,
        isNew: Boolean(c.isNew),
        onSale: Boolean(c.onSale),
        isPromo,
        owned: ownedSet.has(c.id),
        createdAt: c.createdAt,
      };
    });

    return {
      data: mapped,
      meta: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  // DETALHES DE UM COSMÉTICO
  async findOne(id: string, currentUserId?: string) {
    const c = await this.prisma.cosmetic.findUnique({ where: { id } });
    if (!c) return null;

    const regular = c.regularPrice ?? null;
    const final = c.finalPrice ?? null;
    const isPromo = (final ?? c.price) < (regular ?? c.price);

    let owned = false;
    if (currentUserId) {
      const p = await this.prisma.purchase.findFirst({
        where: { cosmeticId: id, userId: currentUserId, returned: false },
      });
      owned = Boolean(p);
    }

    return {
      id: c.id,
      name: c.name,
      description: c.description,
      type: c.type,
      rarity: c.rarity,
      image: c.image,
      price: c.price,
      regularPrice: regular,
      finalPrice: final,
      isNew: Boolean(c.isNew),
      onSale: Boolean(c.onSale),
      isPromo,
      owned,
      createdAt: c.createdAt,
    };
  }

  // SINCRONIZAÇÃO REMOTA
  async syncWithRemote() {
    this.logger.log('Iniciando sincronização com API externa...');

    const urlAll = `${this.apiBase}/cosmetics`;
    const urlNew = `${this.apiBase}/cosmetics/new`;
    const urlShop = `${this.apiBase}/shop`;

    let allItems: any[] = [];
    let newItems: any[] = [];
    let shopItems: any[] = [];

    try {
      const [respAll, respNew, respShop] = await Promise.allSettled([
        axios.get(urlAll, { timeout: 30_000 }),
        axios.get(urlNew, { timeout: 30_000 }),
        axios.get(urlShop, { timeout: 30_000 }),
      ]);

      // normalize respAll
      if (respAll.status === 'fulfilled' && respAll.value?.data) {
        const payload = respAll.value.data;
        if (Array.isArray(payload.data)) allItems = payload.data;
        else if (payload.data && typeof payload.data === 'object') {
          if (Array.isArray(payload.data.br)) allItems = payload.data.br;
          else if (Array.isArray(payload.data.all)) allItems = payload.data.all;
          else {
            for (const v of Object.values(payload.data)) {
              if (Array.isArray(v)) {
                allItems = v;
                break;
              }
            }
          }
        }
        if (!allItems.length && Array.isArray(payload)) allItems = payload;
      }

      // normalize respNew
      if (respNew.status === 'fulfilled' && respNew.value?.data) {
        const payload = respNew.value.data;
        if (Array.isArray(payload.data)) newItems = payload.data;
        else if (Array.isArray(payload)) newItems = payload;
      }

      // normalize respShop
      if (respShop.status === 'fulfilled' && respShop.value?.data) {
        const payload = respShop.value.data;
        if (Array.isArray(payload.data)) shopItems = payload.data;
        else if (payload.data && typeof payload.data === 'object') {
          if (Array.isArray(payload.data.br)) shopItems = payload.data.br;
          else if (Array.isArray(payload.data.all)) shopItems = payload.data.all;
          else {
            for (const v of Object.values(payload.data)) {
              if (Array.isArray(v)) {
                shopItems = v;
                break;
              }
            }
          }
        }
        if (!shopItems.length && Array.isArray(payload)) shopItems = payload;
      }
    } catch (err) {
      this.logger.warn('Erro geral ao buscar API externa: ' + (err as Error).message);
    }

    // fallback to seed local
    if (!allItems.length) {
      const samplePath =
        process.env.SAMPLE_DATA_PATH || path.join(__dirname, '../data/sample-cosmetics.json');
      if (fs.existsSync(samplePath)) {
        const seed = JSON.parse(fs.readFileSync(samplePath, 'utf8'));
        allItems = Array.isArray(seed) ? seed : [];
      }
    }

    // new set
    const newSet = new Set<string>();
    for (const it of newItems) {
      const id = it?.id ?? it?.itemId ?? it?.offerId ?? it?.offer?.id ?? null;
      if (id) newSet.add(id);
    }

    // shop map extraction with safe helpers
    const shopMap = new Map<string, { regularPrice?: number; finalPrice?: number }>();

    const safeExtractIdAndPrices = (obj: any) => {
      if (!obj || typeof obj !== 'object') return null;
      // common direct shape
      if (obj.id) {
        const regular = Number(obj.regularPrice ?? obj.price ?? obj.priceInVbucks ?? null);
        const final = Number(obj.finalPrice ?? obj.price ?? null);
        return { id: String(obj.id), regular: isNaN(regular) ? undefined : regular, final: isNaN(final) ? undefined : final };
      }

      // other shapes: offerId, itemId, nested item.id
      const altId =
        obj.offerId ??
        obj.itemId ??
        (obj.item && obj.item.id ? obj.item.id : undefined) ??
        (obj.offer && obj.offer.id ? obj.offer.id : undefined) ??
        (obj.id && obj.images && obj.images.icon ? obj.id : undefined);

      if (altId) {
        const regular = Number(obj.regularPrice ?? obj.price ?? null);
        const final = Number(obj.finalPrice ?? obj.price ?? null);
        return { id: String(altId), regular: isNaN(regular) ? undefined : regular, final: isNaN(final) ? undefined : final };
      }

      // try inside children entry
      if (Array.isArray(obj.entries) && obj.entries.length) {
        for (const e of obj.entries) {
          const ex = safeExtractIdAndPrices(e);
          if (ex) return ex;
        }
      }

      return null;
    };

    for (const entry of shopItems) {
      if (!entry) continue;
      if (Array.isArray(entry.items)) {
        for (const it of entry.items) {
          const ex = safeExtractIdAndPrices(it);
          if (ex) shopMap.set(ex.id, { regularPrice: ex.regular, finalPrice: ex.final });
        }
      } else if (Array.isArray(entry.entries)) {
        for (const it of entry.entries) {
          const ex = safeExtractIdAndPrices(it);
          if (ex) shopMap.set(ex.id, { regularPrice: ex.regular, finalPrice: ex.final });
        }
      } else {
        const ex = safeExtractIdAndPrices(entry);
        if (ex) shopMap.set(ex.id, { regularPrice: ex.regular, finalPrice: ex.final });
      }
    }

    // Upsert items
    let updated = 0;
    for (const it of allItems) {
      try {
        const id = it?.id ?? it?.itemId ?? it?.offerId ?? (it?.item && it.item.id ? it.item.id : undefined);
        if (!id) continue;

        const name = it.name ?? it.displayName ?? it.title ?? 'Unknown';
        const description = it.description ?? it.text ?? null;
        const rarity = it?.rarity?.value ?? it?.rarity ?? null;
        const type = it?.type?.value ?? it?.type ?? null;
        const images = it.images ?? it.image ?? {};
        const image = images.icon ?? images.featured ?? images.smallIcon ?? (it.image ?? null);

        // createdAt detection
        let createdAt = new Date();
        if (it.added) {
          const d = new Date(it.added);
          if (!isNaN(d.getTime())) createdAt = d;
        } else if (it.firstSeen) {
          const d = new Date(it.firstSeen);
          if (!isNaN(d.getTime())) createdAt = d;
        }

        const basePrice = Number(it.price ?? it.priceInVbucks ?? it.cost ?? null);
        const price = !isNaN(basePrice) ? Math.round(basePrice) : 800;

        const shopEntry = shopMap.get(id);
        const regularPrice = shopEntry?.regularPrice ?? null;
        const finalPrice = shopEntry?.finalPrice ?? null;
        const onSale = !!shopEntry;
        const isNew = newSet.has(id);

        await this.prisma.cosmetic.upsert({
          where: { id },
          create: {
            id,
            name,
            description,
            type,
            rarity,
            image,
            price,
            regularPrice: regularPrice ?? undefined,
            finalPrice: finalPrice ?? undefined,
            isNew,
            onSale,
            createdAt,
          },
          update: {
            name,
            description,
            type,
            rarity,
            image,
            price,
            regularPrice: regularPrice ?? undefined,
            finalPrice: finalPrice ?? undefined,
            isNew,
            onSale,
          },
        });

        updated++;
      } catch (err: any) {
        this.logger.debug('Erro ao sincronizar item: ' + (err?.message ?? String(err)));
      }
    }

    this.logger.log(`Sincronização concluída. Processed ${allItems.length}, upserted ${updated}`);
    return { imported: allItems.length, updated };
  }
}
