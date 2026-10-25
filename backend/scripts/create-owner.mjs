import * as argon2 from 'argon2';
import { isEmail } from 'class-validator';
import { QueryFailedError } from 'typeorm';
import { AppDataSource } from '../dist/database/data-source.js';
import {
  AdminRole,
  AdminUser,
} from '../dist/database/entities/admin-user.entity.js';

const ownerEmailInput = process.env.ADMIN_OWNER_EMAIL;
const ownerPassword = process.env.ADMIN_OWNER_PASSWORD;
delete process.env.ADMIN_OWNER_EMAIL;
delete process.env.ADMIN_OWNER_PASSWORD;
const configuredOwnerEmail = 'abdulraoof@mail.com';

class OwnerAlreadyExistsError extends Error {}

function isDuplicateKeyError(error) {
  return (
    error instanceof QueryFailedError &&
    error.driverError.code === '23505'
  );
}

async function createOwner() {
  if (typeof ownerEmailInput !== 'string' || typeof ownerPassword !== 'string') {
    console.error(
      'Set ADMIN_OWNER_EMAIL and ADMIN_OWNER_PASSWORD in the process environment to initialize the owner.',
    );
    process.exitCode = 1;
    return;
  }

  const email = ownerEmailInput.trim().toLowerCase();

  if (!isEmail(email) || email.length > 255) {
    console.error('ADMIN_OWNER_EMAIL must be a valid email address.');
    process.exitCode = 1;
    return;
  }

  if (email !== configuredOwnerEmail) {
    console.error('ADMIN_OWNER_EMAIL does not match the configured owner account.');
    process.exitCode = 1;
    return;
  }

  if (ownerPassword.length < 12) {
    console.error('ADMIN_OWNER_PASSWORD must be at least 12 characters long.');
    process.exitCode = 1;
    return;
  }

  try {
    await AppDataSource.initialize();
    await AppDataSource.transaction(async (manager) => {
      await manager.query(
        "SELECT pg_advisory_xact_lock(20261025, hashtext('kk-travels-platform-owner-init'))",
      );

      const adminUsers = manager.getRepository(AdminUser);
      if ((await adminUsers.count()) > 0) {
        throw new OwnerAlreadyExistsError();
      }

      const passwordHash = await argon2.hash(ownerPassword);
      const owner = adminUsers.create({
        email,
        passwordHash,
        isActive: true,
        role: AdminRole.OWNER,
      });
      await adminUsers.save(owner);
    });

    console.log('Initial owner account created successfully.');
  } catch (error) {
    process.exitCode = 1;
    if (error instanceof OwnerAlreadyExistsError) {
      console.error('An admin account already exists; owner creation was refused.');
    } else if (isDuplicateKeyError(error)) {
      console.error('An admin account with that email already exists.');
    } else {
      console.error('Owner initialization failed because of a database error.');
    }
  } finally {
    if (AppDataSource.isInitialized) {
      try {
        await AppDataSource.destroy();
      } catch {
        console.error('The database connection could not be closed cleanly.');
        process.exitCode = 1;
      }
    }
  }
}

await createOwner();
