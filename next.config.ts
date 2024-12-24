import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Only include HTTPS configuration for the server-side
      const httpsOptions = {
        key: "/etc/letsencrypt/live/uniqual.dev/cert.pem",
        cert: "/etc/letsencrypt/live/uniqual.dev/privkey.pem",
      };

      config.externals.push({ httpsOptions });
    }
    return config;
  },
  serverRuntimeConfig: {
    https: {
      key: "/etc/letsencrypt/live/uniqual.dev/cert.pem",
      cert: "/etc/letsencrypt/live/uniqual.dev/privkey.pem",
    },
  },
};

export default nextConfig;
