import { SHORTHANDS } from "./shorthands/index.js";
import type {
  ShorthandModule,
  ShorthandModuleMap,
  TransformableShorthandModule,
  TransformableShorthandModuleMap,
} from "./module.js";
import type { ShorthandDefinition, ShorthandDefinitionMap } from "./types.js";

export type {
  ShorthandModule,
  ShorthandModuleMap,
  TransformableShorthandModule,
  TransformableShorthandModuleMap,
} from "./module.js";
export type {
  DeclarationMap,
  ShorthandCollapseContext,
  ShorthandCollapser,
  ShorthandDefinition,
  ShorthandDefinitionMap,
  ShorthandExpandContext,
  ShorthandExpander,
  ShorthandStrategy,
} from "./types.js";

const shorthandEntries = Object.entries(SHORTHANDS) as [string, ShorthandModule][];

function isTransformable(
  module: ShorthandModule,
): module is TransformableShorthandModule {
  return module.strategy !== null;
}

function buildDefinitions(): ShorthandDefinitionMap {
  const definitions: Record<string, ShorthandDefinition> = {};

  for (const [property, module] of shorthandEntries) {
    if (!isTransformable(module)) continue;
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
    for (const longhand of module.longhands) {
      const values = map.get(longhand) ?? [];
      values.push(shorthand);
      map.set(longhand, values);
    }
  }

  return map;
})();
