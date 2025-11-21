import { Controller, Get, Query, Param, NotFoundException, Res, HttpStatus, Post } from '@nestjs/common';
import { CosmeticsService, FindAllParams } from './cosmetics.service';

@Controller('cosmetics')
export class CosmeticsController {
  constructor(private readonly cosmeticsService: CosmeticsService) {}

  // =================================================
  // LISTAGEM COM FILTROS E PAGINAÇÃO
  // =================================================
  @Get()
  async findAll(
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

    return this.cosmeticsService.findAll(params);
  }

  // =========================
  // DETALHES DO COSMÉTICO
  // =========================
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const item = await this.cosmeticsService.findOne(id);
    if (!item) throw new NotFoundException('Cosmético não encontrado');
    return item;
  }

  // =========================
  // ROTA MANUAL DE SINCRONIZAÇÃO
  // =========================
  @Post('sync')
  async sync() {
    return this.cosmeticsService.syncWithRemote();
  }
}
