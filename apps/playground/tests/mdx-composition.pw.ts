import { expect, test } from "playwright/test";

test("MDX page imports local CSS and positions its playground", async ({
  page,
}) => {
  await page.goto("/#/converter/expand/background");
  await expect(page.locator(".example-documentation pre")).toContainText(
    "linear-gradient",
  );
  await expect(
    page.getByRole("textbox", { name: "Shorthand CSS input" }),
  ).toBeVisible();
  await expect(page.locator(".css-converter .workspace")).toHaveCount(1);
});

for (const entry of ["/", "/#/docs", "/#/converter"]) {
  test(`opens the default converter from ${entry}`, async ({ page }) => {
    await page.goto(entry);
    await expect(page).toHaveURL(/#\/converter\/expand\/text-decoration$/);
    await expect(page.getByRole("textbox", { name: "Shorthand CSS input" })).toBeVisible();
  });
}

test("individual documentation pages remain accessible", async ({ page }) => {
  await page.goto("/#/docs/01-development");
  await expect(page).toHaveURL(/#\/docs\/01-development$/);
  await expect(page.locator(".example-documentation h1")).toBeVisible();
});
