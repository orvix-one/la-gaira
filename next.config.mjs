/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["@duckdb/node-api"],
  outputFileTracingIncludes: {
    "/**": [
      "./data/processed/gaira.duckdb",
      // duckdb.node dlopens libduckdb.so at runtime (invisible to the tracer), so it
      // must be listed by hand — via the real .pnpm store path, not the hoisted
      // node_modules/@duckdb/... symlink, which Vercel's packager rejects.
      // See https://github.com/vercel/vercel/issues/17348
      "./node_modules/.pnpm/@duckdb+node-bindings-*/node_modules/@duckdb/node-bindings-*/libduckdb.*",
    ],
  },
  turbopack: {
    root: import.meta.dirname,
  },
};

export default nextConfig;
