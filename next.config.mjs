/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["@duckdb/node-api"],
  outputFileTracingIncludes: {
    "/**": ["./data/processed/gaira.duckdb", "./node_modules/@duckdb/node-bindings-*/**"],
  },
  turbopack: {
    root: import.meta.dirname,
  },
};

export default nextConfig;
