import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'supersegredo123', // igual ao AuthModule
    });
  }

  /**
   * Payload padrão:
   * {
   *   sub: userId,
   *   email: userEmail,
   *   iat: timestamp,
   *   exp: timestamp
   * }
   */
  async validate(payload: any) {
    return {
      sub: payload.sub,
      email: payload.email,
    };
  }
}
