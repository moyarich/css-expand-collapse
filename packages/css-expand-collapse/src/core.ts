import {
  LONGHAND_TO_SHORTHANDS,
  SHORTHAND_DEFINITIONS,
  SHORTHAND_PROPERTIES,
  SHORTHAND_SET,
  type DeclarationMap,
  type ShorthandModule,
} from "./registry.js";
import {
  shorthandCollapseContext,
  shorthandExpandContext,
} from "./registry/context.js";

export type { DeclarationMap } from "./registry.js";

export interface TransformOptions {
  /**
   * Controls whether omitted registered longhands may use module-owned initial values.
   * Object-level collapse APIs use initial values by default when they are available;
   * pass false to require a complete declaration map. Stylesheet/declaration-text
   * collapse remains conservative unless "initial" is explicitly requested.
   */
  fillMissingLonghands?: false | "initial";
}

export interface CollapseResult {
  property: string;
  value: string;
  consumed: string[];
  declarations: DeclarationMap;
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
  return [...(SHORTHAND_DEFINITIONS[normalizeProperty(shorthand)]?.longhands ?? [])];
}

export function getShorthands(longhand: string): string[] {
  return [...(LONGHAND_TO_SHORTHANDS.get(normalizeProperty(longhand)) ?? [])];
}

export function supportsTransform(property: string): boolean {
  return Boolean(SHORTHAND_DEFINITIONS[normalizeProperty(property)]);
}

export function supportsPureTransform(property: string): boolean {
  return supportsTransform(property);
}

export function expandShorthand(
  property: string,
  value: string,
  _options?: TransformOptions,
): DeclarationMap | null {
  const shorthand = normalizeProperty(property);
  const definition = SHORTHAND_DEFINITIONS[shorthand];
  if (!definition) return null;

  const normalizedValue = value.trim();
  if (!normalizedValue) return null;

  if (GLOBAL_VALUES.has(normalizedValue)) {
    return Object.fromEntries(
      definition.longhands.map((longhand) => [longhand, normalizedValue]),
    );
  }

  return definition.expand(normalizedValue, shorthandExpandContext);
}

function fillMissingInitialLonghands(
  definition: ShorthandModule,
  declarations: DeclarationMap,
  options?: TransformOptions,
): DeclarationMap {
  const completed = { ...declarations };
  const shouldFill = options?.fillMissingLonghands !== false;

  if (!shouldFill || !definition.initialValues) {
    return completed;
  }

  definition.longhands.forEach((longhand, index) => {
    if (Object.hasOwn(completed, longhand)) return;
    const initialValue = definition.initialValues?.[index];
    if (initialValue !== undefined) completed[longhand] = initialValue;
  });
  return completed;
}

export function collapseToShorthand(
  shorthandProperty: string,
  declarations: DeclarationMap,
  options?: TransformOptions,
): CollapseResult | null {
  const property = normalizeProperty(shorthandProperty);
  const definition = SHORTHAND_DEFINITIONS[property];
  if (!definition) return null;

  const normalized = Object.fromEntries(
    Object.entries(declarations).map(([key, value]) => [normalizeProperty(key), value.trim()]),
  );
  const consumed = definition.longhands.filter((longhand) => Object.hasOwn(normalized, longhand));
  if (!consumed.length) return null;

  const completed = fillMissingInitialLonghands(definition, normalized, options);
  const concrete = definition.longhands.map((longhand) => completed[longhand]);
  const first = concrete[0];
  const value = first && concrete.every((entry) => entry === first) && GLOBAL_VALUES.has(first)
    ? first
    : definition.collapse(completed, shorthandCollapseContext);
  if (!value) return null;

  return {
    property,
    value,
    consumed,
    declarations: Object.fromEntries(
      definition.longhands.map((longhand) => [longhand, completed[longhand]!]),
    ),
  };
}

export function findCollapsibleShorthands(
  declarations: DeclarationMap,
  options?: TransformOptions,
): CollapseResult[] {
  return Object.entries(SHORTHAND_DEFINITIONS)
    .sort(([, a], [, b]) => b.longhands.length - a.longhands.length)
    .map(([shorthand]) => collapseToShorthand(shorthand, declarations, options))
    .filter((result): result is CollapseResult => Boolean(result));
}

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
