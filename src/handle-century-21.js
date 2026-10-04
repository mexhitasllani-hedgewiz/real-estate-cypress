import { sendEmail } from "./libs/email/email.js";
import { returnOnlyNewNotifications } from "./filter-properties/return-only-new-notifications.js";
import { createProperty } from "./create-property.js";
import { appendLog } from "./libs/logger.js";
import { formatPrice } from "./formatters/format-price.js";

async function handleCentury21({ properties }) {
  const source = "century21";
  appendLog(
    `[century21Task] received ${properties.length} properties from Playwright`,
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
      `[century21Task] ${filteredOutput.length} properties remain after filtering`,
    );
    if (!filteredOutput.length) return;

    appendLog("[century21Task] sending properties to backend");
    await createProperty.createMany(filteredOutput, { source });
    appendLog("[century21Task] backend createMany completed");

    appendLog("[century21Task] sending notification email");
    const email = await sendEmail({
      properties: filteredOutput,
      aiResponse: "",
      source,
    });
    appendLog("[century21Task] email step completed");
    return email;
  } catch (error) {
    appendLog(
      `[century21Task] failed: ${error.stack || error.message || error}`,
    );
    throw error;
  }
}

export { handleCentury21 };
