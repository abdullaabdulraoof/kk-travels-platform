import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { Repository } from 'typeorm';
import { AdminUser } from '../database/entities/admin-user.entity.js';
import { LoginDto } from './dto/login.dto.js';
import { SafeAdminProfile } from './types.js';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AdminUser)
    private readonly adminUsers: Repository<AdminUser>,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const email = loginDto.email.trim().toLowerCase();
    const admin = await this.adminUsers.findOneBy({ email });

    if (
      !admin ||
      !admin.isActive ||
      !(await argon2.verify(admin.passwordHash, loginDto.password))
    ) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const accessToken = await this.jwtService.signAsync({ sub: admin.id });

    return {
      accessToken,
      admin: this.toSafeProfile(admin),
    };
  }

  toSafeProfile(admin: AdminUser): SafeAdminProfile {
    return {
      id: admin.id,
      email: admin.email,
      isActive: admin.isActive,
    };
  }
}
