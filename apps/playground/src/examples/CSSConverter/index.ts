export type CSSConverterMode = "expand" | "collapse";

export interface CSSConverterExampleMeta {
  id: string;
  label: string;
  description: string;
  group: string;
  groupOrder: number;
  order: number;
  fillMissingLonghands: boolean;
}

export interface CSSConverterExample extends CSSConverterExampleMeta {
  key: string;
  mode: CSSConverterMode;
  source: string;
}

const sourceModules = import.meta.glob("./*/*/source.css", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const metadataModules = import.meta.glob("./*/*/meta.json", {
  import: "default",
  eager: true,
}) as Record<string, CSSConverterExampleMeta>;

export const CSS_CONVERTER_EXAMPLES: readonly CSSConverterExample[] = Object.entries(metadataModules)
  .map(([path, metadata]) => {
    const parts = path.split("/");
    const mode = parts.at(-3) as CSSConverterMode;
    const id = parts.at(-2)!;
    const key = `${mode}/${id}`;
    const source = sourceModules[`./${mode}/${id}/source.css`];

    if (mode !== "expand" && mode !== "collapse") {
      throw new Error(`Invalid CSS converter example mode: ${mode}`);
    }
    if (!source) throw new Error(`Missing source.css for CSS converter example: ${key}`);
    if (metadata.id !== id) throw new Error(`CSS converter metadata id mismatch: ${key}`);

    return { ...metadata, key, mode, source };
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
  (example) => example.key === "expand/text-decoration",
)!;
