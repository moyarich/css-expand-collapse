import { readdir, access } from "node:fs/promises";
import { resolve, relative, sep, basename } from "node:path";

export interface ContentRegistryConfig {
  sources: Record<
    string,
    {
      base: string;
      source?: string;
      kind: "api" | "converter" | "docs";
      pages?: readonly string[];
      modes?: readonly string[];
    }
  >;
}

export interface ContentRegistryEntry {
  collection: string;
  key: string;
  mode?: string;
  page: string;
  source?: string;
}

export async function buildContentRegistry(
  config: ContentRegistryConfig,
  root: string,
  watch: (file: string) => void = () => {},
): Promise<ContentRegistryEntry[]> {
  const entries: ContentRegistryEntry[] = [];
  for (const [collection, options] of Object.entries(config.sources)) {
    if (
      options.kind !== "docs" &&
      (!options.source || basename(options.source) !== options.source)
    )
      throw new Error(
        `Registry source must be a local basename: ${options.source}`,
      );
    const pageNames = options.pages ?? ["page.md", "page.mdx"];
    if (
      !pageNames.length ||
      pageNames.some((name) => !name || basename(name) !== name)
    )
      throw new Error(`Invalid registry page filenames: ${collection}`);
    if (
      options.kind === "converter" &&
      (!options.modes?.length ||
        options.modes.some((mode) => !mode || mode.includes("/")))
    )
      throw new Error(`Converter modes must be configured: ${collection}`);
    const base = resolve(root, options.base);
    async function walk(folder: string): Promise<void> {
      watch(folder);
      const children = await readdir(folder, { withFileTypes: true });
      const pages = children.filter(
        (child) => child.isFile() && pageNames.includes(child.name),
      );
      if (pages.length > 1)
        throw new Error(`Multiple example pages: ${folder}`);
      if (pages.length) {
        const key = relative(base, folder).split(sep).join("/") || "index";
        const parts = key.split("/");
        if (
          options.kind === "docs"
            ? parts.length !== 1
            : options.kind === "api"
              ? parts.length !== 1 || !key
              : parts.length !== 2 || !options.modes?.includes(parts[0])
        )
          throw new Error(`Invalid ${options.kind} example path: ${key}`);
        const source = options.source
          ? resolve(folder, options.source)
          : undefined;
        if (source) await access(source);
        const page = resolve(folder, pages[0].name);
        watch(page);
        if (source) watch(source);
        entries.push({
          collection,
          key,
          page,
          ...(source ? { source } : {}),
          ...(options.kind === "converter" ? { mode: parts[0] } : {}),
        });
      }
      for (const child of children.sort((a, b) => a.name.localeCompare(b.name)))
        if (
          child.isDirectory() &&
          !child.name.startsWith(".") &&
          child.name !== "node_modules"
        )
          await walk(resolve(folder, child.name));
    }
    await walk(base);
  }
  return entries;
}
