import axios from "axios";
import dotenv from "dotenv";
import { appendLog } from "../logger.js";
dotenv.config();

const url = process.env.BACKEND_URL;
const apiKey = process.env.PROPERTY_INGEST_API_KEY;

function addProperty(property) {
  appendLog(`[backend] POST ${url}/properties for ${property.providerId}`);
  return axios.post(`${url}/properties`, property, {
    headers: {
      "x-api-key": apiKey,
    },
    timeout: 30000,
  });
}

function addPropertyList(properties) {
  appendLog(`[backend] POST ${url}/properties/bulk for ${properties.length} properties`);
  return axios.post(`${url}/properties/bulk`, properties, {
    headers: {
      "x-api-key": apiKey,
    },
    timeout: 30000,
  });
}

export { addProperty, addPropertyList };
