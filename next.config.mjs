/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Note: Static export disabled due to dynamic routes
  // Cloudflare Pages will handle Next.js SSR automatically
  images: {
    unoptimized: true,  // Optimize for Cloudflare Pages
  },
};

export default nextConfig;

