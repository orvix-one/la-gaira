/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["@duckdb/node-api"],
  turbopack: {
    root: import.meta.dirname,
  },
};

export default nextConfig;
