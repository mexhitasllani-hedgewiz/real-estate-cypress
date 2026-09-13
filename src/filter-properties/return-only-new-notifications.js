import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import _ from "lodash";

function returnOnlyNewNotifications({ properties, source }) {
  if (!properties.length) return [];
  const latestProperty = getLastPropertyFromPrevious(source);

  saveLastProperty(properties, source);

  const unSeenProperties = [];

  if (!latestProperty) {
    return properties;
  }

  for (const property of properties) {
    if (property.code !== latestProperty.code) {
      unSeenProperties.push(property);

      continue;
    }

    return unSeenProperties;
  }

  return properties;
}

function saveLastProperty(properties, source) {
  const lastProperty = _.first(properties);
  const filePath = getFilePath(source);

  fs.writeFileSync(filePath, JSON.stringify({ lastProperty }, null, 2));
}

function getLastPropertyFromPrevious(source) {
  const filePath = getFilePath(source);
  let content;
  try {
    content = fs.readFileSync(filePath, "utf-8");
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
  try {
    const item = JSON.parse(content);

    return item.lastProperty;
  } catch (e) {
    console.log(e);

    return null;
  }
}

function getFilePath(source) {
  if (source !== undefined && !/^[a-z0-9-]+$/.test(source)) {
    throw new Error("Invalid property source");
  }
  // Convert the module URL to a real file path
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // Build a file path relative to this script's directory
  return path.join(
    __dirname,
    source ? `database-${source}.json` : "database.json",
  );
}

export { returnOnlyNewNotifications };
