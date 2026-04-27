import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const url = process.env.BACKEND_URL;
const apiKey = process.env.PROPERTY_INGEST_API_KEY;

function addProperty(property) {
  return axios.post(`${url}/properties`, property, {
    headers: {
      "x-api-key": apiKey,
    },
  });
}

export { addProperty };
