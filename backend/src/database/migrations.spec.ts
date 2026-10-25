import { QueryRunner } from 'typeorm';
import { AddAdminRole1792940000000 } from './migrations/1792940000000-AddAdminRole.js';

describe('AddAdminRole1792940000000', () => {
  it('defaults admins to ADMIN and promotes only the configured owner account', async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce([{ id: 'owner-id' }])
      .mockResolvedValue([]);
    const queryRunner = { query } as unknown as QueryRunner;
    const migration = new AddAdminRole1792940000000();

    await migration.up(queryRunner);

    expect(query).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('LOWER(BTRIM("email"))'),
      ['abdulraoof@mail.com'],
    );
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining(`DEFAULT 'ADMIN'`),
    );
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining(`CHECK ("role" IN ('OWNER', 'ADMIN'))`),
    );
    expect(query).toHaveBeenCalledWith(
      `UPDATE "admin_users" SET "role" = 'OWNER' WHERE "id" = $1`,
      ['owner-id'],
    );
  });

  it('refuses to promote an ambiguous duplicate owner identity', async () => {
    const query = vi.fn().mockResolvedValue([
      { id: 'owner-id-1' },
      { id: 'owner-id-2' },
    ]);
    const migration = new AddAdminRole1792940000000();

    await expect(
      migration.up({ query } as unknown as QueryRunner),
    ).rejects.toThrow('Multiple accounts match the configured owner email');

    expect(query).toHaveBeenCalledOnce();
  });
});
