import { Module } from '@nestjs/common';
import { ShopService } from './shop.service';
import { ShopController } from './shop.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [ShopService, PrismaService],
  controllers: [ShopController],
})
export class ShopModule {}
