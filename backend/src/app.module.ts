import { Module } from '@nestjs/common';
import { CosmeticsModule } from './cosmetics/cosmetics.module';
import { PrismaModule } from './prisma/prisma.module';
import { ShopModule } from './shop/shop.module';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// IMPORTANTE: importe a SyncTask
import { SyncTask } from './tasks/sync.task';

@Module({
  imports: [
    PrismaModule,
    CosmeticsModule,
    ShopModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    SyncTask, // <---- AQUI REGISTRA O CRON
  ],
})
export class AppModule {}
