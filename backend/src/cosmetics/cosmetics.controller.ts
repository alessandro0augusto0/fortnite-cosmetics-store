import { Controller, Get, Query, Param, NotFoundException, Post, Req } from '@nestjs/common';
import { CosmeticsService, FindAllParams } from './cosmetics.service';
import * as jwt from 'jsonwebtoken';
import type { Request } from 'express';

@Controller('cosmetics')
export class CosmeticsController {
  constructor(private readonly cosmeticsService: CosmeticsService) {}

  // LISTAGEM COM FILTROS E PAGINAÇÃO (public)
  @Get()
  async findAll(
    @Req() req: Request,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('q') q?: string,
    @Query('type') type?: string,
    @Query('rarity') rarity?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    const params: FindAllParams = {
      page: Number(page) || 1,
      limit: Number(limit) || 20,
      q,
      type,
      rarity,
      dateFrom,
      dateTo,
      sortBy,
      sortOrder,
    };

    // Try to extract user id from Authorization header (if provided)
    let currentUserId: string | undefined = undefined;
    try {
      const auth = req.headers['authorization'] as string | undefined;
      if (auth && auth.startsWith('Bearer ')) {
        const token = auth.split(' ')[1];
        const secret = process.env.JWT_SECRET || 'supersegredo123';
        const decoded = jwt.verify(token, secret) as any;
        if (decoded?.sub) currentUserId = decoded.sub;
      }
    } catch (e) {
      // ignore invalid token — user will be considered anonymous
    }

    return this.cosmeticsService.findAll(params, currentUserId);
  }

  // DETALHES DO COSMÉTICO
  @Get(':id')
  async findOne(@Req() req: Request, @Param('id') id: string) {
    let currentUserId: string | undefined = undefined;
    try {
      const auth = req.headers['authorization'] as string | undefined;
      if (auth && auth.startsWith('Bearer ')) {
        const token = auth.split(' ')[1];
        const secret = process.env.JWT_SECRET || 'supersegredo123';
        const decoded = jwt.verify(token, secret) as any;
        if (decoded?.sub) currentUserId = decoded.sub;
      }
    } catch {
      // ignore
    }

    const item = await this.cosmeticsService.findOne(id, currentUserId);
    if (!item) throw new NotFoundException('Cosmético não encontrado');
    return item;
  }

  // ROTA MANUAL DE SINCRONIZAÇÃO
  @Post('sync')
  async sync() {
    return this.cosmeticsService.syncWithRemote();
  }
}
