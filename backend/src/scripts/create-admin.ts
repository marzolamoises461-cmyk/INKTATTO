import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import dataSource from '../database/data-source';

async function main(): Promise<void> {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const fullName = process.env.ADMIN_FULL_NAME?.trim();
  if (!email || !password || !fullName) {
    throw new Error('Define ADMIN_EMAIL, ADMIN_PASSWORD y ADMIN_FULL_NAME temporalmente en el entorno.');
  }
  if (password.length < 12 || password.length > 72) {
    throw new Error('La contraseña de administrador debe tener entre 12 y 72 caracteres.');
  }
  await dataSource.initialize();
  try {
    await dataSource.runMigrations();
    const existing = await dataSource.query('SELECT id FROM users WHERE email = ? LIMIT 1', [email]) as Array<{ id: number }>;
    const hash = await bcrypt.hash(password, 12);
    if (existing.length) {
      await dataSource.query("UPDATE users SET full_name = ?, password = ?, role = 'admin', is_active = 1 WHERE id = ?", [fullName, hash, existing[0].id]);
      process.stdout.write('La cuenta existente fue actualizada como administradora.\n');
    } else {
      await dataSource.query("INSERT INTO users (email, password, full_name, role, is_active) VALUES (?, ?, ?, 'admin', 1)", [email, hash, fullName]);
      process.stdout.write('Cuenta administradora creada correctamente.\n');
    }
  } finally {
    await dataSource.destroy();
  }
}
main().catch((error: unknown) => {
  process.stderr.write((error instanceof Error ? error.message : String(error)) + '\n');
  process.exitCode = 1;
});
