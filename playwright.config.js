import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./playwright/e2e",
  timeout: 120_000,
  use: {
    headless: true,
    trace: "retain-on-failure",
  },
});
