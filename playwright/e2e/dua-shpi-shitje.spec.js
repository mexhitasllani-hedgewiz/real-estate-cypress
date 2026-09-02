import { test } from "@playwright/test";
import { handleDuaShpi } from "../../src/handle-dua-shpi.js";
import { appendLog } from "../../src/libs/logger.js";

test("Dua shpi shitje", async ({ page }) => {
  appendLog("[playwright] dua-shpi-shitje: visiting listing page");
  await page.goto(
    "https://duashpi.al/kerko-prona?page=2&business_type=sale&city=Tirane",
    {
      waitUntil: "domcontentloaded",
    },
  );

  appendLog(
    "[playwright] dua-shpi-shitje: page loaded, handling consent button",
  );
  const consentButton = page.getByRole("button", { name: "Prano" });
  if (
    await consentButton
      .first()
      .isVisible()
      .catch(() => false)
  ) {
    await consentButton.first().click();
  }

  const listings = page.locator('[data-event-value="listing"]');
  await listings.first().waitFor({ state: "attached" });

  const properties = await listings.evaluateAll((elements) =>
    elements.map((element) => {
      const details = element.querySelector(".details");

      return {
        title: details?.querySelector(".title")?.textContent ?? "",
        href: element.getAttribute("href"),
        content: details?.querySelector(".description")?.textContent ?? "",
        price: details?.querySelector(".price")?.textContent ?? "",
      };
    }),
  );

  appendLog(
    `[playwright] dua-shpi-shitje: collected ${properties.length} raw properties`,
  );
  appendLog("[playwright] dua-shpi-shitje: starting duaShpiTask");
  await handleDuaShpi({ properties });
  appendLog("[playwright] dua-shpi-shitje: duaShpiTask completed");
});
