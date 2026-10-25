import { test } from "@playwright/test";
import { scrapeIliriaRates } from "../../src/iliria-rates.js";
import { handleIliriaRates } from "../../src/handle-iliria-rates.js";
import { appendLog } from "../../src/libs/logger.js";

test("Iliria exchange rates", async ({ page }) => {
  appendLog("[playwright] iliria: collecting EUR and USD rates");
  const payload = await scrapeIliriaRates(page);
  await handleIliriaRates(payload);
  appendLog("[playwright] iliria: completed");
});
