import {
  longhandInitialValues,
  longhandNames,
} from "./helpers.js";
import type {
  DeclarationMap,
  LonghandMap,
  ShorthandExpandContext,
  ShorthandExpander,
} from "./types.js";

function validDeclarations(
  declarations: DeclarationMap,
  context: ShorthandExpandContext,
): boolean {
  return Object.entries(declarations).every(([property, value]) =>
    context.matchProperty(property, value),
  );
}

export function expandQuad(longhands: LonghandMap): ShorthandExpander {
  const properties = longhandNames(longhands);
  return (value, context) => {
    const tokens = context.splitWhitespace(value);
    if (tokens.includes("/") || tokens.length < 1 || tokens.length > 4 || properties.length !== 4) return null;
    const [a, b = a, c = a, d = b] = tokens;
    const values = tokens.length === 3 ? [a, b, c, b] : [a, b, c, d];
    const result = Object.fromEntries(
      properties.map((property, index) => [property, values[index]!]),
    ) as DeclarationMap;
    return validDeclarations(result, context) ? result : null;
  };
}

export function expandPair(longhands: LonghandMap): ShorthandExpander {
  const properties = longhandNames(longhands);
  return (value, context) => {
    const tokens = context.splitWhitespace(value);
    if (tokens.length < 1 || tokens.length > 2 || properties.length !== 2) return null;
    const [first, second = first] = tokens;
    const result: DeclarationMap = {
      [properties[0]!]: first!,
      [properties[1]!]: second!,
    };
    return validDeclarations(result, context) ? result : null;
  };
}

export function expandTriple(longhands: LonghandMap): ShorthandExpander {
  const properties = longhandNames(longhands);
  const defaults = longhandInitialValues(longhands);

  return (value, context) => {
    const tokens = context.splitWhitespace(value);
    if (!tokens.length || properties.length !== 3) return null;

    const result: DeclarationMap = {
      [properties[0]!]: defaults[0]!,
      [properties[1]!]: defaults[1]!,
      [properties[2]!]: defaults[2]!,
    };
    const assigned = new Set<string>();

    for (const token of tokens) {
      const matches = properties.filter(
        (property) => !assigned.has(property) && context.matchProperty(property, token),
      );
      if (matches.length !== 1) return null;
      result[matches[0]!] = token;
      assigned.add(matches[0]!);
    }

    return result;
  };
}

export function expandComponents(longhands: LonghandMap): ShorthandExpander {
  const properties = longhandNames(longhands);
  const defaults = longhandInitialValues(longhands);

  return (value, context) => {
    const tokens = context.splitWhitespace(value);
    if (!tokens.length) return null;

    const result = Object.fromEntries(
      properties.map((longhand, index) => [longhand, defaults[index]!]),
    ) as DeclarationMap;
    const assigned = new Set<string>();

    for (const token of tokens) {
      const candidates = properties
        .filter((longhand) => !assigned.has(longhand))
        .filter((longhand) => context.matchProperty(longhand, token));

      if (candidates.length === 1) {
        result[candidates[0]!] = token;
        assigned.add(candidates[0]!);
        continue;
      }

      const initialMatches = candidates.filter((longhand) => longhands.get(longhand) === token);

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
  };
}

export function expandSlashPair(longhands: LonghandMap): ShorthandExpander {
  const properties = longhandNames(longhands);
  const defaults = longhandInitialValues(longhands);

  return (value, context) => {
    const parts = context.splitSlash(value);
    if (properties.length !== 2 || parts.length < 1 || parts.length > 2 || parts.some((part) => !part)) return null;

    const result: DeclarationMap = {
      [properties[0]!]: parts[0]!,
      [properties[1]!]: parts[1] ?? defaults[1]!,
    };
    return validDeclarations(result, context) ? result : null;
  };
}
