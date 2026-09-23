import { defineConfig } from "@playwright/test";
import baseConfig from "./playwright.config.js";

export default defineConfig(baseConfig, {
  use: {
    proxy: {
      server: "socks5://127.0.0.1:1080",
    },
  },
});
