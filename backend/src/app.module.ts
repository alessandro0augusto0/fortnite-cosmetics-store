import { Module } from '@nestjs/common';
import { CosmeticsModule } from './cosmetics/cosmetics.module';
import { PrismaModule } from './prisma/prisma.module';
import { ShopModule } from './shop/shop.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [PrismaModule, CosmeticsModule, ShopModule, AuthModule],
})
export class AppModule {}
