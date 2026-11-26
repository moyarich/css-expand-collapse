import { getModuleCapabilities } from "./helpers.js";
import type { ShorthandCapabilities, ShorthandModuleMap } from "./module.js";
import { SHORTHAND_MODULES } from "./index.js";

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
  readonly capabilities: ShorthandCapabilities;
  readonly experimental: boolean;
}

export interface ShorthandFilter {
  category?: ShorthandCategory;
  transformable?: boolean;
  expand?: boolean;
  collapse?: boolean;
  experimental?: boolean;
}

function categoryFor(property: string): ShorthandCategory {
  const name = property.replace(/^-(?:webkit|moz|ms|o)-/, "");
  if (name.startsWith("background")) return "background";
  if (/^(?:border|outline|column-rule)(?:-|$)/.test(name)) return "border";
  if (/^(?:margin|padding|gap)(?:-|$)/.test(name)) return "spacing";
  if (/^(?:font|text|line|white-space|list-style)(?:-|$)/.test(name))
    return "typography";
  if (/^(?:animation|transition|offset|view-timeline|timeline-trigger|event-trigger)(?:-|$)/.test(name))
    return "animation";
  if (name.startsWith("mask")) return "mask";
  if (/^(?:scroll|overscroll)(?:-|$)/.test(name)) return "scroll";
  if (/^(?:grid|flex|place|inset|columns|container|contain|position|overflow)(?:-|$)/.test(name))
    return "layout";
  return "other";
}

/** Return metadata for one recognized shorthand, or undefined for unknown names. */
export function getShorthandMetadata(property: string, modules: ShorthandModuleMap = SHORTHAND_MODULES): ShorthandMetadata | undefined {
  const name = property.trim().toLowerCase();
  if (!Object.hasOwn(modules, name)) return undefined;
  const module = modules[name]!;
  const capabilities = getModuleCapabilities(module);
  return Object.freeze({
    property: name,
    category: categoryFor(name),
    longhands: Object.freeze([...module.longhands.keys()]),
    transformable: capabilities.expand && capabilities.collapse,
    capabilities,
    experimental: module.experimental ?? false,
  });
}

/** List recognized shorthands, optionally filtered by category and transformability. */
export function listShorthands(filter: ShorthandFilter = {}, modules: ShorthandModuleMap = SHORTHAND_MODULES): readonly ShorthandMetadata[] {
  return Object.freeze(
    Object.keys(modules).map((name) => getShorthandMetadata(name, modules)!).filter(
      (item) =>
        (filter.category === undefined || item.category === filter.category) &&
        (filter.transformable === undefined || item.transformable === filter.transformable) &&
        (filter.expand === undefined || item.capabilities.expand === filter.expand) &&
        (filter.collapse === undefined || item.capabilities.collapse === filter.collapse) &&
        (filter.experimental === undefined || item.experimental === filter.experimental),
    ),
  );
}
