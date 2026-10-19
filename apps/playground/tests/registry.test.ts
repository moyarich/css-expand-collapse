import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, expect, it } from "vitest";
import { buildExampleRegistry } from "../vite-plugins/example-registry/example-registry";

const roots: string[] = [];
afterEach(async () => {
  await Promise.all(
    roots.splice(0).map((root) => rm(root, { recursive: true, force: true })),
  );
});
async function fixture(files: string[]) {
  const root = await mkdtemp(join(tmpdir(), "example-registry-"));
  roots.push(root);
  for (const file of files) {
    const path = join(root, file);
    await mkdir(join(path, ".."), { recursive: true });
    await writeFile(path, "fixture");
  }
  return root;
}
it("discovers configured sources and both page extensions without executing editor code", async () => {
  const root = await fixture([
    "api/demo/page.md",
    "api/demo/source.tsx",
    "css/expand/demo/page.mdx",
    "css/expand/demo/source.css",
  ]);
  const entries = await buildExampleRegistry(
    {
      sources: {
        API: { base: "api", source: "source.tsx", kind: "api", pages: ["page.md", "page.mdx"] },
        CSS: { base: "css", source: "source.css", kind: "converter", modes: ["expand", "collapse"] },
      },
    },
    root,
  );
  expect(
    entries.map(({ collection, key, mode }) => ({ collection, key, mode })),
  ).toEqual([
    { collection: "API", key: "demo", mode: undefined },
    { collection: "CSS", key: "expand/demo", mode: "expand" },
  ]);
});
it("rejects ambiguous pages and missing editor sources", async () => {
  const root = await fixture(["demo/page.md", "demo/page.mdx"]);
  const config = {
    sources: { API: { base: ".", source: "source.tsx", kind: "api" as const } },
  };
  await expect(buildExampleRegistry(config, root)).rejects.toThrow(
    "Multiple example pages",
  );
  await rm(join(root, "demo/page.md"));
  await expect(buildExampleRegistry(config, root)).rejects.toThrow("ENOENT");
});
it("rejects invalid converter routes", async () => {
  const root = await fixture([
    "invalid/demo/page.mdx",
    "invalid/demo/source.css",
  ]);
  await expect(
    buildExampleRegistry(
      {
        sources: {
          CSS: { base: ".", source: "source.css", kind: "converter", modes: ["expand", "collapse"] },
        },
      },
      root,
    ),
  ).rejects.toThrow("Invalid converter example path");
});

it("uses configurable page filenames and converter modes", async () => {
  const root = await fixture([
    "custom/mobile/demo/readme.mdx",
    "custom/mobile/demo/editor.css",
  ]);
  const entries = await buildExampleRegistry({
    sources: {
      Custom: {
        base: "custom",
        source: "editor.css",
        kind: "converter",
        pages: ["readme.mdx"],
        modes: ["mobile"],
      },
    },
  }, root);
  expect(entries.map(({ key, mode, page }) => ({ key, mode, page: page.split("/").at(-1) }))).toEqual([
    { key: "mobile/demo", mode: "mobile", page: "readme.mdx" },
  ]);
});

it("rejects missing converter modes and invalid page filenames", async () => {
  const root = await fixture(["demo/page.md", "demo/source.css"]);
  await expect(buildExampleRegistry({
    sources: { CSS: { base: ".", source: "source.css", kind: "converter" } },
  }, root)).rejects.toThrow("Converter modes must be configured");
  await expect(buildExampleRegistry({
    sources: { API: { base: ".", source: "source.css", kind: "api", pages: ["../page.md"] } },
  }, root)).rejects.toThrow("Invalid registry page filenames");
});
