/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    rules: {
      'react/no-unescaped-entities': 'off',
    },
  },
  telemetry: {
    disabled: true,
  },
};

module.exports = nextConfig;
