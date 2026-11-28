import { expect, test } from "playwright/test";

test("playground sidebar navigation resolves to the selected documentation page", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/");
  const collections = page.locator(".sidebar-collection");
  await expect(collections.first()).toBeVisible();

  // Pick representative links from each collection, including collapsed groups.
  const links = await collections.evaluateAll((groups) =>
    groups.flatMap((group) =>
      Array.from(group.querySelectorAll<HTMLAnchorElement>("a[href]"))
        .slice(0, 3)
        .map((link) => ({
          href: link.getAttribute("href") ?? "",
          label: link.textContent?.trim() ?? "",
        })),
    ),
  );
  expect(links.length).toBeGreaterThan(0);

  for (const { href, label } of links) {
    expect(href, `Missing route for ${label}`).toMatch(/^#\//);
    const target = page.locator(".sidebar-collection a").filter({ hasText: label }).first();
    const group = target.locator("xpath=ancestor::details[1]");
    if (!(await group.getAttribute("open"))) {
      await group.locator("summary").click();
    }
    await target.click();
    await expect(page).toHaveURL(new RegExp(`${escapeRegExp(href)}$`));
    await expect(page.locator(".breadcrumbs strong")).toHaveText(label);
    await expect(page.locator(".example-documentation")).toBeVisible();
  }

  expect(errors).toEqual([]);
});

test("playground navigation supports history and direct route reloads", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/");
  const links = page.locator(".sidebar-collection a[href]");
  await expect(links.first()).toBeAttached();
  const destinations = await links.evaluateAll((anchors) =>
    Array.from(new Set(anchors.map((link) => link.getAttribute("href"))))
      .filter((href): href is string => Boolean(href?.startsWith("#/")))
      .slice(0, 2),
  );
  expect(destinations).toHaveLength(2);

  await page.goto(`/${destinations[0]}`);
  await expect(page.locator(".example-documentation")).toBeVisible();
  await page.goto(`/${destinations[1]}`);
  await expect(page.locator(".example-documentation")).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(new RegExp(`${escapeRegExp(destinations[0])}$`));
  await page.goForward();
  await expect(page).toHaveURL(new RegExp(`${escapeRegExp(destinations[1])}$`));
  await page.reload();
  await expect(page.locator(".example-documentation")).toBeVisible();
  expect(errors).toEqual([]);
});

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
