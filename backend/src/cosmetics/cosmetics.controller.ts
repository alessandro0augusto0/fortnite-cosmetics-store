import { Controller, Get } from '@nestjs/common';
import { CosmeticsService } from './cosmetics.service';

@Controller('cosmetics')
export class CosmeticsController {
  constructor(private readonly cosmeticsService: CosmeticsService) {}

  @Get()
  getAll() {
    return this.cosmeticsService.getAll();
  }

  @Get('new')
  getNew() {
    return this.cosmeticsService.getNew();
  }

  @Get('shop')
  getShop() {
    return this.cosmeticsService.getShop();
  }
}
