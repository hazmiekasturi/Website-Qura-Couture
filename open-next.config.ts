import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// The site is fully static for now, so no incremental cache (R2) is needed.
export default defineCloudflareConfig({});
