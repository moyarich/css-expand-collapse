export type CSSConverterMode = "expand" | "collapse";

export interface CSSConverterExampleMeta {
  id: string;
  label: string;
  description: string;
  group: string;
  groupOrder: number;
  order: number;
  mode: CSSConverterMode;
  fillMissingLonghands: boolean;
}

export interface CSSConverterExample extends CSSConverterExampleMeta {
  source: string;
}

const sourceModules = import.meta.glob("./*/source.tsx", {
  import: "default",
  eager: true,
}) as Record<string, string>;

const metadataModules = import.meta.glob("./*/meta.json", {
  import: "default",
  eager: true,
}) as Record<string, CSSConverterExampleMeta>;

export const CSS_CONVERTER_EXAMPLES: readonly CSSConverterExample[] = Object.entries(metadataModules)
  .map(([path, metadata]) => {
    const id = path.split("/").at(-2)!;
    const source = sourceModules[`./${id}/source.tsx`];
    if (!source) throw new Error(`Missing source.tsx for CSS converter example: ${id}`);
    if (metadata.id !== id) throw new Error(`CSS converter metadata id mismatch: ${id}`);
    return { ...metadata, source };
  })
  .sort((a, b) => a.order - b.order);

const groupOrder = new Map<string, number>();
for (const example of CSS_CONVERTER_EXAMPLES) {
  const current = groupOrder.get(example.group);
  if (current === undefined || example.groupOrder < current) {
    groupOrder.set(example.group, example.groupOrder);
  }
}

export const CSS_CONVERTER_GROUPS = [...groupOrder]
  .sort((a, b) => a[1] - b[1])
  .map(([group]) => group);

export const DEFAULT_CSS_CONVERTER_EXAMPLE = CSS_CONVERTER_EXAMPLES.find(
  (example) => example.id === "text-decoration",
)!;
