import { test, expect } from "@playwright/test";
import { writeFile } from "node:fs/promises";
import { appendLog } from "../../src/libs/logger.js";
import { handleGazetaCelesi } from "../../src/handle-gazeta-celesi.js";

const listingUrl =
  "https://www.gazetacelesi.al/shtepi-ne-shitje/apartament?currency=EURO&page=2&geoType=location&location=Tirane&locationID=2722";

test("Gazeta Celesi shitje", async ({ page, context }, testInfo) => {
  const response = await page.goto(listingUrl, {
    waitUntil: "domcontentloaded",
  });
  expect(response?.ok(), "Listing page should load successfully").toBeTruthy();

  const cards = page.locator('#list-cards a[href*="/shtepi/njoftime/"]');
  await cards.first().waitFor({ state: "attached" });
  const links = await cards.evaluateAll((anchors) =>
    [...new Set(anchors.map((anchor) => anchor.href))].filter(
      (href) => new URL(href).origin === window.location.origin,
    ),
  );
  expect(
    links.length,
    "Listing page should contain properties",
  ).toBeGreaterThan(0);
  test.setTimeout(60_000 + links.length * 60_000);
  appendLog(
    `[playwright] gazeta-celesi-shitje: found ${links.length} properties`,
  );

  const properties = [];
  const failures = [];
  for (const href of links) {
    const detailPage = await context.newPage();
    detailPage.setDefaultTimeout(15_000);
    detailPage.setDefaultNavigationTimeout(30_000);
    try {
      const detailResponse = await detailPage.goto(href, {
        waitUntil: "domcontentloaded",
      });
      if (!detailResponse?.ok()) {
        throw new Error(
          `Property page returned HTTP ${detailResponse?.status()}`,
        );
      }
      const info = detailPage.locator('[class*="info-content_container__"]');
      await info.locator("h1").waitFor();

      // Match CSS module prefixes rather than deployment-specific hash suffixes.
      const property = await info.evaluate((element) => {
        const text = (selector) =>
          element
            .querySelector(selector)
            ?.textContent?.replace(/\s+/g, " ")
            .trim() ?? "";
        const details = Object.fromEntries(
          [
            ...element.querySelectorAll(
              '[class*="info-content_secondaryPropertyItem__"]',
            ),
          ]
            .map((item) => [
              item.querySelector("h3")?.textContent?.trim(),
              item.querySelector("p")?.textContent?.trim() ?? "",
            ])
            .filter(([label]) => label),
        );

        return {
          title: text("h1"),
          price: text('[class*="info-content_titleContainer__"] > p'),
          location: text(
            '[class*="info-content_titleContainer__"] [class*="info-content_row__"] p',
          ),
          content: [
            ...element.querySelectorAll(
              '[class*="info-content_descriptionContainer__"] > p',
            ),
          ]
            .map((paragraph) => paragraph.innerText.trim())
            .filter(Boolean)
            .join("\n\n"),
          details,
        };
      });
      if (!property.title || !property.content) {
        throw new Error("Property title or description is missing");
      }
      const detailsText = Object.entries(property.details)
        .filter(([, value]) => value)
        .map(([label, value]) => `${label}: ${value}`)
        .join("\n");
      if (detailsText) {
        property.content += `\n\nTë dhënat\n${detailsText}`;
      }
      properties.push({
        ...property,
        href,
        code: new URL(href).pathname.match(/-(\d+)\.html$/)?.[1] ?? href,
      });
      appendLog(`[playwright] gazeta-celesi-shitje: collected ${href}`);
    } catch (error) {
      failures.push({ href, error: error.message });
      appendLog(
        `[playwright] gazeta-celesi-shitje: failed ${href}: ${error.message}`,
      );
    } finally {
      await detailPage.close();
    }
  }

  // Preserve successful results even when an individual property fails.
  const outputPath = testInfo.outputPath("gazeta-celesi-properties.json");
  await writeFile(
    outputPath,
    JSON.stringify({ properties, failures }, null, 2),
  );
  await testInfo.attach("gazeta-celesi-properties", {
    path: outputPath,
    contentType: "application/json",
  });
  appendLog(
    `[playwright] gazeta-celesi-shitje: saved ${properties.length} properties to ${outputPath}`,
  );
  expect(
    failures,
    "Some property pages could not be scraped; see JSON output",
  ).toEqual([]);
  await handleGazetaCelesi({ properties });
});
