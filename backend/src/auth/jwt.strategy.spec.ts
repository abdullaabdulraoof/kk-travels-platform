import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { AdminUser } from '../database/entities/admin-user.entity.js';
import { JwtStrategy } from './jwt.strategy.js';

describe('JwtStrategy', () => {
  const adminId = 'b6219718-74b8-41f0-a22d-14d842a144f5';
  let adminUsers: { findOneBy: ReturnType<typeof vi.fn> };
  let strategy: JwtStrategy;

  beforeEach(() => {
    adminUsers = { findOneBy: vi.fn() };
    strategy = new JwtStrategy(
      {
        getOrThrow: vi.fn().mockReturnValue('a'.repeat(32)),
      } as unknown as ConfigService,
      adminUsers as unknown as Repository<AdminUser>,
    );
  });

  it('loads the current admin from the database and ignores profile claims', async () => {
    adminUsers.findOneBy.mockResolvedValue({
      id: adminId,
      email: 'current@example.com',
      isActive: true,
    });

    const profile = await strategy.validate({
      sub: adminId,
      email: 'untrusted@example.com',
      isActive: false,
    });

    expect(adminUsers.findOneBy).toHaveBeenCalledWith({ id: adminId });
    expect(profile).toEqual({
      id: adminId,
      email: 'current@example.com',
      isActive: true,
    });
  });

  it('rejects invalid subjects, missing admins, and inactive admins', async () => {
    await expect(strategy.validate({ sub: 'not-a-uuid' })).rejects.toMatchObject({
      status: 401,
    });
    expect(adminUsers.findOneBy).not.toHaveBeenCalled();

    adminUsers.findOneBy.mockResolvedValue(null);
    await expect(strategy.validate({ sub: adminId })).rejects.toMatchObject({
      status: 401,
    });

    adminUsers.findOneBy.mockResolvedValue({
      id: adminId,
      email: 'owner@example.com',
      isActive: false,
    });
    await expect(strategy.validate({ sub: adminId })).rejects.toMatchObject({
      status: 401,
    });
  });
});
