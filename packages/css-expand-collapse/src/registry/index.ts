import { SHORTHANDS } from "./shorthands/index.js";
import type { ShorthandModule, ShorthandModuleMap } from "./module.js";

export type { LonghandMap, ShorthandModule, ShorthandModuleMap } from "./module.js";
export type {
  DeclarationMap,
  ShorthandCollapseContext,
  ShorthandCollapser,
  ShorthandExpandContext,
  ShorthandExpander,
} from "./types.js";

const shorthandEntries = Object.entries(SHORTHANDS) as [string, ShorthandModule][];

function buildDefinitions(): ShorthandModuleMap {
  const definitions: Record<string, ShorthandModule> = {};
  for (const [property, module] of shorthandEntries) {
    if (!module.longhands.size) continue;
    definitions[property] = module;
  }
  return Object.freeze(definitions);
}

export const SHORTHAND_MODULES: ShorthandModuleMap = Object.freeze(SHORTHANDS);
export const SHORTHAND_PROPERTIES = Object.freeze(Object.keys(SHORTHAND_MODULES));
export const SHORTHAND_DEFINITIONS = buildDefinitions();
export const SHORTHAND_SET = new Set<string>(SHORTHAND_PROPERTIES);

export const LONGHAND_TO_SHORTHANDS = (() => {
  const map = new Map<string, string[]>();
  for (const [shorthand, module] of shorthandEntries) {
    for (const longhand of module.longhands.keys()) {
      const values = map.get(longhand) ?? [];
      values.push(shorthand);
      map.set(longhand, values);
    }
  }
  return map;
})();
