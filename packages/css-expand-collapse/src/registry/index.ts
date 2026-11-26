import { activeLonghands } from "./helpers.js";
import { SHORTHANDS } from "./shorthands/index.js";
import type {
  LonghandValueEquivalence,
  ShorthandModule,
  ShorthandModuleMap,
} from "./module.js";

export type {
  LonghandMap,
  LonghandValueEquivalence,
  ShorthandModule,
  ShorthandModuleMap,
} from "./module.js";
export type {
  DeclarationMap,
  ShorthandCollapseContext,
  ShorthandCollapser,
  ShorthandExpandContext,
  ShorthandExpander,
} from "./types.js";

const shorthandEntries = Object.entries(SHORTHANDS) as [
  string,
  ShorthandModule,
][];

function buildDefinitions(): ShorthandModuleMap {
  const definitions: Record<string, ShorthandModule> = {};
  for (const [property, module] of shorthandEntries) {
    const longhands = activeLonghands(module.longhands, module.excludedLonghands);
    if (!longhands.size) continue;
    definitions[property] = longhands === module.longhands ? module : { ...module, longhands, safeToDropWhenFullyShadowed: false };
  }
  return Object.freeze(definitions);
}

export const SHORTHAND_MODULES: ShorthandModuleMap = Object.freeze(SHORTHANDS);
export const SHORTHAND_PROPERTIES = Object.freeze(
  Object.keys(SHORTHAND_MODULES),
);
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

export const LONGHAND_VALUE_EQUIVALENCE = (() => {
  const map = new Map<string, LonghandValueEquivalence[]>();
  for (const [, module] of shorthandEntries) {
    for (const [longhand, equivalent] of module.equivalentLonghandValues ??
      []) {
      if (module.excludedLonghands?.includes(longhand)) continue;
      const rules = map.get(longhand) ?? [];
      rules.push(equivalent);
      map.set(longhand, rules);
    }
  }
  return map;
})();
