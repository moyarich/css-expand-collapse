import { BORDER_SHORTHANDS } from "./borders.js";
import { BOX_SHORTHANDS } from "./box.js";
import { EFFECT_SHORTHANDS } from "./effects.js";
import { LAYOUT_SHORTHANDS } from "./layout.js";
import { SHORTHAND_PROPERTIES } from "./properties.js";
import { TYPOGRAPHY_SHORTHANDS } from "./typography.js";
import type { ShorthandDefinition, ShorthandDefinitionMap } from "./types.js";
import { VENDOR_SHORTHANDS } from "./vendor.js";

export type {
  ShorthandDefinition,
  ShorthandDefinitionMap,
  ShorthandStrategy,
} from "./types.js";
export { SHORTHAND_PROPERTIES } from "./properties.js";

export const SHORTHAND_DEFINITIONS: ShorthandDefinitionMap = {
  ...BOX_SHORTHANDS,
  ...BORDER_SHORTHANDS,
  ...LAYOUT_SHORTHANDS,
  ...TYPOGRAPHY_SHORTHANDS,
  ...EFFECT_SHORTHANDS,
  ...VENDOR_SHORTHANDS,
};

export const SHORTHAND_SET = new Set<string>(SHORTHAND_PROPERTIES);

export const LONGHAND_TO_SHORTHANDS = (() => {
  const map = new Map<string, string[]>();

  for (const [shorthand, definition] of Object.entries(SHORTHAND_DEFINITIONS) as [
    string,
    ShorthandDefinition,
  ][]) {
    for (const longhand of definition.longhands) {
      const values = map.get(longhand) ?? [];
      values.push(shorthand);
      map.set(longhand, values);
    }
  }

  return map;
})();
