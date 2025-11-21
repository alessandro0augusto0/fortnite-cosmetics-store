import { Module } from '@nestjs/common';
import { CosmeticsModule } from './cosmetics/cosmetics.module';
import { PrismaModule } from './prisma/prisma.module';
import { ShopModule } from './shop/shop.module';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { SyncTask } from './tasks/sync.task';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    PrismaModule,
    CosmeticsModule,
    ShopModule,
    AuthModule,
    UsersModule, // <- Módulo de usuários funcionando
  ],
  controllers: [AppController],
  providers: [
    AppService,
    SyncTask,
  ],
})
export class AppModule {}
