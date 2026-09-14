const defaultRuntimeCaching = require('next-pwa/cache');

const withPWA = require('next-pwa')({
  dest: 'public',
  // Never persist authenticated documents, RSC responses or session endpoints.
  runtimeCaching: [
    {
      urlPattern: ({ url }) => /^\/(?:admin|api\/admin)(?:\/|$)/.test(url.pathname),
      handler: 'NetworkOnly',
    },
    ...defaultRuntimeCaching,
  ],
  buildExcludes: [/server\/.*admin/],
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    const headers = [
      { key: 'Cache-Control', value: 'private, no-store, max-age=0' },
      { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Referrer-Policy', value: 'same-origin' },
    ];
    return [
      { source: '/admin/:path*', headers },
      { source: '/api/admin/:path*', headers },
    ];
  },
  images: {
    domains: [],
  },
};

module.exports = withPWA(nextConfig);
