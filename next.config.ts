import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Fotos seed de desarrollo en Unsplash. Quitar cuando haya Supabase Storage.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
