/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Completely ignore firebase/storage on client builds
      config.resolve.alias = {
        ...config.resolve.alias,
        'firebase/storage': false,
        '@firebase/storage': false,
      };
      
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        undici: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
