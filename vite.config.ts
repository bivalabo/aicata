import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig, type UserConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// Shopify app hostから提供されるHMR設定
if (
  process.env.HOST &&
  (!process.env.SHOPIFY_APP_URL ||
    process.env.SHOPIFY_APP_URL === process.env.HOST)
) {
  process.env.SHOPIFY_APP_URL = process.env.HOST;
}

let hmrConfig: UserConfig["server"] = undefined;
if (process.env.SHOPIFY_APP_URL) {
  const host = new URL(process.env.SHOPIFY_APP_URL);
  hmrConfig = {
    host: host.hostname,
    port: parseInt(host.port || "443"),
    protocol: host.protocol.replace(":", "") as "ws" | "wss",
  };
}

export default defineConfig({
  server: {
    port: Number(process.env.PORT || 3000),
    allowedHosts: [".trycloudflare.com"],
    hmr: hmrConfig
      ? {
          protocol: hmrConfig.protocol as "ws" | "wss",
          host: hmrConfig.host as string,
          port: Number(hmrConfig.port),
          clientPort: 443,
        }
      : undefined,
    fs: {
      allow: ["app", "node_modules"],
    },
  },
  plugins: [
    remix({
      ignoredRouteFiles: ["**/.*"],
    }),
    tsconfigPaths(),
  ],
  build: {
    assetsInlineLimit: 0,
  },
});
