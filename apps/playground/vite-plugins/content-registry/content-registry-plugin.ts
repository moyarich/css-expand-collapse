import { basename, isAbsolute, relative, resolve, sep } from "node:path";
import type { Plugin, ViteDevServer } from "vite";
import { buildContentRegistry, type ContentRegistryConfig } from "./content-registry";

export function contentRegistryPlugin(config: ContentRegistryConfig): Plugin {
  const publicId = "virtual:content-registry";
  const virtualId = "\0" + publicId;
  let root: string;
  let serve = false;
  // Vite dev-server imports from outside the project root require /@fs/ URLs.
  const importPath = (file: string) =>
    serve ? `/@fs/${file.replaceAll("\\", "/")}` : file;
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
    name: "content-registry",
    configResolved(config) {
      root = config.root;
      serve = config.command === "serve";
    },
    resolveId(id, importer) {
      if (id === publicId) return virtualId;
      // Imports emitted by this virtual module point to discovered files outside
      // the Vite root. Resolve those paths as files, not root-relative URLs.
      if (importer === virtualId) {
        const path = id.startsWith("/@fs/") ? id.slice("/@fs/".length) : id;
        if (isAbsolute(path)) return path;
      }
    },
    async load(id) {
      if (id !== virtualId) return;
      const entries = await buildContentRegistry(config, root, (file) =>
        this.addWatchFile(file),
      );
      const imports: string[] = [];
      const collections = Object.fromEntries(
        Object.keys(config.sources).map((key) => [key, [] as string[]]),
      );
      for (const [index, entry] of entries.entries()) {
        imports.push(
          `import * as Page${index} from ${JSON.stringify(importPath(entry.page))};`,
        );
        if (entry.collection !== "Docs") imports.push(
          `if (Page${index}.frontmatter.id !== ${JSON.stringify(entry.key.split("/").at(-1))}) throw new Error(${JSON.stringify(`Example metadata id mismatch: ${entry.collection}/${entry.key}`)});`,
        );
        imports.push(
          `if (typeof Page${index}.frontmatter?.label !== "string" || !Page${index}.frontmatter.label.trim() || ${entry.collection === "Docs" ? "false" : `!Number.isFinite(Page${index}.frontmatter.order)`}) throw new Error(${JSON.stringify(`Invalid example metadata: ${entry.collection}/${entry.key}`)});`,
        );
        collections[entry.collection].push(
          `{...Page${index}.frontmatter, key: ${JSON.stringify(entry.key)}, mode: ${JSON.stringify(entry.mode)}, pageFile: ${JSON.stringify(basename(entry.page))}, Component: Page${index}.default, tableOfContents: Page${index}.tableOfContents}`,
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
