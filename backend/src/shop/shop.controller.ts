import { Controller, Post, Get, Body, UseGuards, Req } from '@nestjs/common';
import { ShopService } from './shop.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('shop')
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @UseGuards(JwtAuthGuard)
  @Post('buy')
  async buy(
    @Req() req,
    @Body() body: { cosmeticId: string; cosmeticName: string; price?: number },
  ) {
    const price = body.price ?? 800; // preço padrão se não vier no body
    return this.shopService.buyCosmetic(req.user.sub, body.cosmeticId, body.cosmeticName, price);
  }

  @UseGuards(JwtAuthGuard)
  @Get('purchases')
  async getPurchases(@Req() req) {
    return this.shopService.getPurchases(req.user.sub);
  }
}
