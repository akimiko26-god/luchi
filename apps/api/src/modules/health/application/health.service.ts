import { Injectable } from '@nestjs/common';
import type { HealthStatus } from '@luchi/shared-types';
import { PrismaService } from '../../../shared/infrastructure/database/prisma.service';

const APP_VERSION = '0.1.0';

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  getHealth(): HealthStatus {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: APP_VERSION,
    };
  }

  async getReadiness(): Promise<HealthStatus> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: APP_VERSION,
      };
    } catch {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        version: APP_VERSION,
      };
    }
  }
}
