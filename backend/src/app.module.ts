import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CosmeticsModule } from './cosmetics/cosmetics.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ShopModule } from './shop/shop.module';

@Module({
  imports: [
    AuthModule,
    CosmeticsModule,
    ShopModule, // ✅ novo módulo da loja
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
