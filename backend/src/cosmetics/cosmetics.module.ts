import { Module } from '@nestjs/common';
import { CosmeticsService } from './cosmetics.service';
import { CosmeticsController } from './cosmetics.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { FortniteSyncService } from './fortnite-sync.service';

@Module({
  imports: [PrismaModule],
  controllers: [CosmeticsController],
  providers: [CosmeticsService, FortniteSyncService],
  exports: [CosmeticsService],
})
export class CosmeticsModule {}
