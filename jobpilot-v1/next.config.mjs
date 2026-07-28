/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // pdf-parse/mammoth are Node-only libs; keep them out of the edge bundle
  serverExternalPackages: ["pdf-parse", "mammoth"],
};

export default nextConfig;
