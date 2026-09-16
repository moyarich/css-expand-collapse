import { SHORTHANDS } from "./shorthands/index.js";
import type { ShorthandDefinition, ShorthandDefinitionMap } from "./types.js";

export type {
  ShorthandDefinition,
  ShorthandDefinitionMap,
  ShorthandStrategy,
} from "./types.js";

const shorthandEntries = Object.entries(SHORTHANDS) as [
  string,
  ShorthandDefinition | null,
][];

function buildDefinitions(): ShorthandDefinitionMap {
  const definitions: Record<string, ShorthandDefinition> = {};

  for (const [property, definition] of shorthandEntries) {
    if (!definition) continue;
    definitions[property] = definition;
  }

  return Object.freeze(definitions);
}

export const SHORTHAND_PROPERTIES = Object.freeze(Object.keys(SHORTHANDS));
export const SHORTHAND_DEFINITIONS = buildDefinitions();
export const SHORTHAND_SET = new Set<string>(SHORTHAND_PROPERTIES);

export const LONGHAND_TO_SHORTHANDS = (() => {
  const map = new Map<string, string[]>();

  for (const [shorthand, definition] of shorthandEntries) {
    if (!definition) continue;

    for (const longhand of definition.longhands) {
      const values = map.get(longhand) ?? [];
      values.push(shorthand);
      map.set(longhand, values);
    }
  }

  return map;
})();
