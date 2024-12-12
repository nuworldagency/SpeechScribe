/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    config.externals = [...config.externals, 'canvas', 'jsdom']
    
    // Increase file size limit to 75MB
    config.performance = {
      hints: false,
      maxEntrypointSize: 75 * 1024 * 1024,
      maxAssetSize: 75 * 1024 * 1024
    }

    // Increase webpack's file size limit for server and client
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        maxSize: 75 * 1024 * 1024, // 75MB
      }
    }
    
    return config
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
  // Add experimental config for larger file uploads
  experimental: {
    largePageDataBytes: 75 * 1024 * 1024, // 75MB
  },
}

module.exports = nextConfig;
