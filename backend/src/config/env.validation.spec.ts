import { validateEnvironment } from './env.validation';

const validEnvironment = () => ({
  DB_HOST: '127.0.0.1',
  DB_USERNAME: 'inktatto_app',
  DB_PASSWORD: 'local-test-password',
  DB_DATABASE: 'inktatto_db',
  JWT_SECRET: 'a-random-test-secret-with-more-than-32-characters',
});

describe('validateEnvironment', () => {
  it('applies safe defaults and normalizes configured CORS origins', () => {
    const result = validateEnvironment({
      ...validEnvironment(),
      CORS_ORIGIN: 'http://localhost:3000/, https://inktatto.example',
    });

    expect(result.PORT).toBe('3001');
    expect(result.DB_PORT).toBe('3306');
    expect(result.JWT_EXPIRATION).toBe('3600');
    expect(result.CORS_ORIGIN).toBe('http://localhost:3000,https://inktatto.example');
  });

  it('requires database credentials and a strong JWT secret', () => {
    expect(() => validateEnvironment({
      ...validEnvironment(),
      DB_PASSWORD: '',
    })).toThrow('DB_PASSWORD es obligatoria');

    expect(() => validateEnvironment({
      ...validEnvironment(),
      JWT_SECRET: 'short',
    })).toThrow('JWT_SECRET debe ser una clave aleatoria');
  });

  it('rejects wildcard CORS and invalid ports', () => {
    expect(() => validateEnvironment({
      ...validEnvironment(),
      CORS_ORIGIN: '*',
    })).toThrow('CORS_ORIGIN no puede permitir todos los orígenes');

    expect(() => validateEnvironment({
      ...validEnvironment(),
      DB_PORT: '70000',
    })).toThrow('DB_PORT debe estar entre 1 y 65535');
  });
});
