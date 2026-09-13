import { sendEmail } from "./libs/email/email.js";
import { returnOnlyNewNotifications } from "./filter-properties/return-only-new-notifications.js";
import { createProperty } from "./create-property.js";
import { appendLog } from "./libs/logger.js";
import { formatPrice } from "./formatters/format-price.js";

async function handleGazetaCelesi({ properties }) {
  const source = "gazetacelesi";
  appendLog(
    `[gazetaCelesiTask] received ${properties.length} properties from Playwright`,
  );

  try {
    const normalizedProperties = properties.map((property) => ({
      ...property,
      price: formatPrice(property.price),
    }));
    const filteredOutput = returnOnlyNewNotifications({
      properties: normalizedProperties,
      source,
    });
    appendLog(
      `[gazetaCelesiTask] ${filteredOutput.length} properties remain after filtering`,
    );
    if (!filteredOutput.length) return;

    appendLog("[gazetaCelesiTask] sending properties to backend");
    await createProperty.createMany(filteredOutput, { source });
    appendLog("[gazetaCelesiTask] backend createMany completed");

    appendLog("[gazetaCelesiTask] sending notification email");
    const email = await sendEmail({
      properties: filteredOutput,
      aiResponse: "",
      source,
    });
    appendLog("[gazetaCelesiTask] email step completed");
    return email;
  } catch (error) {
    appendLog(
      `[gazetaCelesiTask] failed: ${error.stack || error.message || error}`,
    );
    throw error;
  }
}

export { handleGazetaCelesi };
