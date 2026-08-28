export function ensureProductionDatabaseSsl(): void {
  const url = process.env.DATABASE_URL;
  if (!url || url.includes('sslmode=')) {
    return;
  }
  const needsSsl = process.env.NODE_ENV === 'production' && url.includes('render.com');
  if (!needsSsl) {
    return;
  }
  process.env.DATABASE_URL = `${url}${url.includes('?') ? '&' : '?'}sslmode=require`;
}
