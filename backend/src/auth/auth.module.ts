import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtStrategy } from './jwt.strategy';
import { LegacyAuthController } from './legacy-auth.controller';

@Module({
  imports: [
    PrismaModule, // <-- FALTAVA ISSO
    PassportModule,
    JwtModule.register({
      secret: 'supersegredo123',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController, LegacyAuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
