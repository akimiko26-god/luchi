import { HealthService } from './health.service';

describe('HealthService', () => {
  const prisma = {
    $queryRaw: jest.fn(),
  };

  let service: HealthService;

  beforeEach(() => {
    service = new HealthService(prisma as never);
    jest.clearAllMocks();
  });

  it('should return ok for liveness', () => {
    const result = service.getHealth();
    expect(result.status).toBe('ok');
    expect(result.version).toBe('0.1.0');
  });

  it('should return ok when database is reachable', async () => {
    prisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);
    const result = await service.getReadiness();
    expect(result.status).toBe('ok');
  });

  it('should return error when database is unreachable', async () => {
    prisma.$queryRaw.mockRejectedValue(new Error('connection refused'));
    const result = await service.getReadiness();
    expect(result.status).toBe('error');
  });
});
