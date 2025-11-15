import { Controller, Get, Post, Res, HttpStatus } from '@nestjs/common';
import { CosmeticsService } from './cosmetics.service';

@Controller('cosmetics')
export class CosmeticsController {
  constructor(private readonly cosmeticsService: CosmeticsService) {}

  @Get()
  async findAll(@Res() res) {
    const items = await this.cosmeticsService.findAll();
    return res.status(HttpStatus.OK).json(items);
  }

  @Get('new')
  async findNew(@Res() res) {
    const items = await this.cosmeticsService.findNew();
    return res.status(HttpStatus.OK).json(items);
  }

  /**
   * Rota manual para sincronizar com a API externa.
   * Método: POST /cosmetics/sync
   * Use para forçar atualização imediata.
   */
  @Post('sync')
  async sync(@Res() res) {
    try {
      const result = await this.cosmeticsService.syncWithRemote();
      return res.status(HttpStatus.OK).json({
        message: 'Sincronização concluída',
        result,
      });
    } catch (err) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Falha na sincronização',
        error: (err as Error).message,
      });
    }
  }
}
