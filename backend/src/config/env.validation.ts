const DEFAULTS = {
  PORT: '3001',
  DB_PORT: '3306',
  JWT_EXPIRATION: '3600',
  CORS_ORIGIN: 'http://localhost:3000',
};

function requiredString(config: Record<string, unknown>, key: string): string {
  const value = config[key];
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`La variable de entorno ${key} es obligatoria.`);
  }
  return value.trim();
}

function positiveInteger(value: unknown, key: string): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`La variable de entorno ${key} debe ser un entero positivo.`);
  }
  return parsed;
}

export function validateEnvironment(
  config: Record<string, unknown>,
): Record<string, unknown> {
  const dbHost = requiredString(config, 'DB_HOST');
  const dbUsername = requiredString(config, 'DB_USERNAME');
  const dbPassword = requiredString(config, 'DB_PASSWORD');
  const dbDatabase = requiredString(config, 'DB_DATABASE');
  const jwtSecret = requiredString(config, 'JWT_SECRET');

  if (jwtSecret.length < 32 || /replace_with|change_me|secret_here/i.test(jwtSecret)) {
    throw new Error('JWT_SECRET debe ser una clave aleatoria de al menos 32 caracteres.');
  }

  const port = positiveInteger(config.PORT ?? DEFAULTS.PORT, 'PORT');
  if (port > 65535) throw new Error('PORT debe estar entre 1 y 65535.');

  const dbPort = positiveInteger(config.DB_PORT ?? DEFAULTS.DB_PORT, 'DB_PORT');
  if (dbPort > 65535) throw new Error('DB_PORT debe estar entre 1 y 65535.');

  const jwtExpiration = positiveInteger(
    config.JWT_EXPIRATION ?? DEFAULTS.JWT_EXPIRATION,
    'JWT_EXPIRATION',
  );

  const corsOrigins = String(config.CORS_ORIGIN ?? DEFAULTS.CORS_ORIGIN)
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
    .map((origin) => {
      if (origin === '*') {
        throw new Error('CORS_ORIGIN no puede permitir todos los orígenes (*).');
      }
      let parsed: URL;
      try {
        parsed = new URL(origin);
      } catch {
        throw new Error('Cada origen de CORS_ORIGIN debe ser una URL válida.');
      }
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        throw new Error('CORS_ORIGIN solo admite orígenes HTTP o HTTPS.');
      }
      return parsed.origin;
    });

  if (corsOrigins.length === 0) {
    throw new Error('CORS_ORIGIN debe contener al menos un origen permitido.');
  }

  const frontendUrl = config.FRONTEND_URL;
  if (frontendUrl !== undefined && String(frontendUrl).trim()) {
    let parsedFrontendUrl: URL;
    try {
      parsedFrontendUrl = new URL(String(frontendUrl).trim());
    } catch {
      throw new Error('FRONTEND_URL debe ser una URL válida.');
    }
    if (!['http:', 'https:'].includes(parsedFrontendUrl.protocol) || parsedFrontendUrl.username || parsedFrontendUrl.password) {
      throw new Error('FRONTEND_URL debe usar HTTP o HTTPS y no puede contener credenciales.');
    }
  }

  return {
    ...config,
    DB_HOST: dbHost,
    DB_USERNAME: dbUsername,
    DB_PASSWORD: dbPassword,
    DB_DATABASE: dbDatabase,
    JWT_SECRET: jwtSecret,
    PORT: String(port),
    DB_PORT: String(dbPort),
    JWT_EXPIRATION: String(jwtExpiration),
    CORS_ORIGIN: corsOrigins.join(','),
    ...(frontendUrl !== undefined ? { FRONTEND_URL: String(frontendUrl).trim() } : {}),
  };
}
