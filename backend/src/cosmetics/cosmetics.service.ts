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

  // ============================================
  // LISTAGEM COM PAGINAÇÃO + FILTROS + ORDENAÇÃO
  // ============================================
  async findAll(params: FindAllParams = {}) {
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
      orderBy.createdAt = 'desc'; // padrão
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

    return {
      data,
      meta: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // ========================
  // DETALHES DE UM COSMÉTICO
  // ========================
  async findOne(id: string) {
    return this.prisma.cosmetic.findUnique({ where: { id } });
  }

  // ========================
  // SINCRONIZAÇÃO REMOTA
  // ========================
  async syncWithRemote() {
    this.logger.log('Iniciando sincronização...');

    const useRemote = process.env.FORCE_REMOTE_SYNC === 'true';
    let items: any[] = [];

    try {
      if (useRemote) {
        const res = await axios.get(`${this.apiBase}/cosmetics`);
        if (res.data?.data && Array.isArray(res.data.data)) {
          items = res.data.data.map((it: any) => ({
            id: it.id,
            name: it.name,
            description: it.description || it.description?.plain || null,
            type: it.type || it.type?.value || null,
            rarity: it.rarity || it.rarity?.value || null,
            image: it.images?.icon || it.images?.featured || null,
            price: it.price ?? 800,
            createdAt: it.added ? new Date(it.added) : new Date(),
          }));
        }
      }
    } catch {
      this.logger.warn('Falha ao buscar API remota — fallback para seed local.');
    }

    if (!items.length) {
      const samplePath =
        process.env.SAMPLE_DATA_PATH ||
        path.join(__dirname, '../data/sample-cosmetics.json');

      if (fs.existsSync(samplePath)) {
        items = JSON.parse(fs.readFileSync(samplePath, 'utf-8')).map((it: any) => ({
          id: it.id,
          name: it.name,
          description: it.description || null,
          type: it.type || null,
          rarity: it.rarity || null,
          image: it.image || null,
          price: it.price ?? 800,
          createdAt: it.createdAt ? new Date(it.createdAt) : new Date(),
        }));
      }
    }

    let updated = 0;
    for (const it of items) {
      try {
        await this.prisma.cosmetic.upsert({
          where: { id: it.id },
          update: it,
          create: it,
        });
        updated++;
      } catch (err) {
        this.logger.debug('Erro ao sincronizar item: ' + err.message);
      }
    }

    return { imported: items.length, updated };
  }
}
