/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: ["firebasestorage.googleapis.com", "image-cdn.hypb.st"],
    unoptimized: true,
  },
};

export default nextConfig;
