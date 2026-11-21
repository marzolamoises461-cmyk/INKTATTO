import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import dataSource from '../database/data-source';

async function main(): Promise<void> {
  const rl = readline.createInterface({ input, output });

  try {
    const email = (await rl.question('Correo del administrador: '))
      .trim()
      .toLowerCase();

    const password = await rl.question('Nueva contraseña: ');

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('El correo no es válido.');
    }

    if (
      password.length < 12 ||
      password.length > 72 ||
      !/[a-z]/.test(password) ||
      !/[A-Z]/.test(password) ||
      !/[0-9]/.test(password) ||
      !/[^A-Za-z0-9]/.test(password)
    ) {
      throw new Error(
        'Usa entre 12 y 72 caracteres, con mayúscula, minúscula, número y símbolo.',
      );
    }

    await dataSource.initialize();

    try {
      const users = (await dataSource.query(
        "SELECT id FROM users WHERE LOWER(email) = ? AND role = 'admin' LIMIT 1",
        [email],
      )) as Array<{ id: number }>;

      if (users.length === 0) {
        throw new Error('No existe un administrador con ese correo.');
      }

      const hash = await bcrypt.hash(password, 12);

      await dataSource.query(
        'UPDATE users SET password = ? WHERE id = ?',
        [hash, users[0].id],
      );

      console.log('Contraseña del administrador actualizada correctamente.');
    } finally {
      await dataSource.destroy();
    }
  } finally {
    rl.close();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
