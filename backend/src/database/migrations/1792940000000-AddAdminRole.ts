import { MigrationInterface, QueryRunner } from 'typeorm';

const OWNER_EMAIL = 'abdulraoof@mail.com';

export class AddAdminRole1792940000000 implements MigrationInterface {
  name = 'AddAdminRole1792940000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const owners: Array<{ id: string }> = await queryRunner.query(
      `SELECT "id"
       FROM "admin_users"
       WHERE LOWER(BTRIM("email")) = $1`,
      [OWNER_EMAIL],
    );

    if (owners.length > 1) {
      throw new Error(
        'Multiple accounts match the configured owner email; refusing role migration.',
      );
    }

    await queryRunner.query(`
      ALTER TABLE "admin_users"
      ADD COLUMN "role" character varying(20) NOT NULL DEFAULT 'ADMIN'
    `);
    await queryRunner.query(`
      ALTER TABLE "admin_users"
      ADD CONSTRAINT "CHK_admin_users_role"
      CHECK ("role" IN ('OWNER', 'ADMIN'))
    `);

    if (owners.length === 1) {
      await queryRunner.query(
        `UPDATE "admin_users" SET "role" = 'OWNER' WHERE "id" = $1`,
        [owners[0].id],
      );
    }
  }

  public async down(): Promise<void> {
    throw new Error('This role migration is forward-only.');
  }
}
