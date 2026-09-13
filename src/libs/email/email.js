import axios from "axios";
import dotenv from "dotenv";
import { appendLog } from "../logger.js";
dotenv.config();

const MJ_APIKEY_PUBLIC = process.env.MJ_APIKEY_PUBLIC;
const MJ_APIKEY_PRIVATE = process.env.MJ_APIKEY_PRIVATE;
const SENDER_EMAIL = process.env.SENDER_EMAIL;
const RECIPIENT_EMAIL = process.env.RECIPIENT_EMAIL;

async function sendEmail({ properties, aiResponse, source }) {
  const propertiesNumber = properties.length;
  appendLog(`[email] preparing email for ${propertiesNumber} properties`);
  const html = `
  <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Simple Table</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
        }
        
        table {
            border-collapse: collapse;
            width: 100%;
            max-width: 500px;
        }
        
        th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }
        
        th {
            background-color: #f2f2f2;
            font-weight: bold;
        }
        
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        
        tr:hover {
            background-color: #f5f5f5;
        }
    </style>
</head>
<body>
    <h2>Lista e apartamenteve</h2>
    ${source ? `<p>Source: ${escapeHtml(source)}</p>` : ""}
    <h3>${aiResponse}</h3>
    <table>
        <thead>
            <tr>
                <th>Code</th>
                <th>Title</th>
                <th>Content</th>
                <th>Price</th>
                <th>Link</th>
            </tr>
        </thead>
        <tbody>
            ${properties.map((property, index) => tableRow(property, index)).join(" ")}
        </tbody>
    </table>
</body>
</html>
  `;
  try {
    const response = await axios.post(
      "https://api.mailjet.com/v3.1/send",
      {
        Messages: [
          {
            From: {
              Email: SENDER_EMAIL,
              Name: "Me",
            },
            To: [
              {
                Email: RECIPIENT_EMAIL,
                Name: "You",
              },
            ],
            Subject: `Lista e apartamenteve (${propertiesNumber} New)${source ? ` - ${source}` : ""}`,
            HTMLPart: html,
          },
        ],
      },
      {
        auth: {
          username: MJ_APIKEY_PUBLIC,
          password: MJ_APIKEY_PRIVATE,
        },
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 30000,
      },
    );

    appendLog("[email] email sent successfully");

    return "Email sent";
  } catch (error) {
    appendLog(
      `[email] error sending email: ${JSON.stringify(error.response?.data || error.message)}`,
    );
    throw error;
  }
}

function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character],
  );
}

function tableRow(property) {
  return `<tr>
                <td>${property.code}</td>
                <td><a href=${property.href}>${property.title}</a></td>
                <td>${property.content}</td>
                <td>${property.price}</td>
                <td>${property.href}</td>
            </tr>`;
}

export { sendEmail };
