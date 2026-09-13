import { expect } from "chai";
import axios from "axios";
import { createProperty } from "../src/create-property.js";
import { sendEmail } from "../src/libs/email/email.js";

describe("property source delivery", () => {
  let originalPost;
  let requests;
  beforeEach(() => {
    requests = [];
    originalPost = axios.post;
    axios.post = async (url, data) => {
      requests.push({ url, data });
      return { data: {} };
    };
  });
  afterEach(() => {
    axios.post = originalPost;
  });

  it("includes the source in each backend property and in the email", async () => {
    const source = "gazetacelesi";
    const properties = [
      {
        code: "123",
        title: "Apartment",
        href: "https://example.com/123",
        content: "KATI: 3",
        price: "€ 100.000",
      },
    ];
    await createProperty.createMany(properties, { source });
    await sendEmail({ properties, aiResponse: "", source });
    expect(requests[0].data[0]).to.include({
      source,
      providerId: "123",
      description: "KATI: 3",
    });
    const message = requests[1].data.Messages[0];
    expect(message.Subject).to.include(source);
    expect(message.HTMLPart).to.include(`Source: ${source}`);
  });

  it("continues to support callers without a source", async () => {
    await createProperty.createMany([{ code: "123" }]);
    await sendEmail({ properties: [], aiResponse: "" });
    expect(requests[0].data[0]).not.to.have.property("source");
    expect(requests[1].data.Messages[0].Subject).to.equal(
      "Lista e apartamenteve (0 New)",
    );
  });
});
