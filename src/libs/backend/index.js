import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const url = process.env.BACKEND_URL;

function addProperty(property) {
  return axios.post(`http://${url}:3009/properties`, property);
}

export { addProperty };
