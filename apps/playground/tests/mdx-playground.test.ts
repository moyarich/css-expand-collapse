import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, it } from "vitest";
import registry from "../registry.config";
import { buildContentRegistry } from "../vite-plugins/content-registry/content-registry";

it("every registered MDX page explicitly renders one playground", async () => {
  const entries = await buildContentRegistry(registry, resolve(import.meta.dirname, ".."));
  expect(entries).toHaveLength(91);
  for (const entry of entries) {
    const content = readFileSync(entry.page, "utf8");
    expect(content.match(/<ExamplePlayground\s*\/>/g), entry.page).toHaveLength(1);
  }
});
