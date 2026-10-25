import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { Repository } from 'typeorm';
import { AdminRole, AdminUser } from '../database/entities/admin-user.entity.js';
import { AuthService } from './auth.service.js';

describe('AuthService', () => {
  const adminId = 'b6219718-74b8-41f0-a22d-14d842a144f5';
  const password = 'correct horse battery staple';
  let passwordHash: string;
  let adminUsers: { findOneBy: ReturnType<typeof vi.fn> };
  let jwtService: { signAsync: ReturnType<typeof vi.fn> };
  let authService: AuthService;

  beforeAll(async () => {
    passwordHash = await argon2.hash(password);
  });

  beforeEach(() => {
    adminUsers = { findOneBy: vi.fn() };
    jwtService = { signAsync: vi.fn().mockResolvedValue('signed-token') };
    authService = new AuthService(
      adminUsers as unknown as Repository<AdminUser>,
      jwtService as unknown as JwtService,
    );
  });

  it('normalizes the email and returns only a safe profile with the token', async () => {
    adminUsers.findOneBy.mockResolvedValue({
      id: adminId,
      email: 'abdulraoof@mail.com',
      passwordHash,
      isActive: true,
      role: AdminRole.OWNER,
    });

    await expect(
      authService.login({
        email: '  ABDULRAOOF@MAIL.COM ',
        password,
      }),
    ).resolves.toEqual({
      accessToken: 'signed-token',
      admin: {
        id: adminId,
        email: 'abdulraoof@mail.com',
        isActive: true,
        role: AdminRole.OWNER,
      },
    });

    expect(adminUsers.findOneBy).toHaveBeenCalledWith({
      email: 'abdulraoof@mail.com',
    });
    expect(jwtService.signAsync).toHaveBeenCalledWith({ sub: adminId });
  });

  it('returns the same unauthorized response for unknown, inactive, or invalid credentials', async () => {
    adminUsers.findOneBy.mockResolvedValue(null);
    await expect(
      authService.login({ email: 'unknown@example.com', password }),
    ).rejects.toMatchObject({
      status: 401,
      message: 'Invalid email or password',
    });

    adminUsers.findOneBy.mockResolvedValue({
      id: adminId,
      email: 'owner@example.com',
      passwordHash,
      isActive: false,
      role: AdminRole.OWNER,
    });
    await expect(
      authService.login({ email: 'owner@example.com', password }),
    ).rejects.toMatchObject({
      status: 401,
      message: 'Invalid email or password',
    });

    adminUsers.findOneBy.mockResolvedValue({
      id: adminId,
      email: 'owner@example.com',
      passwordHash,
      isActive: true,
      role: AdminRole.ADMIN,
    });
    await expect(
      authService.login({
        email: 'owner@example.com',
        password: 'incorrect password',
      }),
    ).rejects.toMatchObject({
      status: 401,
      message: 'Invalid email or password',
    });

    expect(jwtService.signAsync).not.toHaveBeenCalled();
  });
});
