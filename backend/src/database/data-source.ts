import 'dotenv/config';
import { DataSource } from 'typeorm';

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`La variable de entorno ${name} es obligatoria para ejecutar migraciones.`);
  }
  return value;
}

const dbPort = Number(process.env.DB_PORT ?? 3306);
if (!Number.isInteger(dbPort) || dbPort < 1 || dbPort > 65535) {
  throw new Error('DB_PORT debe ser un entero entre 1 y 65535.');
}

export default new DataSource({
  type: 'mysql',
  host: requiredEnv('DB_HOST'),
  port: dbPort,
  username: requiredEnv('DB_USERNAME'),
  password: requiredEnv('DB_PASSWORD'),
  database: requiredEnv('DB_DATABASE'),
  ssl: process.env.DB_SSL === 'true' ? {} : undefined,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  migrationsTableName: 'typeorm_migrations',
  synchronize: false,
});
