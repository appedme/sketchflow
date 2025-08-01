import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({
  // Uncomment to enable R2 cache,
  // It should be imported as:
  // `import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";`
  // See https://opennext.js.org/cloudflare/caching for more details
  // incrementalCache: r2IncrementalCache,

  // Disable features that might cause issues with Cloudflare Workers
  disableInstrumentation: true,

  // Optimize for Cloudflare Workers
  minify: true,

  // Increase compatibility
  compatibilityDate: "2023-10-30",
  compatibilityFlags: ["nodejs_compat"],
});
