import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CosmeticsService } from './cosmetics.service';
import { CosmeticsController } from './cosmetics.controller';

@Module({
  imports: [HttpModule],
  controllers: [CosmeticsController],
  providers: [CosmeticsService],
})
export class CosmeticsModule {}
