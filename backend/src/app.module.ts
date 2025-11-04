import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CosmeticsModule } from './cosmetics/cosmetics.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [AuthModule, CosmeticsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
