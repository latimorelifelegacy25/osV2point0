/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['os.latimorelifelegacy.com', 'localhost:3000'],
    },
  },
};

module.exports = nextConfig;
