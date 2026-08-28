'use strict';

const { execSync } = require('child_process');

function requireOrigin(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required at build time on Render`);
  }
  return value.replace(/\/$/, '');
}

const apiOrigin = requireOrigin('API_ORIGIN');
process.env.NEXT_PUBLIC_API_URL = `${apiOrigin}/api/v1`;

if (process.env.ADMIN_ORIGIN) {
  process.env.NEXT_PUBLIC_ADMIN_URL = process.env.ADMIN_ORIGIN.replace(/\/$/, '');
}

execSync('npm run build -w @luchi/web', {
  stdio: 'inherit',
  env: process.env,
});
