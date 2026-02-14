import { mergeConfig, defineConfig } from "vitest/config"

import viteConfig from "./vite.config"

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      coverage: {
        enabled: true,
        provider: "v8",
        reporter: ["text", "html"],
        reportsDirectory: "./coverage",
        exclude: ["tests/**"],
      },
      environment: "jsdom",
      include: ["tests/unit/**/*.test.{ts,tsx}"],
    },
  }),
)
