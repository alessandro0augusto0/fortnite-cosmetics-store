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

@Controller()
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @UseGuards(JwtAuthGuard)
  @Post(['shop/purchase', 'shop/buy'])
  async purchase(@Req() req, @Body() body: { cosmeticId: string }) {
    return this.shopService.purchaseCosmetic(req.user.sub, body.cosmeticId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(['shop/refund', 'shop/return'])
  async refund(@Req() req, @Body() body: { cosmeticId: string }) {
    return this.shopService.refundCosmetic(req.user.sub, body.cosmeticId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(['history', 'shop/history'])
  async history(@Req() req) {
    return this.shopService.getHistory(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get(['shop/purchases'])
  async purchases(@Req() req) {
    return this.shopService.getInventory(req.user.sub);
  }
}
