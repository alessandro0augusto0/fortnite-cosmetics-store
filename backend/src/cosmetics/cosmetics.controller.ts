import { Controller, Get, Query, Param, NotFoundException, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import { CosmeticsService, FindAllParams } from './cosmetics.service';

type ListQuery = {
  page?: string;
  search?: string;
  q?: string;
  type?: string;
  rarity?: string;
  isNew?: string;
  isOnSale?: string;
};

@Controller('cosmetics')
export class CosmeticsController {
  private readonly jwtSecret = process.env.JWT_SECRET || 'supersecret_eso_key';

  constructor(private readonly cosmeticsService: CosmeticsService) {}

  @Get()
  async findAll(@Req() req: Request, @Query() query: ListQuery) {
    const params: FindAllParams = {
      page: query.page ? Number(query.page) : 1,
      search: query.search ?? query.q,
      type: query.type,
      rarity: query.rarity,
      isNew: query.isNew,
      isOnSale: query.isOnSale,
    };

    return this.cosmeticsService.findAll(params, this.extractUserId(req));
  }

  @Get(':id')
  async findOne(@Req() req: Request, @Param('id') id: string) {
    const item = await this.cosmeticsService.findOne(id, this.extractUserId(req));
    if (!item) {
      throw new NotFoundException('Cosmético não encontrado');
    }
    return item;
  }

  @Post('sync')
  async sync() {
    return this.cosmeticsService.syncWithRemote();
  }

  private extractUserId(req: Request): string | undefined {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) return undefined;

    try {
      const token = auth.split(' ')[1];
      const decoded = jwt.verify(token, this.jwtSecret) as { sub?: string; id?: string };
      return decoded.sub ?? decoded.id;
    } catch {
      return undefined;
    }
  }
}
