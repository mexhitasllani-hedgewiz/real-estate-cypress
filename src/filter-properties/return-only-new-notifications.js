import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import _ from "lodash";

function returnOnlyNewNotifications({ properties }) {
  const latestProperty = getLastPropertyFromPrevious();

  saveLastProperty(properties);

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

function saveLastProperty(properties) {
  const lastProperty = _.first(properties);
  const filePath = getFilePath();

  fs.writeFileSync(filePath, JSON.stringify({ lastProperty }, null, 2));
}

function getLastPropertyFromPrevious() {
  const filePath = getFilePath();
  const content = fs.readFileSync(filePath, "utf-8");
  try {
    const item = JSON.parse(content);

    return item.lastProperty;
  } catch (e) {
    console.log(e);

    return null;
  }
}

function getFilePath() {
  // Convert the module URL to a real file path
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // Build a file path relative to this script's directory
  return path.join(__dirname, "database.json");
}

export { returnOnlyNewNotifications };
