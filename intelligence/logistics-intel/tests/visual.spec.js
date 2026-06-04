const { expect, test } = require("@playwright/test");
const path = require("node:path");

const pageUrl = `file://${path.resolve(__dirname, "../docs/index.html")}`;

test.describe("portfolio page", () => {
  test("renders the intelligence dashboard without layout overflow", async ({ page }, testInfo) => {
    await page.goto(pageUrl);

    await expect(page.getByRole("heading", { name: "Zeebrugge Port Tech Intelligence" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Research Coverage" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Research Shape At A Glance" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "More Scraped Evidence, Better Stack Signals" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "All Stack Tags In One Place" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Every Company, Every Stack Signal" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Who Needs Which Systems" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "The Useful Layers To Track" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "How The Signals Were Scored" })).toBeVisible();

    await expect(page.locator(".metric")).toHaveCount(10);
    await expect(page.locator(".mini-chart")).toHaveCount(4);
    await expect(page.locator(".stack-overview article")).toHaveCount(5);
    await expect(page.locator(".stack-table__row")).toHaveCount(21);
    await expect(page.locator(".tag")).toHaveCount(64);
    await expect(page.locator(".taxonomy-grid article")).toHaveCount(6);
    await expect(page.locator(".workflow article")).toHaveCount(4);

    const overflow = await page.evaluate(() => ({
      body: document.body.scrollWidth,
      viewport: window.innerWidth,
      documentElement: document.documentElement.scrollWidth,
    }));
    expect(overflow.body).toBeLessThanOrEqual(overflow.viewport + 1);
    expect(overflow.documentElement).toBeLessThanOrEqual(overflow.viewport + 1);

    await page.screenshot({
      path: testInfo.outputPath(`${testInfo.project.name}-page.png`),
      fullPage: true,
    });
  });
});
