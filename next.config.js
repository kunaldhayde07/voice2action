/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['mongoose'],
  },
  webpack: (config) => {
    // leaflet tries to access window during SSR — this prevents the crash
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };

    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      'bufferutil': 'commonjs bufferutil',
    });

    return config;
  },
};

module.exports = nextConfig;