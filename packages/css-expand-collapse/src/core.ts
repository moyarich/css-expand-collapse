import { lexer } from "css-tree";
import {
  LONGHAND_TO_SHORTHANDS,
  SHORTHAND_DEFINITIONS,
  SHORTHAND_PROPERTIES,
  SHORTHAND_SET,
  type ShorthandDefinition,
  type ShorthandStrategy,
} from "./registry.js";

export type DeclarationMap = Record<string, string>;

export interface CssomOptions {
  /** Optional mutable CSSStyleDeclaration used for browser CSSOM fallback. */
  style?: CSSStyleDeclaration | null;
  /**
   * Opt in to filling missing longhands with registered CSS initial values while
   * collapsing. This is useful for computed/export CSS, but can change cascade
   * behavior for raw stylesheets because the resulting shorthand explicitly sets
   * properties that were previously omitted.
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

export function getShorthandStrategy(property: string): ShorthandStrategy | null {
  return SHORTHAND_DEFINITIONS[normalizeProperty(property)]?.strategy ?? null;
}

/** True when the registry has an implementation path for this shorthand. */
export function supportsTransform(property: string): boolean {
  return Boolean(SHORTHAND_DEFINITIONS[normalizeProperty(property)]);
}

/** True when expansion/collapse can run without browser CSSOM. */
export function supportsPureTransform(property: string): boolean {
  const definition = SHORTHAND_DEFINITIONS[normalizeProperty(property)];
  return Boolean(definition && definition.strategy !== "cssom");
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
    if (char === "(") parenDepth++;
    if (char === ")") parenDepth = Math.max(0, parenDepth - 1);
    if (char === "[") bracketDepth++;
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
    if (char === "(") parenDepth++;
    if (char === ")") parenDepth = Math.max(0, parenDepth - 1);
    if (char === "[") bracketDepth++;
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

function mutableStyle(options?: CssomOptions): CSSStyleDeclaration | null {
  if (options?.style) {
    options.style.cssText = "";
    return options.style;
  }
  if (typeof document !== "undefined") {
    return document.createElement("div").style;
  }
  return null;
}

function expandWithCssom(
  property: string,
  value: string,
  definition: ShorthandDefinition | undefined,
  options?: CssomOptions,
): DeclarationMap | null {
  if (!definition?.longhands.length) return null;
  const style = mutableStyle(options);
  if (!style) return null;

  style.setProperty(property, value);
  if (!style.getPropertyValue(property) && !definition.longhands.some((p) => style.getPropertyValue(p))) {
    return null;
  }

  const result: DeclarationMap = {};
  for (const longhand of definition.longhands) {
    const longhandValue = style.getPropertyValue(longhand).trim();
    if (longhandValue) result[longhand] = longhandValue;
  }
  return Object.keys(result).length === definition.longhands.length ? result : null;
}

function expandQuad(longhands: readonly string[], value: string): DeclarationMap | null {
  const tokens = splitTopLevelWhitespace(value);
  if (tokens.includes("/") || tokens.length < 1 || tokens.length > 4) return null;
  const [a, b = a, c = a, d = b] = tokens;
  const values = tokens.length === 3 ? [a, b, c, b] : [a, b, c, d];
  return Object.fromEntries(longhands.map((property, index) => [property, values[index]!])) as DeclarationMap;
}

function expandPair(longhands: readonly string[], value: string): DeclarationMap | null {
  const tokens = splitTopLevelWhitespace(value);
  if (tokens.length < 1 || tokens.length > 2) return null;
  const [first, second = first] = tokens;
  return { [longhands[0]!]: first!, [longhands[1]!]: second! };
}

function tripleDefaults(shorthand: string): readonly [string, string, string] {
  if (shorthand === "outline") return ["medium", "none", "auto"];
  return ["medium", "none", "currentcolor"];
}

function expandTriple(
  shorthand: string,
  longhands: readonly string[],
  value: string,
): DeclarationMap | null {
  const tokens = splitTopLevelWhitespace(value);
  if (!tokens.length) return null;

  const defaults = tripleDefaults(shorthand);
  const result: DeclarationMap = {
    [longhands[0]!]: defaults[0],
    [longhands[1]!]: defaults[1],
    [longhands[2]!]: defaults[2],
  };
  const assigned = new Set<string>();

  for (const token of tokens) {
    const matches = longhands.filter((property) => !assigned.has(property) && matchProperty(property, token));
    if (matches.length !== 1) return null;
    result[matches[0]!] = token;
    assigned.add(matches[0]!);
  }
  return result;
}

function expandBorderAll(value: string): DeclarationMap | null {
  const top = expandTriple("border-top", SHORTHAND_DEFINITIONS["border-top"]!.longhands, value);
  if (!top) return null;
  const result: DeclarationMap = {};
  for (const side of ["top", "right", "bottom", "left"] as const) {
    result[`border-${side}-width`] = top["border-top-width"]!;
    result[`border-${side}-style`] = top["border-top-style"]!;
    result[`border-${side}-color`] = top["border-top-color"]!;
  }
  return result;
}

function expandLogicalBorderAxis(longhands: readonly string[], value: string): DeclarationMap | null {
  if (longhands.length !== 6) return null;
  const firstSide = expandTriple("border-top", longhands.slice(0, 3), value);
  if (!firstSide) return null;
  return {
    [longhands[0]!]: firstSide[longhands[0]!]!,
    [longhands[1]!]: firstSide[longhands[1]!]!,
    [longhands[2]!]: firstSide[longhands[2]!]!,
    [longhands[3]!]: firstSide[longhands[0]!]!,
    [longhands[4]!]: firstSide[longhands[1]!]!,
    [longhands[5]!]: firstSide[longhands[2]!]!,
  };
}

function expandTextDecoration(longhands: readonly string[], value: string): DeclarationMap | null {
  const tokens = splitTopLevelWhitespace(value);
  if (!tokens.length) return null;

  const result: DeclarationMap = {
    "text-decoration-line": "none",
    "text-decoration-style": "solid",
    "text-decoration-color": "currentcolor",
    "text-decoration-thickness": "auto",
  };
  const lineTokens: string[] = [];
  const assigned = new Set<string>();

  for (const token of tokens) {
    if (matchProperty("text-decoration-line", token)) {
      lineTokens.push(token);
      continue;
    }
    const candidates = longhands
      .filter((property) => property !== "text-decoration-line" && !assigned.has(property))
      .filter((property) => matchProperty(property, token));
    if (candidates.length !== 1) return null;
    result[candidates[0]!] = token;
    assigned.add(candidates[0]!);
  }

  if (lineTokens.length) {
    const joined = lineTokens.join(" ");
    if (!matchProperty("text-decoration-line", joined)) return null;
    result["text-decoration-line"] = joined;
  }
  return result;
}

function expandFlexFlow(value: string): DeclarationMap | null {
  const tokens = splitTopLevelWhitespace(value);
  if (tokens.length < 1 || tokens.length > 2) return null;
  const result: DeclarationMap = { "flex-direction": "row", "flex-wrap": "nowrap" };
  for (const token of tokens) {
    const direction = matchProperty("flex-direction", token);
    const wrap = matchProperty("flex-wrap", token);
    if (direction === wrap) return null;
    result[direction ? "flex-direction" : "flex-wrap"] = token;
  }
  return result;
}

function expandFlex(value: string): DeclarationMap | null {
  if (value === "none") {
    return { "flex-grow": "0", "flex-shrink": "0", "flex-basis": "auto" };
  }
  if (value === "auto") {
    return { "flex-grow": "1", "flex-shrink": "1", "flex-basis": "auto" };
  }

  const tokens = splitTopLevelWhitespace(value);
  if (tokens.length < 1 || tokens.length > 3) return null;

  const isNumber = (token: string) => matchProperty("flex-grow", token);
  const isBasis = (token: string) => matchProperty("flex-basis", token);

  if (tokens.length === 1) {
    const [first] = tokens;
    if (isNumber(first!)) {
      return { "flex-grow": first!, "flex-shrink": "1", "flex-basis": "0%" };
    }
    if (isBasis(first!)) {
      return { "flex-grow": "1", "flex-shrink": "1", "flex-basis": first! };
    }
    return null;
  }

  const [first, second, third] = tokens;
  if (!isNumber(first!)) return null;

  if (tokens.length === 2) {
    if (isNumber(second!)) {
      return { "flex-grow": first!, "flex-shrink": second!, "flex-basis": "0%" };
    }
    if (isBasis(second!)) {
      return { "flex-grow": first!, "flex-shrink": "1", "flex-basis": second! };
    }
    return null;
  }

  if (!isNumber(second!) || !isBasis(third!)) return null;
  return { "flex-grow": first!, "flex-shrink": second!, "flex-basis": third! };
}

function expandComponents(
  definition: ShorthandDefinition,
  value: string,
): DeclarationMap | null {
  if (!definition.initialValues || definition.initialValues.length !== definition.longhands.length) {
    return null;
  }

  const tokens = splitTopLevelWhitespace(value);
  if (!tokens.length) return null;

  const result = Object.fromEntries(
    definition.longhands.map((longhand, index) => [longhand, definition.initialValues![index]!]),
  ) as DeclarationMap;
  const assigned = new Set<string>();

  for (const token of tokens) {
    const candidates = definition.longhands
      .filter((longhand) => !assigned.has(longhand))
      .filter((longhand) => matchProperty(longhand, token));

    if (candidates.length === 1) {
      result[candidates[0]!] = token;
      assigned.add(candidates[0]!);
      continue;
    }

    // A single token such as `auto` can legitimately be the initial value of more
    // than one component (for example `columns: auto`). In that case assigning it to
    // every matching initial-valued component preserves the shorthand semantics.
    const initialMatches = candidates.filter((longhand) => {
      const index = definition.longhands.indexOf(longhand);
      return definition.initialValues?.[index] === token;
    });
    if (initialMatches.length === candidates.length && initialMatches.length > 1) {
      for (const longhand of initialMatches) {
        result[longhand] = token;
        assigned.add(longhand);
      }
      continue;
    }

    return null;
  }

  return result;
}

function expandSlashPair(
  definition: ShorthandDefinition,
  value: string,
): DeclarationMap | null {
  if (definition.longhands.length !== 2 || !definition.initialValues?.[1]) return null;
  const parts = splitTopLevelSlash(value);
  if (parts.length < 1 || parts.length > 2 || parts.some((part) => !part)) return null;

  const first = parts[0]!;
  const second = parts[1] ?? definition.initialValues[1]!;
  return {
    [definition.longhands[0]!]: first,
    [definition.longhands[1]!]: second,
  };
}

export function expandShorthand(
  property: string,
  value: string,
  options?: CssomOptions,
): DeclarationMap | null {
  const shorthand = normalizeProperty(property);
  const definition = SHORTHAND_DEFINITIONS[shorthand];
  if (!isShorthand(shorthand) || !definition) return null;
  const normalizedValue = value.trim();
  if (!normalizedValue) return null;

  if (GLOBAL_VALUES.has(normalizedValue)) {
    return Object.fromEntries(definition.longhands.map((longhand) => [longhand, normalizedValue]));
  }

  let expanded: DeclarationMap | null = null;
  switch (definition.strategy) {
    case "quad":
      expanded = expandQuad(definition.longhands, normalizedValue);
      break;
    case "pair":
      expanded = expandPair(definition.longhands, normalizedValue);
      break;
    case "triple":
      expanded = expandTriple(shorthand, definition.longhands, normalizedValue);
      break;
    case "border-all":
      expanded = expandBorderAll(normalizedValue);
      break;
    case "logical-border-axis":
      expanded = expandLogicalBorderAxis(definition.longhands, normalizedValue);
      break;
    case "text-decoration":
      expanded = expandTextDecoration(definition.longhands, normalizedValue);
      break;
    case "flex":
      expanded = expandFlex(normalizedValue);
      break;
    case "flex-flow":
      expanded = expandFlexFlow(normalizedValue);
      break;
    case "components":
      expanded = expandComponents(definition, normalizedValue);
      break;
    case "slash-pair":
      expanded = expandSlashPair(definition, normalizedValue);
      break;
    case "cssom":
      break;
  }

  return expanded ?? expandWithCssom(shorthand, normalizedValue, definition, options);
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
  shorthand: string,
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
      return concrete.join(" ");
    case "components":
      return concrete.join(" ");
    case "slash-pair":
      return collapseSlashPair(definition, concrete);
    case "text-decoration":
      return concrete.join(" ");
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
    case "cssom":
      return null;
  }
}

function collapseWithCssom(
  shorthand: string,
  definition: ShorthandDefinition,
  declarations: DeclarationMap,
  options?: CssomOptions,
): string | null {
  const style = mutableStyle(options);
  if (!style) return null;
  for (const longhand of definition.longhands) {
    const value = declarations[longhand];
    if (!value) return null;
    style.setProperty(longhand, value);
  }
  return style.getPropertyValue(shorthand).trim() || null;
}

function fillMissingInitialLonghands(
  definition: ShorthandDefinition,
  declarations: DeclarationMap,
  options?: CssomOptions,
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
  options?: CssomOptions,
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
  const value = collapsePure(property, definition, completed)
    ?? collapseWithCssom(property, definition, completed, options);
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
  options?: CssomOptions,
): CollapseResult[] {
  return Object.entries(SHORTHAND_DEFINITIONS)
    .sort(([, a], [, b]) => b.longhands.length - a.longhands.length)
    .map(([shorthand]) => collapseToShorthand(shorthand, declarations, options))
    .filter((result): result is CollapseResult => Boolean(result));
}

export function collapseLonghands(
  declarations: DeclarationMap,
  options?: CssomOptions,
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
