import type { NextConfig } from "next";

// Cache Components is off: it hangs on the Cloudflare Workers runtime, and this site is fully static.
const nextConfig: NextConfig = {};

export default nextConfig;
