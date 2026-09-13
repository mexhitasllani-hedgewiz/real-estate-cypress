import { expect } from "chai";
import { readFileSync, rmSync } from "node:fs";
import { returnOnlyNewNotifications } from "../src/filter-properties/return-only-new-notifications.js";

describe("property source filtering", () => {
  const source = `test-celesi-${process.pid}`;
  const database = new URL(
    `../src/filter-properties/database-${source}.json`,
    import.meta.url,
  );
  const defaultDatabase = new URL(
    "../src/filter-properties/database.json",
    import.meta.url,
  );

  afterEach(() => rmSync(database, { force: true }));

  it("keeps source progress separate and returns only newer properties", () => {
    const previousDefault = readFileSync(defaultDatabase, "utf8");
    const older = { code: "100" };
    const newer = { code: "101" };
    expect(
      returnOnlyNewNotifications({ properties: [older], source }),
    ).to.deep.equal([older]);
    expect(
      returnOnlyNewNotifications({ properties: [newer, older], source }),
    ).to.deep.equal([newer]);
    expect(
      returnOnlyNewNotifications({ properties: [newer, older], source }),
    ).to.deep.equal([]);
    expect(readFileSync(defaultDatabase, "utf8")).to.equal(previousDefault);
  });

  it("preserves progress when a run has no properties", () => {
    const properties = [{ code: "100" }];
    returnOnlyNewNotifications({ properties, source });
    expect(
      returnOnlyNewNotifications({ properties: [], source }),
    ).to.deep.equal([]);
    expect(returnOnlyNewNotifications({ properties, source })).to.deep.equal(
      [],
    );
  });
});
