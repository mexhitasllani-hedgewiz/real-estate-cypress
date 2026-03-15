import { sendEmail } from "./email/email.js";
import { formatProperties } from "../formatters/format-properties.js";
import { returnOnlyNewNotifications } from "../filter-properties/return-only-new-notifications.js";

async function propertyFlow({ properties }) {
  const formattedProperties = await formatProperties({ properties });
  const filteredOutput = returnOnlyNewNotifications({
    properties: formattedProperties,
  });

  const email = await sendEmail({
    properties: filteredOutput,
    aiResponse: "",
  });

  return email;
}

export { propertyFlow };
