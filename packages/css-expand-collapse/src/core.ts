import { lexer } from "css-tree";
import {
  LONGHAND_TO_SHORTHANDS,
  SHORTHAND_DEFINITIONS,
  SHORTHAND_PROPERTIES,
  SHORTHAND_SET,
  type DeclarationMap,
  type ShorthandDefinition,
  type ShorthandExpandContext,
  type ShorthandStrategy,
} from "./registry.js";

export type { DeclarationMap } from "./registry.js";

export interface TransformOptions {
  /**
   * Opt in to filling missing longhands with registered CSS initial values while
   * collapsing. This is useful for computed/export CSS, but can change cascade
   * behavior for raw stylesheets because the resulting shorthand explicitly sets
   * properties that were previously omitted.
   */
  fillMissingLonghands?: false | "initial";
}

/** @deprecated Use `TransformOptions`. */
export interface CssomOptions extends TransformOptions {
  /** @deprecated Transform logic no longer depends on CSSOM and this field is ignored. */
  style?: CSSStyleDeclaration | null;
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

export function getShorthandStrategy(property: string): ShorthandStrategy | null {
  return SHORTHAND_DEFINITIONS[normalizeProperty(property)]?.strategy ?? null;
}

/** True when the registry has an implementation path for this shorthand. */
export function supportsTransform(property: string): boolean {
  return Boolean(SHORTHAND_DEFINITIONS[normalizeProperty(property)]);
}

/** True when the shorthand can be transformed without a browser DOM/CSSOM. */
export function supportsPureTransform(property: string): boolean {
  return supportsTransform(property);
}

/** Split a CSS value on top-level whitespace without breaking strings or functions. */
export function splitTopLevelWhitespace(value: string): string[] {
  const result: string[] = [];
  let current = "";
  let quote: "'" | '"' | null = null;
  let escaped = false;
  let parenDepth = 0;
  let bracketDepth = 0;

  const push = () => {
    const token = current.trim();
    if (token) result.push(token);
    current = "";
  };

  for (const char of value.trim()) {
    if (escaped) {
      current += char;
      escaped = false;
      continue;
    }
    if (char === "\\") {
      current += char;
      escaped = true;
      continue;
    }
    if (quote) {
      current += char;
      if (char === quote) quote = null;
      continue;
    }
    if (char === "'" || char === '"') {
      quote = char;
      current += char;
      continue;
    }
    if (char === "(") parenDepth += 1;
    if (char === ")") parenDepth = Math.max(0, parenDepth - 1);
    if (char === "[") bracketDepth += 1;
    if (char === "]") bracketDepth = Math.max(0, bracketDepth - 1);

    if (/\s/.test(char) && parenDepth === 0 && bracketDepth === 0) {
      push();
    } else {
      current += char;
    }
  }

  push();
  return result;
}

function splitTopLevelSlash(value: string): string[] {
  const parts: string[] = [];
  let current = "";
  let quote: "'" | '"' | null = null;
  let escaped = false;
  let parenDepth = 0;
  let bracketDepth = 0;

  const push = () => {
    parts.push(current.trim());
    current = "";
  };

  for (const char of value.trim()) {
    if (escaped) {
      current += char;
      escaped = false;
      continue;
    }
    if (char === "\\") {
      current += char;
      escaped = true;
      continue;
    }
    if (quote) {
      current += char;
      if (char === quote) quote = null;
      continue;
    }
    if (char === "'" || char === '"') {
      quote = char;
      current += char;
      continue;
    }
    if (char === "(") parenDepth += 1;
    if (char === ")") parenDepth = Math.max(0, parenDepth - 1);
    if (char === "[") bracketDepth += 1;
    if (char === "]") bracketDepth = Math.max(0, bracketDepth - 1);

    if (char === "/" && parenDepth === 0 && bracketDepth === 0) {
      push();
    } else {
      current += char;
    }
  }

  push();
  return parts;
}

function matchProperty(property: string, value: string): boolean {
  try {
    const result = lexer.matchProperty(property, value) as unknown as {
      matched?: unknown;
      error?: unknown;
    };
    return Boolean(result.matched) && !result.error;
  } catch {
    return false;
  }
}

export function expandShorthand(
  property: string,
  value: string,
  _options?: CssomOptions,
): DeclarationMap | null {
  const shorthand = normalizeProperty(property);
  const definition = SHORTHAND_DEFINITIONS[shorthand];
  if (!isShorthand(shorthand) || !definition) return null;

  const normalizedValue = value.trim();
  if (!normalizedValue) return null;

  if (GLOBAL_VALUES.has(normalizedValue)) {
    return Object.fromEntries(
      definition.longhands.map((longhand) => [longhand, normalizedValue]),
    );
  }

  const context: ShorthandExpandContext = {
    matchProperty,
    splitWhitespace: splitTopLevelWhitespace,
    splitSlash: splitTopLevelSlash,
  };

  return definition.expand(normalizedValue, context);
}

function compressQuad(values: readonly string[]): string {
  const [top, right, bottom, left] = values;
  if (top === right && top === bottom && top === left) return top!;
  if (top === bottom && right === left) return `${top} ${right}`;
  if (right === left) return `${top} ${right} ${bottom}`;
  return values.join(" ");
}

function collapseFlex(concrete: readonly string[]): string {
  const [grow, shrink, basis] = concrete;
  if (grow === "0" && shrink === "0" && basis === "auto") return "none";
  if (grow === "1" && shrink === "1" && basis === "auto") return "auto";
  return `${grow} ${shrink} ${basis}`;
}

function collapseLogicalBorderAxis(concrete: readonly string[]): string | null {
  if (concrete.length !== 6) return null;
  const first = concrete.slice(0, 3);
  const second = concrete.slice(3, 6);
  if (!first.every((value, index) => value === second[index])) return null;
  return first.join(" ");
}

function collapseSlashPair(
  definition: ShorthandDefinition,
  concrete: readonly string[],
): string | null {
  if (concrete.length !== 2) return null;
  const [first, second] = concrete;
  if (second === definition.initialValues?.[1]) return first!;
  return `${first} / ${second}`;
}

function collapsePure(
  definition: ShorthandDefinition,
  declarations: DeclarationMap,
): string | null {
  const values = definition.longhands.map((property) => declarations[property]?.trim());
  if (values.some((value) => !value)) return null;
  const concrete = values as string[];

  if (concrete.every((value) => value === concrete[0]) && GLOBAL_VALUES.has(concrete[0]!)) {
    return concrete[0]!;
  }

  switch (definition.strategy) {
    case "quad":
      return compressQuad(concrete);
    case "pair":
      return concrete[0] === concrete[1] ? concrete[0]! : concrete.join(" ");
    case "triple":
      return concrete.join(" ");
    case "logical-border-axis":
      return collapseLogicalBorderAxis(concrete);
    case "flex":
      return collapseFlex(concrete);
    case "flex-flow":
    case "components":
    case "text-decoration":
      return concrete.join(" ");
    case "slash-pair":
      return collapseSlashPair(definition, concrete);
    case "border-all": {
      const sides = ["top", "right", "bottom", "left"].map((side) => [
        declarations[`border-${side}-width`],
        declarations[`border-${side}-style`],
        declarations[`border-${side}-color`],
      ]);
      if (sides.some((side) => side.some((value) => !value))) return null;
      const first = sides[0]!.join(" ");
      return sides.every((side) => side.join(" ") === first) ? first : null;
    }
    case "csstree":
      return null;
  }
}

function fillMissingInitialLonghands(
  definition: ShorthandDefinition,
  declarations: DeclarationMap,
  options?: TransformOptions,
): DeclarationMap {
  const completed = { ...declarations };
  if (options?.fillMissingLonghands !== "initial" || !definition.initialValues) {
    return completed;
  }

  definition.longhands.forEach((longhand, index) => {
    if (completed[longhand]) return;
    const initialValue = definition.initialValues?.[index];
    if (initialValue) completed[longhand] = initialValue;
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
  const value = definition.collapse?.(completed, { matchProperty })
    ?? collapsePure(definition, completed);
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
