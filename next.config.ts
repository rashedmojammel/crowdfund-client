import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // picsum/pravatar: seed and placeholder images used during development
      // and testing. i.ibb.co: real ImgBB-hosted uploads (campaign covers,
      // profile photos).
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
      { protocol: "https", hostname: "i.pravatar.cc" },
      { protocol: "https", hostname: "i.ibb.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
      
    ],
  },
};

export default nextConfig;
