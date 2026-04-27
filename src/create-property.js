import _ from "lodash";
import { addProperty } from "./libs/backend/index.js";
import { appendLog } from "./libs/logger.js";

class CreateProperty {
  async createMany(properties) {
    const formattedProperties = this._formatProperties(properties);
    appendLog(
      `[createProperty] preparing to create ${formattedProperties.length} properties`,
    );

    for (const property of formattedProperties) {
      appendLog(
        `[createProperty] creating property ${property.providerId ?? "unknown"}`,
      );
      await addProperty(property);
    }
  }

  _formatProperties(properties) {
    return _.map(properties, (property) => {
      return {
        title: property.title,
        url: property.href,
        description: property.content,
        price: property.price,
        providerId: property.code,
      };
    });
  }
}

export const createProperty = new CreateProperty();
