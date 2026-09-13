import _ from "lodash";
import { addPropertyList } from "./libs/backend/index.js";
import { appendLog } from "./libs/logger.js";

class CreateProperty {
  async createMany(properties, { source } = {}) {
    const formattedProperties = this._formatProperties(properties, source);
    appendLog(
      `[createProperty] preparing to create ${formattedProperties.length} properties`,
    );
    appendLog(
      `[createProperty] creating ${formattedProperties.length} properties in bulk`,
    );
    await addPropertyList(formattedProperties);
  }

  _formatProperties(properties, source) {
    return _.map(properties, (property) => {
      return {
        title: property.title,
        url: property.href,
        description: property.content,
        price: property.price,
        providerId: property.code,
        ...(source ? { source } : {}),
      };
    });
  }
}

export const createProperty = new CreateProperty();
