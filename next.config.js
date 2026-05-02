/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://s3.tradingview.com https://widget.tradingview.com",
              "frame-src https://www.tradingview.com https://s.tradingview.com",
              "img-src 'self' data: https:",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' https://api.alternative.me https://api.stlouisfed.org https://quote.cnbc.com https://*.workers.dev https://*.supabase.co https://api.polygon.io wss://tools.dxfeed.com wss://demo.dxfeed.com https://openrouter.ai",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
