import { Module } from '@nestjs/common';
import { CosmeticsService } from './cosmetics.service';
import { CosmeticsController } from './cosmetics.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CosmeticsController],
  providers: [CosmeticsService],
})
export class CosmeticsModule {}
