import _ from "lodash";
import { addPropertyList } from "./libs/backend/index.js";
import { appendLog } from "./libs/logger.js";

class CreateProperty {
  async createMany(properties) {
    const formattedProperties = this._formatProperties(properties);
    appendLog(
      `[createProperty] preparing to create ${formattedProperties.length} properties`,
    );
    appendLog(
      `[createProperty] creating ${formattedProperties.length} properties in bulk`,
    );
    await addPropertyList(formattedProperties);
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
