'use strict';

const { execSync } = require('child_process');

const apiOrigin = process.env.API_ORIGIN;
if (!apiOrigin) {
  throw new Error('API_ORIGIN is required at build time on Render');
}

process.env.NEXT_PUBLIC_API_URL = `${apiOrigin.replace(/\/$/, '')}/api/v1`;

execSync('npm run build -w @luchi/admin', {
  stdio: 'inherit',
  env: process.env,
});
