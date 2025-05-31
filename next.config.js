/** @type {import('next').NextConfig} */
const nextConfig = {
  // ⬇️ turn off React-Strict-Mode only in dev
  reactStrictMode: false,

  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
