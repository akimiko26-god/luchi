/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@luchi/ui', '@luchi/shared-types'],
  output: 'standalone',
};

module.exports = nextConfig;
