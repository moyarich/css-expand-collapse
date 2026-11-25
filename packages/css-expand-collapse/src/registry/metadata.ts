import { SHORTHAND_MODULES, SHORTHAND_PROPERTIES } from "./index.js";

export type ShorthandCategory =
  | "background"
  | "border"
  | "layout"
  | "spacing"
  | "typography"
  | "animation"
  | "mask"
  | "scroll"
  | "other";

export interface ShorthandMetadata {
  readonly property: string;
  readonly category: ShorthandCategory;
  readonly longhands: readonly string[];
  readonly transformable: boolean;
}

export interface ShorthandFilter {
  category?: ShorthandCategory;
  transformable?: boolean;
}

function categoryFor(property: string): ShorthandCategory {
  const name = property.replace(/^-(?:webkit|moz|ms|o)-/, "");
  if (name.startsWith("background")) return "background";
  if (/^(?:border|outline|column-rule)(?:-|$)/.test(name)) return "border";
  if (/^(?:margin|padding|gap)(?:-|$)/.test(name)) return "spacing";
  if (/^(?:font|text|line|white-space|list-style)(?:-|$)/.test(name))
    return "typography";
  if (/^(?:animation|transition|offset|view-timeline)(?:-|$)/.test(name))
    return "animation";
  if (name.startsWith("mask")) return "mask";
  if (/^(?:scroll|overscroll)(?:-|$)/.test(name)) return "scroll";
  if (/^(?:grid|flex|place|inset|columns|container|contain|position|overflow)(?:-|$)/.test(name))
    return "layout";
  return "other";
}

/** Return metadata for one recognized shorthand, or undefined for unknown names. */
export function getShorthandMetadata(property: string): ShorthandMetadata | undefined {
  const name = property.trim().toLowerCase();
  if (!Object.hasOwn(SHORTHAND_MODULES, name)) return undefined;
  const module = SHORTHAND_MODULES[name]!;
  return Object.freeze({
    property: name,
    category: categoryFor(name),
    longhands: Object.freeze([...module.longhands.keys()]),
    transformable: module.longhands.size > 0,
  });
}

/** List recognized shorthands, optionally filtered by category and transformability. */
export function listShorthands(filter: ShorthandFilter = {}): readonly ShorthandMetadata[] {
  return Object.freeze(
    SHORTHAND_PROPERTIES.map((name) => getShorthandMetadata(name)!).filter(
      (item) =>
        (filter.category === undefined || item.category === filter.category) &&
        (filter.transformable === undefined || item.transformable === filter.transformable),
    ),
  );
}
