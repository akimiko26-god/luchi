import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { HealthStatus } from '@luchi/shared-types';
import { Public } from '../../iam/presentation/decorators/auth.decorators';
import { HealthService } from '../application/health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Liveness probe' })
  getHealth(): HealthStatus {
    return this.healthService.getHealth();
  }

  @Public()
  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe' })
  async getReady(): Promise<HealthStatus> {
    return this.healthService.getReadiness();
  }
}
