import { sendEmail } from "./libs/email/email.js";
import { returnOnlyNewNotifications } from "./filter-properties/return-only-new-notifications.js";
import { formatDuaShpi } from "./formatters/dua-shpi-formatter.js";
import { createProperty } from "./create-property.js";
import { appendLog } from "./libs/logger.js";

async function handleDuaShpi({ properties }) {
  appendLog(
    `[duaShpiTask] received ${properties.length} raw properties from Cypress`,
  );

  try {
    const formattedProperties = await formatDuaShpi({ properties });
    appendLog(
      `[duaShpiTask] formatted ${formattedProperties.length} properties`,
    );

    const filteredOutput = returnOnlyNewNotifications({
      properties: formattedProperties,
    });
    appendLog(
      `[duaShpiTask] ${filteredOutput.length} properties remain after filtering`,
    );

    appendLog("[duaShpiTask] sending properties to backend");
    await createProperty.createMany(filteredOutput);
    appendLog("[duaShpiTask] backend createMany completed");

    appendLog("[duaShpiTask] sending notification email");
    const email = await sendEmail({
      properties: filteredOutput,
      aiResponse: "",
    });
    appendLog("[duaShpiTask] email step completed");

    return email;
  } catch (error) {
    appendLog(`[duaShpiTask] failed: ${error.stack || error.message || error}`);
    throw error;
  }
}

export { handleDuaShpi };
