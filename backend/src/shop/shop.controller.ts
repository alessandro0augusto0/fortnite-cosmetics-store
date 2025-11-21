import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ShopService } from './shop.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('shop')
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  // ============================================================
  // COMPRA
  // ============================================================
  @UseGuards(JwtAuthGuard)
  @Post('buy')
  async buy(
    @Req() req,
    @Body() body: { cosmeticId: string; cosmeticName: string; price?: number },
  ) {
    const price = body.price ?? 800;
    return this.shopService.buyCosmetic(
      req.user.sub,
      body.cosmeticId,
      body.cosmeticName,
      price,
    );
  }

  // ============================================================
  // HISTÓRICO DE COMPRAS
  // ============================================================
  @UseGuards(JwtAuthGuard)
  @Get('purchases')
  async getPurchases(@Req() req) {
    return this.shopService.getPurchases(req.user.sub);
  }

  // ============================================================
  // DEVOLUÇÃO
  // ============================================================
  @UseGuards(JwtAuthGuard)
  @Post('return')
  async returnPurchase(
    @Req() req,
    @Body() body: { purchaseId: string },
  ) {
    return this.shopService.returnPurchase(
      req.user.sub,
      body.purchaseId,
    );
  }
}
