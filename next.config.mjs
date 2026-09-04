/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["@duckdb/node-api"],
  outputFileTracingIncludes: {
    "/**": ["./data/processed/gaira.duckdb"],
  },
  turbopack: {
    root: import.meta.dirname,
  },
};

export default nextConfig;
