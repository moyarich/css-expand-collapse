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
