import path from "node:path";
import cloudflareAdapter from "@hono/vite-build/cloudflare-workers";
import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      pdfkit: path.resolve(
        __dirname,
        "../../packages/pdf/node_modules/pdfkit/js/pdfkit.standalone.js",
      ),
    },
  },
  build: {
    rollupOptions: {
      external: [/cloudflare:.*/],
    },
  },
  ssr: {
    external: ["cloudflare:workers"],
    noExternal: ["rrule"],
  },
  plugins: [
    cloudflareAdapter({
      entry: "./src/index.ts",
    }),
  ],
});
