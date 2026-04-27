import { defineConfig } from "cypress";
import { propertyFlow } from "./src/libs/index.js";
import { handleDuaShpi } from "./src/handle-dua-shpi.js";
import { appendLog } from "./src/libs/logger.js";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      on("task", {
        main: propertyFlow,
        duaShpiTask: handleDuaShpi,
        log(message) {
          appendLog(`[cypress] ${message}`);
          return null;
        },
      });

      return config;
    },
  },
});
