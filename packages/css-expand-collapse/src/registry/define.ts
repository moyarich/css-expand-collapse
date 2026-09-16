import type { ShorthandDefinition } from "./types.js";

export interface ShorthandRegistration<Property extends string = string> {
  property: Property;
  definition: ShorthandDefinition;
}

export function defineShorthand<const Property extends string>(
  property: Property,
  definition: ShorthandDefinition,
): ShorthandRegistration<Property> {
  return { property, definition };
}
