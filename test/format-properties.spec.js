import { formatProperties } from "../src/formatters/format-properties.js";
import { mockData } from "./mock-data.js";
import { expect } from "chai";

describe("format properties", () => {
  it("should extract id of the property", () => {
    const formattedData = formatProperties({ properties: mockData });

    expect(formattedData.length).to.be.eq(mockData.length);
  });
});
