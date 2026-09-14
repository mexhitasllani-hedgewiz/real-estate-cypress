import { expect } from "chai";
import { formatPrice } from "../src/formatters/format-price.js";

describe("formatPrice", () => {
  it("moves the euro symbol after the amount and changes separators", () => {
    expect(formatPrice("€ 181.900")).to.equal("181,900 €");
  });

  it("handles surrounding whitespace and multiple separators", () => {
    expect(formatPrice("  € 10.700.000  ")).to.equal("10,700,000 €");
  });

  it("leaves unsupported price formats unchanged", () => {
    expect(formatPrice("ALL 117.700.000")).to.equal("ALL 117.700.000");
    expect(formatPrice("€ 181,900")).to.equal("€ 181,900");
  });

  it("leaves non-string values unchanged", () => {
    expect(formatPrice(181900)).to.equal(181900);
    expect(formatPrice(null)).to.equal(null);
  });
});
