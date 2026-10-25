
import * as argon2 from 'argon2';
import { isEmail } from 'class-validator';
import { QueryFailedError } from 'typeorm';
import { stdin, stdout } from 'node:process';
import { AppDataSource } from '../../dist/database/data-source.js';
import {
  AdminRole,
  AdminUser,
} from '../../dist/database/entities/admin-user.entity.js';

const ADMIN_OWNER_EMAIL = 'abdulraoof@mail.com';

class OwnerAlreadyExistsError extends Error {}

function isDuplicateKeyError(error) {
  return (
    error instanceof QueryFailedError &&
    error.driverError?.code === '23505'
  );
}

async function readHiddenPassword() {
  stdout.write('Enter owner password (minimum 12 characters): ');

  return new Promise((resolve, reject) => {
    let password = '';

    // Disable terminal echo so the password is not displayed.
    if (stdin.isTTY && typeof stdin.setRawMode === 'function') {
      stdin.setRawMode(true);
    }

    const onData = (data) => {
      for (const char of data.toString()) {
        if (char === '\u0003') {
          cleanup();
          stdout.write('\n');
          reject(new Error('Password entry cancelled.'));
          return;
        }

        if (char === '\r' || char === '\n') {
          cleanup();
          stdout.write('\n');
          resolve(password);
          return;
        }

        if (char === '\u007f' || char === '\b') {
          password = password.slice(0, -1);
          continue;
        }

        password += char;
      }
    };

    function cleanup() {
      stdin.removeListener('data', onData);

      if (stdin.isTTY && typeof stdin.setRawMode === 'function') {
        stdin.setRawMode(false);
      }

      stdin.pause();
    }

    stdin.on('data', onData);
    stdin.resume();
  });
}

async function createOwner() {
  if (!isEmail(ADMIN_OWNER_EMAIL) || ADMIN_OWNER_EMAIL.length > 255) {
    console.error('The configured owner email is invalid.');
    process.exitCode = 1;
    return;
  }

  let password;

  try {
    password = await readHiddenPassword();

    if (password.length < 12) {
      console.error('Password must be at least 12 characters long.');
      process.exitCode = 1;
      return;
    }

    await AppDataSource.initialize();

    await AppDataSource.transaction(async (manager) => {
      await manager.query(
        "SELECT pg_advisory_xact_lock(20261025, hashtext('kk-travels-platform-owner-init'))",
      );

      const adminUsers = manager.getRepository(AdminUser);

      if ((await adminUsers.count()) > 0) {
        throw new OwnerAlreadyExistsError();
      }

      const passwordHash = await argon2.hash(password);

      const owner = adminUsers.create({
        email: ADMIN_OWNER_EMAIL.toLowerCase(),
        passwordHash,
        isActive: true,
        role: AdminRole.OWNER,
      });

      await adminUsers.save(owner);
    });

    console.log('Owner account created successfully.');
    console.log(`Owner email: ${ADMIN_OWNER_EMAIL}`);
  } catch (error) {
    process.exitCode = 1;

    if (error instanceof OwnerAlreadyExistsError) {
      console.error(
        'An admin account already exists. Owner creation was refused.',
      );
    } else if (isDuplicateKeyError(error)) {
      console.error('An account with this email already exists.');
    } else if (error instanceof Error && error.message === 'Password entry cancelled.') {
      console.error('Owner creation cancelled.');
    } else {
      console.error(
        'Owner creation failed. Check your database configuration and connection.',
      );
    }
  } finally {
    password = undefined;

    if (AppDataSource.isInitialized) {
      try {
        await AppDataSource.destroy();
      } catch {
        console.error('Could not close the database connection cleanly.');
        process.exitCode = 1;
      }
    }
  }
}

await createOwner();
