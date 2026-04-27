import { defineConfig } from "cypress";
import { propertyFlow } from "./src/libs/index.js";
import { handleDuaShpi } from "./src/handle-dua-shpi.js";

function timestamp() {
  return new Date().toISOString();
}

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      on("task", {
        main: propertyFlow,
        duaShpiTask: handleDuaShpi,
        log(message) {
          console.log(`[${timestamp()}] [cypress] ${message}`);
          return null;
        },
      });

      on("before:run", (details) => {
        console.log(
          `[${timestamp()}] [cypress] Run starting with ${details.specs.length} spec(s)`,
        );
      });

      on("before:spec", (spec) => {
        console.log(`[${timestamp()}] [cypress] Starting spec ${spec.relative}`);
      });

      on("after:spec", (spec, results) => {
        console.log(
          `[${timestamp()}] [cypress] Finished spec ${spec.relative} with ${results?.stats?.failures ?? 0} failure(s)`,
        );
      });

      on("after:run", (results) => {
        console.log(
          `[${timestamp()}] [cypress] Run finished with status ${results?.status ?? "unknown"}`,
        );
      });

      return config;
    },
  },
});
