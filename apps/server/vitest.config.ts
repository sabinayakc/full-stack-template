import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    globals: true,
    clearMocks: true,
    restoreMocks: true,
    setupFiles: ["./src/test/setup.ts"],
  },
});
