export interface FunctionExampleMeta {
  id: string;
  label: string;
  description: string;
  order: number;
}

export interface FunctionExample {
  id: string;
  label: string;
  description: string;
  source: string;
}

const sourceModules = import.meta.glob("./*/source.tsx", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const metadataModules = import.meta.glob("./*/meta.json", {
  import: "default",
  eager: true,
}) as Record<string, FunctionExampleMeta>;

export const FUNCTION_EXAMPLES: readonly FunctionExample[] = Object.entries(metadataModules)
  .map(([path, metadata]) => {
    const id = path.split("/").at(-2)!;
    const source = sourceModules[`./${id}/source.tsx`];
    if (!source) throw new Error(`Missing source.tsx for API example: ${id}`);
    if (metadata.id !== id) throw new Error(`API example metadata id mismatch: ${id}`);
    return { ...metadata, source };
  })
  .sort((a, b) => a.order - b.order)
  .map(({ order: _order, ...example }) => example);

export const DEFAULT_FUNCTION_EXAMPLE = FUNCTION_EXAMPLES.find(
  (example) => example.id === "expand-shorthand",
)!;
