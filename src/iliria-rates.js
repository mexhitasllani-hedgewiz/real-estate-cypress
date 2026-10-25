const currencies = ["EUR", "USD"];

// Iliria quotes ALL per one unit of foreign currency, for both buy and sell.
export async function scrapeIliriaRates(page) {
  await page.goto("https://iliria98.com/", {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });
  const rates = {};
  for (const currency of currencies) {
    const row = page.locator("div.line[rate]").filter({
      has: page.locator("b", { hasText: new RegExp(`^${currency}$`) }),
    });
    await row.waitFor({ state: "visible", timeout: 30000 });
    const cells = await row.locator(":scope > span").allTextContents();
    const parseRate = (text) => {
      const value = Number(text?.trim().replace(",", "."));
      if (!Number.isFinite(value) || value <= 0) {
        throw new Error(`Invalid ${currency} rate: ${text}`);
      }
      return value;
    };
    rates[currency] = {
      buy: parseRate(cells[1]),
      sell: parseRate(cells[2]),
    };
    if (rates[currency].buy > rates[currency].sell) {
      throw new Error(`Buy rate exceeds sell rate for ${currency}`);
    }
  }
  return {
    source: "https://iliria98.com/",
    fetchedAt: new Date().toISOString(),
    quoteCurrency: "ALL",
    rates,
  };
}
