import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const resolveSrc = (path: string) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: [
      "packages/*/src/**/*.test.ts",
      "packages/*/src/**/*.test.tsx",
    ],
  },
  resolve: {
    // Resolve workspace packages to their TypeScript source rather than their
    // built `dist/` output, so `npm test` works immediately after `npm ci`
    // without requiring `npm run build` first. Published consumers are
    // unaffected: this only applies to this Vitest process's module graph.
    alias: [
      { find: "@formknot/core", replacement: resolveSrc("./packages/core/src/index.ts") },
      { find: "@formknot/react", replacement: resolveSrc("./packages/react/src/index.ts") },
      { find: "@formknot/builder-react", replacement: resolveSrc("./packages/builder-react/src/index.ts") },
    ],
  },
});
