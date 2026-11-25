import { parse, type Value } from "css-tree";
import { expandShorthand, type DeclarationMap } from "./core.js";
import { hasCustomPropertyReference } from "./custom-properties.js";
import { validateProperty, type ValidationResult } from "./validation/index.js";
import { splitTopLevelComma } from "./registry/context.js";

export type LayeredShorthand = "background" | "mask" | "animation" | "transition";

export interface CssLayer {
  /** Original layer text, excluding surrounding whitespace. */
  readonly value: string;
  /** UTF-16 offsets in the original value; end is exclusive. */
  readonly start: number;
  readonly end: number;
}

export interface LayerParseResult extends ValidationResult {
  readonly layers: readonly CssLayer[];
  /** Expanded values include CSS defaults when safely representable. */
  readonly declarations: DeclarationMap | null;
}

/** Split a syntactically parseable CSS value at top-level commas. */
export function splitCssLayers(value: string): CssLayer[] | null {
  try {
    const ast = parse(value, { context: "value", positions: true }) as Value;
    const boundaries = ast.children.toArray().filter(
      (node) => node.type === "Operator" && node.value === ",",
    );
    const layers: CssLayer[] = [];
    let start = 0;
    for (const end of [...boundaries.map((node) => node.loc!.start.offset), value.length]) {
      const raw = value.slice(start, end);
      const trimmed = raw.trim();
      if (!trimmed) return null;
      const offset = start + raw.length - raw.trimStart().length;
      layers.push({ value: trimmed, start: offset, end: offset + trimmed.length });
      start = end + 1;
    }
    return layers;
  } catch {
    return null;
  }
}

/** Parse authored layers and safely expand their represented longhands. */
export function parseCssLayers(property: LayeredShorthand, value: string): LayerParseResult {
  const validation = validateProperty(property, value);
  const layers = splitCssLayers(value) ?? [];
  // The existing expander's scanner does not understand comments. Avoid
  // claiming an expansion when it sees different layer boundaries.
  const compatible = !value.includes("/*") &&
    splitTopLevelComma(value).length === layers.length;
  const expanded = validation.valid === true && compatible &&
    !hasCustomPropertyReference(value)
    ? expandShorthand(property, value)
    : null;
  return { ...validation, layers, declarations: expanded?.declarations ?? null };
}
