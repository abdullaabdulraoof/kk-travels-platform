import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { isUUID } from 'class-validator';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminUser } from '../database/entities/admin-user.entity.js';
import { getJwtSecret } from './jwt-secret.js';
import { SafeAdminProfile } from './types.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    @InjectRepository(AdminUser)
    private readonly adminUsers: Repository<AdminUser>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: getJwtSecret(configService),
      algorithms: ['HS256'],
    });
  }

  async validate(payload: unknown): Promise<SafeAdminProfile> {
    const subject =
      typeof payload === 'object' && payload !== null && 'sub' in payload
        ? payload.sub
        : undefined;

    if (typeof subject !== 'string' || !isUUID(subject)) {
      throw new UnauthorizedException();
    }

    const admin = await this.adminUsers.findOneBy({ id: subject });

    if (!admin || !admin.isActive) {
      throw new UnauthorizedException();
    }

    return {
      id: admin.id,
      email: admin.email,
      isActive: admin.isActive,
    };
  }
}
