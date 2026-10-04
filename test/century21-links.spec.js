import { expect } from "chai";
import { century21LinksBeforeCheckpoint } from "../src/filter-properties/century21-links.js";

describe("Century 21 checkpoint links", () => {
  const link = (code) =>
    `https://www.century21albania.com/property/123/apartment-${code}.html`;
  const links = [
    link("astoria150752"),
    link("Legacy150689"),
    link("ONE150585"),
  ];

  it("excludes the checkpoint and all subsequent links in listing order", () => {
    expect(century21LinksBeforeCheckpoint(links, "Legacy150689")).to.deep.equal(
      [link("astoria150752")],
    );
  });

  it("opens no detail pages when the first link matches the saved checkpoint", () => {
    expect(
      century21LinksBeforeCheckpoint(links, "astoria150752"),
    ).to.deep.equal([]);
  });

  it("opens only new listings before astoria150752", () => {
    const updatedLinks = [link("new150800"), ...links];
    expect(
      century21LinksBeforeCheckpoint(updatedLinks, "astoria150752"),
    ).to.deep.equal([link("new150800")]);
  });

  it("matches codes without depending on capitalization", () => {
    expect(
      century21LinksBeforeCheckpoint(links, "ASTORIA150752"),
    ).to.deep.equal([]);
  });

  it("keeps all links in listing order when the checkpoint is absent", () => {
    expect(century21LinksBeforeCheckpoint(links)).to.deep.equal(links);
    expect(century21LinksBeforeCheckpoint(links, "missing123")).to.deep.equal(
      links,
    );
  });
});
