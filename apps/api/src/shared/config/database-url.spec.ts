import { ensureProductionDatabaseSsl } from './database-url';

describe('ensureProductionDatabaseSsl', () => {
  const originalEnv = process.env.NODE_ENV;
  const originalUrl = process.env.DATABASE_URL;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    if (originalUrl === undefined) {
      delete process.env.DATABASE_URL;
    } else {
      process.env.DATABASE_URL = originalUrl;
    }
  });

  it('adds sslmode for Render public host in production', () => {
    process.env.NODE_ENV = 'production';
    process.env.DATABASE_URL = 'postgresql://luchi:pass@dpg-abc.frankfurt-postgres.render.com/luchi';
    ensureProductionDatabaseSsl();
    expect(process.env.DATABASE_URL).toContain('sslmode=require');
  });

  it('leaves local and internal URLs unchanged', () => {
    process.env.NODE_ENV = 'production';
    process.env.DATABASE_URL = 'postgresql://luchi:luchi_dev@localhost:5432/luchi';
    ensureProductionDatabaseSsl();
    expect(process.env.DATABASE_URL).toBe('postgresql://luchi:luchi_dev@localhost:5432/luchi');
  });
});
