import { readdir, access } from "node:fs/promises";
import { resolve, relative, sep, isAbsolute, basename } from "node:path";
import type { Plugin, ViteDevServer } from "vite";

export interface ExampleRegistryConfig {
  sources: Record<
    string,
    {
      base: string;
      source: string;
      kind: "api" | "converter";
      pages?: readonly string[];
      modes?: readonly string[];
    }
  >;
}

export interface ExampleRegistryEntry {
  collection: string;
  key: string;
  mode?: string;
  page: string;
  source: string;
}

export async function buildExampleRegistry(
  config: ExampleRegistryConfig,
  root: string,
  watch: (file: string) => void = () => {},
): Promise<ExampleRegistryEntry[]> {
  const entries: ExampleRegistryEntry[] = [];
  for (const [collection, options] of Object.entries(config.sources)) {
    if (!options.source || basename(options.source) !== options.source)
      throw new Error(
        `Registry source must be a local basename: ${options.source}`,
      );
    const pageNames = options.pages ?? ["page.md", "page.mdx"];
    if (!pageNames.length || pageNames.some((name) => !name || basename(name) !== name))
      throw new Error(`Invalid registry page filenames: ${collection}`);
    if (options.kind === "converter" && (!options.modes?.length || options.modes.some((mode) => !mode || mode.includes("/"))))
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
        const key = relative(base, folder).split(sep).join("/");
        const parts = key.split("/");
        if (
          options.kind === "api"
            ? parts.length !== 1 || !key
            : parts.length !== 2 || !options.modes?.includes(parts[0])
        )
          throw new Error(`Invalid ${options.kind} example path: ${key}`);
        const source = resolve(folder, options.source);
        await access(source);
        const page = resolve(folder, pages[0].name);
        watch(page);
        watch(source);
        entries.push({
          collection,
          key,
          page,
          source,
          ...(options.kind === "converter"
            ? { mode: parts[0] }
            : {}),
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

export function exampleRegistryPlugin(config: ExampleRegistryConfig): Plugin {
  const publicId = "virtual:example-registry";
  const virtualId = "\0" + publicId;
  let root: string;
  function reload(server: ViteDevServer, file: string) {
    if (
      !Object.values(config.sources).some((source) => {
        const path = relative(resolve(root, source.base), resolve(file));
        return (
          path === "" ||
          (path !== ".." && !path.startsWith(".." + sep) && !isAbsolute(path))
        );
      })
    )
      return;
    const module = server.moduleGraph.getModuleById(virtualId);
    if (module) server.moduleGraph.invalidateModule(module);
    server.ws.send({ type: "full-reload" });
  }
  return {
    name: "example-registry",
    configResolved(config) {
      root = config.root;
    },
    resolveId(id) {
      if (id === publicId) return virtualId;
    },
    async load(id) {
      if (id !== virtualId) return;
      const entries = await buildExampleRegistry(config, root, (file) =>
        this.addWatchFile(file),
      );
      const imports: string[] = [];
      const collections = Object.fromEntries(
        Object.keys(config.sources).map((key) => [key, [] as string[]]),
      );
      for (const [index, entry] of entries.entries()) {
        imports.push(
          `import * as Page${index} from ${JSON.stringify(entry.page)};`,
        );
        imports.push(
          `import Source${index} from ${JSON.stringify(entry.source + "?raw")};`,
        );
        imports.push(
          `if (Page${index}.frontmatter.id !== ${JSON.stringify(entry.key.split("/").at(-1))}) throw new Error(${JSON.stringify(`Example metadata id mismatch: ${entry.collection}/${entry.key}`)});`,
        );
        imports.push(
          `if (typeof Page${index}.frontmatter?.label !== "string" || !Page${index}.frontmatter.label.trim() || !Number.isFinite(Page${index}.frontmatter.order)) throw new Error(${JSON.stringify(`Invalid example metadata: ${entry.collection}/${entry.key}`)});`,
        );
        collections[entry.collection].push(
          `{...Page${index}.frontmatter, key: ${JSON.stringify(entry.key)}, mode: ${JSON.stringify(entry.mode)}, source: Source${index}, pageFile: ${JSON.stringify(basename(entry.page))}, Component: Page${index}.default, tableOfContents: Page${index}.tableOfContents}`,
        );
      }
      return `${imports.join("\n")}\nexport const registry = {${Object.entries(
        collections,
      )
        .map(
          ([key, records]) =>
            `${JSON.stringify(key)}: [${records.join(",")}].sort((a,b) => a.order - b.order)`,
        )
        .join(",")}};`;
    },
    configureServer(server) {
      server.watcher.add(
        Object.values(config.sources).map((source) =>
          resolve(root, source.base),
        ),
      );
      const onChange = (file: string) => reload(server, file);
      const events = [
        "add",
        "unlink",
        "change",
        "addDir",
        "unlinkDir",
      ] as const;
      for (const event of events) server.watcher.on(event, onChange);
      server.httpServer?.once("close", () => {
        for (const event of events) server.watcher.off(event, onChange);
      });
    },
  };
}
