import { sendEmail } from "./libs/email/email.js";
import { returnOnlyNewNotifications } from "./filter-properties/return-only-new-notifications.js";
import { formatDuaShpi } from "./formatters/dua-shpi-formatter.js";
import { createProperty } from "./create-property.js";

async function handleDuaShpi({ properties }) {
  const formattedProperties = await formatDuaShpi({ properties });
  const filteredOutput = returnOnlyNewNotifications({
    properties: formattedProperties,
  });

  await createProperty.createMany(filteredOutput);

  const email = await sendEmail({
    properties: filteredOutput,
    aiResponse: "",
  });

  return email;
}

export { handleDuaShpi };
