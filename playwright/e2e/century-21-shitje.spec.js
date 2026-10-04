import { test, expect } from "@playwright/test";
import { writeFile } from "node:fs/promises";
import { appendLog } from "../../src/libs/logger.js";
import { handleCentury21 } from "../../src/handle-century-21.js";
import {
  readCentury21Checkpoint,
  century21LinksBeforeCheckpoint,
} from "../../src/filter-properties/century21-links.js";

const listingUrl =
  "https://www.century21albania.com/properties?keyword=Apartament&q=&business_type=sale&city=Tirana&bedrooms=&price%5Bmin%5D=&price%5Bmax%5D=&area%5Bmin%5D=&area%5Bmax%5D=&extra%5Belevator%5D=&property_status=";

test("Century 21 shitje", async ({ page, context }, testInfo) => {
  const response = await page.goto(listingUrl, {
    waitUntil: "domcontentloaded",
  });
  expect(response?.ok(), "Listing page should load successfully").toBeTruthy();

  const cards = page.locator('a[href*="/property/"]');
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
  appendLog(`[playwright] century-21-shitje: found ${links.length} properties`);

  const checkpointCode = await readCentury21Checkpoint();
  const pendingLinks = century21LinksBeforeCheckpoint(links, checkpointCode);
  appendLog(
    `[playwright] century-21-shitje: checkpoint ${checkpointCode ?? "none"}; opening ${pendingLinks.length} properties`,
  );

  const properties = [];
  const failures = [];
  const batchSize = 5;
  for (let offset = 0; offset < pendingLinks.length; offset += batchSize) {
    const results = await Promise.all(
      pendingLinks.slice(offset, offset + batchSize).map(async (href) => {
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
          await detailPage.locator("h1").first().waitFor();
          await detailPage
            .getByRole("heading", { name: "Përshkrim", exact: true })
            .waitFor();

          const property = await detailPage.evaluate(() => {
            const clean = (value) => value?.replace(/\s+/g, " ").trim() ?? "";
            const headings = [
              ...document.querySelectorAll("h1, h2, h3, h4, h5, h6"),
            ];
            const title = document.querySelector("h1");
            const description = headings.find(
              (heading) => clean(heading.textContent) === "Përshkrim",
            );
            // Read the section between headings, preserving paragraphs and line breaks.
            const sectionText = (start, end) => {
              const range = document.createRange();
              range.setStartAfter(start);
              if (end) range.setEndBefore(end);
              else range.setEndAfter(start.parentElement);
              const container = document.createElement("div");
              container.append(range.cloneContents());
              container
                .querySelectorAll("br")
                .forEach((br) => br.replaceWith("\n"));
              container
                .querySelectorAll("p, li, div")
                .forEach((block) => block.append("\n"));
              return container.textContent.trim();
            };
            const nextHeading = headings[headings.indexOf(description) + 1];
            const price =
              headings
                .filter((heading) => heading.tagName === "H2")
                .map((heading) => clean(heading.textContent))
                .find((value) =>
                  /(?:[\d.,]+\s*(?:€|Lekë)|Çmimi sipas kërkesës)/i.test(value),
                ) ?? "";
            const bodyText = document.body.innerText;
            const code = bodyText.match(/ID e Pronës:\s*([a-z0-9-]+)/i)?.[1];
            const details = sectionText(title, description)
              .replace(price, "")
              .trim();
            return {
              title: clean(title.textContent),
              price,
              content: sectionText(description, nextHeading),
              details: details ? { "Të dhënat": details } : {},
              code,
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
          const collectedProperty = {
            ...property,
            href,
            code:
              property.code ??
              new URL(href).pathname.match(/-([a-z0-9]+)\.html$/i)?.[1] ??
              href,
          };
          appendLog(`[playwright] century-21-shitje: collected ${href}`);
          return { property: collectedProperty };
        } catch (error) {
          const failure = { href, error: error.message };
          appendLog(
            `[playwright] century-21-shitje: failed ${href}: ${error.message}`,
          );
          return { failure };
        } finally {
          await detailPage.close();
        }
      }),
    );
    // Promise.all preserves link order even when pages finish out of order.
    for (const result of results) {
      if (result.property) properties.push(result.property);
      else failures.push(result.failure);
    }
  }

  // Preserve successful results even when an individual property fails.
  const outputPath = testInfo.outputPath("century-21-properties.json");
  await writeFile(
    outputPath,
    JSON.stringify({ properties, failures }, null, 2),
  );
  await testInfo.attach("century-21-properties", {
    path: outputPath,
    contentType: "application/json",
  });
  appendLog(
    `[playwright] century-21-shitje: saved ${properties.length} properties to ${outputPath}`,
  );
  expect(
    failures,
    "Some property pages could not be scraped; see JSON output",
  ).toEqual([]);
  await handleCentury21({ properties });
});
