import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const MJ_APIKEY_PUBLIC = process.env.MJ_APIKEY_PUBLIC;
const MJ_APIKEY_PRIVATE = process.env.MJ_APIKEY_PRIVATE;
const SENDER_EMAIL = process.env.SENDER_EMAIL;
const RECIPIENT_EMAIL = process.env.RECIPIENT_EMAIL;

async function sendEmail({ properties, aiResponse }) {
  const propertiesNumber = properties.length;
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
    <h2>Sample Table</h2>
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
            Subject: `Lista e apartamenteve (${propertiesNumber} New)`,
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
      },
    );

    console.log("Email sent:", response.data);

    return "Email sent";
  } catch (error) {
    console.error(
      "Error sending email:",
      error.response?.data || error.message,
    );
  }
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
