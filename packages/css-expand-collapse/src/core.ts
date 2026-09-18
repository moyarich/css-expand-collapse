import {
  LONGHAND_TO_SHORTHANDS,
  SHORTHAND_DEFINITIONS,
  SHORTHAND_PROPERTIES,
  SHORTHAND_SET,
  type DeclarationMap,
} from "./registry/index.js";
import {
  shorthandCollapseContext,
  shorthandExpandContext,
} from "./registry/context.js";

export type { DeclarationMap, LonghandMap } from "./registry/index.js";

export interface TransformOptions {
  /**
   * Controls whether omitted registered longhands may use module-owned initial values.
   * Object-level collapse APIs use initial values by default; pass false to require a
   * complete declaration map. Stylesheet/declaration-text collapse remains conservative
   * unless "initial" is explicitly requested.
   */
  fillMissingLonghands?: false | "initial";
}

/**
 * Shared result shape for shorthand expansion and collapse operations.
 *
 * The declarations field always represents the longhand declarations described
 * by the shorthand operation.
 */
export interface ShorthandResult {
  property: string;
  value: string;
  declarations: DeclarationMap;
}

/** Result returned when a shorthand value is expanded into longhands. */
export type ExpandShorthandResult = ShorthandResult;

/** Result returned when longhands are collapsed into a shorthand. */
export interface CollapseShorthandResult extends ShorthandResult {
  /** Input longhands that were present and consumed by the collapse operation. */
  consumed: string[];
}

const GLOBAL_VALUES = new Set(["inherit", "initial", "unset", "revert", "revert-layer"]);
const normalizeProperty = (property: string) => property.trim().toLowerCase();

export function isShorthand(property: string): boolean {
  return SHORTHAND_SET.has(normalizeProperty(property));
}

export function isLonghand(property: string): boolean {
  return LONGHAND_TO_SHORTHANDS.has(normalizeProperty(property));
}

export function getLonghands(shorthand: string): string[] {
  return [...(SHORTHAND_DEFINITIONS[normalizeProperty(shorthand)]?.longhands.keys() ?? [])];
}

export function getShorthands(longhand: string): string[] {
  return [...(LONGHAND_TO_SHORTHANDS.get(normalizeProperty(longhand)) ?? [])];
}

export function supportsTransform(property: string): boolean {
  return Boolean(SHORTHAND_DEFINITIONS[normalizeProperty(property)]);
}

/**
 * Expands a shorthand value into its registered longhand declarations.
 *
 * The returned property is normalized, value is the trimmed shorthand value
 * that was expanded, and declarations contains the represented longhands.
 */
export function expandShorthand(
  property: string,
  value: string,
): ExpandShorthandResult | null {
  const shorthand = normalizeProperty(property);
  const definition = SHORTHAND_DEFINITIONS[shorthand];
  if (!definition) return null;

  const normalizedValue = value.trim();
  if (!normalizedValue) return null;

  const declarations = GLOBAL_VALUES.has(normalizedValue)
    ? Object.fromEntries(
      [...definition.longhands.keys()].map((longhand) => [longhand, normalizedValue]),
    )
    : definition.expand(normalizedValue, shorthandExpandContext);

  if (!declarations) return null;

  return {
    property: shorthand,
    value: normalizedValue,
    declarations,
  };
}

/**
 * Expands every supported shorthand in a declaration object.
 *
 * Entries are processed in object iteration order so later shorthand or
 * longhand declarations override earlier represented longhands.
 * Unsupported or invalid shorthand declarations are preserved unchanged.
 */
export function expandShorthands(
  declarations: DeclarationMap,
): DeclarationMap {
  const output: DeclarationMap = {};

  for (const [rawProperty, value] of Object.entries(declarations)) {
    const property = normalizeProperty(rawProperty);
    const expanded = expandShorthand(property, value);

    if (!expanded) {
      output[property] = value;
      continue;
    }

    for (const [longhand, longhandValue] of Object.entries(expanded.declarations)) {
      output[longhand] = longhandValue;
    }
  }

  return output;
}

/**
 * Collapses registered longhands into one shorthand value.
 *
 * declarations in the result is the complete represented longhand set,
 * including module-owned initial values when missing values are filled.
 * consumed contains only longhands that were present in the input.
 */
export function collapseToShorthand(
  shorthandProperty: string,
  declarations: DeclarationMap,
  options?: TransformOptions,
): CollapseShorthandResult | null {
  const property = normalizeProperty(shorthandProperty);
  const definition = SHORTHAND_DEFINITIONS[property];
  if (!definition) return null;

  const normalized = Object.fromEntries(
    Object.entries(declarations).map(([key, value]) => [normalizeProperty(key), value.trim()]),
  );
  const consumed = [...definition.longhands.keys()].filter((longhand) => Object.hasOwn(normalized, longhand));
  if (!consumed.length) return null;

  const completed = { ...normalized };
  if (options?.fillMissingLonghands !== false) {
    for (const [longhand, initialValue] of definition.longhands) {
      if (!Object.hasOwn(completed, longhand)) completed[longhand] = initialValue;
    }
  }

  const concrete = [...definition.longhands.keys()].map((longhand) => completed[longhand]);
  const first = concrete[0];
  const value = first && concrete.every((entry) => entry === first) && GLOBAL_VALUES.has(first)
    ? first
    : definition.collapse(completed, shorthandCollapseContext);
  if (!value) return null;
  if (!GLOBAL_VALUES.has(value) && !shorthandCollapseContext.matchProperty(property, value)) {
    return null;
  }

  return {
    property,
    value,
    declarations: Object.fromEntries(
      [...definition.longhands.keys()].map((longhand) => [longhand, completed[longhand]!]),
    ),
    consumed,
  };
}

export function findCollapsibleShorthands(
  declarations: DeclarationMap,
  options?: TransformOptions,
): CollapseShorthandResult[] {
  return Object.entries(SHORTHAND_DEFINITIONS)
    .sort(([, a], [, b]) => b.longhands.size - a.longhands.size)
    .map(([shorthand]) => collapseToShorthand(shorthand, declarations, options))
    .filter((result): result is CollapseShorthandResult => Boolean(result));
}

/**
 * Collapses every compatible longhand group in a declaration object.
 *
 * This is the declaration-map counterpart to expandShorthands().
 */
export function collapseLonghands(
  declarations: DeclarationMap,
  options?: TransformOptions,
): DeclarationMap {
  const output: DeclarationMap = Object.fromEntries(
    Object.entries(declarations).map(([property, value]) => [normalizeProperty(property), value]),
  );
  const consumed = new Set<string>();

  for (const result of findCollapsibleShorthands(output, options)) {
    if (result.consumed.some((property) => consumed.has(property))) continue;
    if (!result.consumed.every((property) => Object.hasOwn(output, property))) continue;
    for (const property of result.consumed) {
      delete output[property];
      consumed.add(property);
    }
    output[result.property] = result.value;
  }
  return output;
}

export { SHORTHAND_PROPERTIES };
