import { sendEmail } from "./libs/email/email.js";
import { returnOnlyNewNotifications } from "./filter-properties/return-only-new-notifications.js";
import { formatDuaShpi } from "./formatters/dua-shpi-formatter.js";
import { createProperty } from "./create-property.js";

async function handleDuaShpi({ properties }) {
  console.log(
    `[duaShpiTask] received ${properties.length} raw properties from Cypress`,
  );

  try {
    const formattedProperties = await formatDuaShpi({ properties });
    console.log(
      `[duaShpiTask] formatted ${formattedProperties.length} properties`,
    );

    const filteredOutput = returnOnlyNewNotifications({
      properties: formattedProperties,
    });
    console.log(
      `[duaShpiTask] ${filteredOutput.length} properties remain after filtering`,
    );

    console.log("[duaShpiTask] sending properties to backend");
    await createProperty.createMany(filteredOutput);
    console.log("[duaShpiTask] backend createMany completed");

    console.log("[duaShpiTask] sending notification email");
    const email = await sendEmail({
      properties: filteredOutput,
      aiResponse: "",
    });
    console.log("[duaShpiTask] email step completed");

    return email;
  } catch (error) {
    console.error("[duaShpiTask] failed:", error);
    throw error;
  }
}

export { handleDuaShpi };
