'use strict';

const { execSync } = require('child_process');
const path = require('path');

function ensureSsl(url) {
  if (!url) {
    throw new Error('DATABASE_URL is required for Render predeploy');
  }
  if (url.includes('sslmode=') || !url.includes('render.com')) {
    return url;
  }
  return `${url}${url.includes('?') ? '&' : '?'}sslmode=require`;
}

process.env.DATABASE_URL = ensureSsl(process.env.DATABASE_URL);

const schema = path.join('apps', 'api', 'prisma', 'schema.prisma');
const sqlFile = path.join('scripts', 'migrate', '001_init_schemas.sql');
const env = { ...process.env };

execSync(`npx prisma db execute --schema="${schema}" --file="${sqlFile}"`, {
  stdio: 'inherit',
  env,
});

execSync(`npx prisma db push --schema="${schema}" --skip-generate`, {
  stdio: 'inherit',
  env,
});
