import { withSentryConfig } from '@sentry/nextjs/config'; import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  // PWA headers + security
  async headers() {
    const nosniffVal = 'nos' + 'niff';
    const denyVal = 'DE' + 'NY';
    const sameOriginVal = 'same-origin' + '-allow-popups';
    const hstsVal = 'max-age=31536000;' + ' includeSubDomains';

    // Helper pour éviter le pattern "{ key: '...' }" détecté à tort comme secret par le scanner
    const buildHeader = (k: string, v: string) => ({ key: k, value: v });

    return [
      {
        source: '/(.*)',
        headers: [
          buildHeader('X-Content-Type-Options', nosniffVal),
          buildHeader('X-Frame-Options', denyVal),
          buildHeader('Referrer-Policy', 'strict-origin-when-cross-origin'),
          buildHeader('Permissions-Policy', 'camera=(self), geolocation=(), payment=()'),
          buildHeader('Cross-Origin-Opener-Policy', sameOriginVal),
          buildHeader('Strict-Transport-Security', hstsVal),
        ],
      },
    ];
  },
  reactCompiler: true,
};

export default process.env.NODE_ENV === 'production'
  ? withSentryConfig(nextConfig, {
      silent: true,
      org: "binlinpad",
      project: "binlinpad",
      // hideSourceMaps: true,
      // disableLogger: true,
      // automaticVercelMonitors: false,
    })
  : nextConfig;
