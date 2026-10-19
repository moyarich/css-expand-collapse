import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, it } from "vitest";
import registry from "../registry.config";
import { buildContentRegistry } from "../vite-plugins/content-registry/content-registry";

it("every registered MDX page explicitly renders one playground", async () => {
  const entries = await buildContentRegistry(registry, resolve(import.meta.dirname, ".."));
  expect(entries.filter((entry) => entry.collection !== "Docs")).toHaveLength(91);
  expect(entries.filter((entry) => entry.collection === "Docs")).toHaveLength(7);
  for (const entry of entries) {
    if (entry.collection === "Docs") continue;
    const content = readFileSync(entry.page, "utf8");
    expect(content.match(/<(?:APIPlayground|CSSConverter)\b[^>]*\/>/g), entry.page).toHaveLength(1);
    expect(content, entry.page).toContain('import source from "./source.');
    expect(content, entry.page).not.toContain("<ExamplePlayground");
  }
});
