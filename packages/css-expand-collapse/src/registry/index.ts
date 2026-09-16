import { SHORTHANDS } from "./shorthands/index.js";
import type { ShorthandDefinition, ShorthandDefinitionMap } from "./types.js";

export type {
  ShorthandDefinition,
  ShorthandDefinitionMap,
  ShorthandStrategy,
} from "./types.js";
export type { ShorthandRegistration } from "./define.js";
export { defineShorthand } from "./define.js";

function buildDefinitions(): ShorthandDefinitionMap {
  const definitions: Record<string, ShorthandDefinition> = {};

  for (const { property, definition } of SHORTHANDS) {
    if (definitions[property]) {
      throw new Error(`Duplicate shorthand registration: ${property}`);
    }
    definitions[property] = definition;
  }

  return Object.freeze(definitions);
}

export const SHORTHAND_PROPERTIES = Object.freeze(
  SHORTHANDS.map(({ property }) => property),
);

export const SHORTHAND_DEFINITIONS = buildDefinitions();

export const SHORTHAND_SET = new Set<string>(SHORTHAND_PROPERTIES);

export const LONGHAND_TO_SHORTHANDS = (() => {
  const map = new Map<string, string[]>();

  for (const { property: shorthand, definition } of SHORTHANDS) {
    for (const longhand of definition.longhands) {
      const values = map.get(longhand) ?? [];
      values.push(shorthand);
      map.set(longhand, values);
    }
  }

  return map;
})();
