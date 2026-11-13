import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Controller('health')
export class HealthController {
  constructor(private readonly dataSource: DataSource) {}

  @Get()
  async check() {
    try {
      await this.dataSource.query('SELECT 1');
    } catch {
      throw new ServiceUnavailableException('La base de datos no está disponible.');
    }

    return {
      status: 'ok',
      service: 'inktatto-api',
      timestamp: new Date().toISOString(),
    };
  }
}
