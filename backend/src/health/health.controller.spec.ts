import { ServiceUnavailableException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  const dataSource = { query: jest.fn() };
  let controller: HealthController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new HealthController(dataSource as unknown as DataSource);
  });

  it('reports healthy only after a successful database query', async () => {
    dataSource.query.mockResolvedValue([{ 1: 1 }]);

    const result = await controller.check();

    expect(dataSource.query).toHaveBeenCalledWith('SELECT 1');
    expect(result.status).toBe('ok');
    expect(result.service).toBe('inktatto-api');
  });

  it('returns service unavailable when the database query fails', async () => {
    dataSource.query.mockRejectedValue(new Error('database connection failed'));

    await expect(controller.check()).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});