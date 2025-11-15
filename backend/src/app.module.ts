import { Module } from '@nestjs/common';
import { CosmeticsModule } from './cosmetics/cosmetics.module';
import { PrismaModule } from './prisma/prisma.module';
import { ShopModule } from './shop/shop.module';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [PrismaModule, CosmeticsModule, ShopModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
