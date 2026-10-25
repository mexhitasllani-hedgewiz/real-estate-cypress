import { updateExchangeRates } from "./libs/backend/index.js";
import { appendLog } from "./libs/logger.js";

export async function handleIliriaRates(payload) {
  const response = await updateExchangeRates(payload);
  appendLog(`[iliria] exchange rates submitted: HTTP ${response.status}`);
}
