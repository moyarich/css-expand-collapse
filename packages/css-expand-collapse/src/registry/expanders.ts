import type {
  DeclarationMap,
  ShorthandExpander,
} from "./types.js";


export function splitTopLevel(value: string, separator: string): string[] {
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

    if (char === separator && parenDepth === 0 && bracketDepth === 0) {
      push();
    } else {
      current += char;
    }
  }

  push();
  return parts;
}

export const splitTopLevelComma = (value: string): string[] => splitTopLevel(value, ",");

export function expandOrderedPair(
  longhands: readonly [string, string],
  initialValues: readonly [string, string],
): ShorthandExpander {
  return (value, context) => {
    const tokens = context.splitWhitespace(value);
    if (!tokens.length) return null;

    for (let split = 1; split < tokens.length; split += 1) {
      const first = tokens.slice(0, split).join(" ");
      const second = tokens.slice(split).join(" ");
      if (
        context.matchProperty(longhands[0], first) &&
        context.matchProperty(longhands[1], second)
      ) {
        return { [longhands[0]]: first, [longhands[1]]: second };
      }
    }

    if (context.matchProperty(longhands[0], value)) {
      return { [longhands[0]]: value, [longhands[1]]: initialValues[1] };
    }

    return null;
  };
}

export interface CsstreeComponentOptions {
  initialValues: readonly string[];
  /** Matching order used to resolve grammatically ambiguous tokens. */
  priority?: readonly string[];
  /** Parse comma-separated layers and join each longhand with the same layer count. */
  layered?: boolean;
}

export function expandCsstreeComponents(
  longhands: readonly string[],
  options: CsstreeComponentOptions,
): ShorthandExpander {
  const priority = options.priority ?? longhands;

  return (value, context) => {
    if (options.initialValues.length !== longhands.length) return null;
    const layers = options.layered ? splitTopLevelComma(value) : [value];
    if (!layers.length || layers.some((layer) => !layer)) return null;

    const expandedLayers: DeclarationMap[] = [];

    for (const layer of layers) {
      const tokens = context.splitWhitespace(layer);
      if (!tokens.length) return null;

      const result = Object.fromEntries(
        longhands.map((longhand, index) => [longhand, options.initialValues[index]!]),
      ) as DeclarationMap;
      const assigned = new Set<string>();

      for (const token of tokens) {
        const candidates = priority.filter(
          (property) =>
            longhands.includes(property) &&
            !assigned.has(property) &&
            context.matchProperty(property, token),
        );
        if (!candidates.length) return null;

        const property = candidates[0]!;
        result[property] = token;
        assigned.add(property);
      }

      expandedLayers.push(result);
    }

    return Object.fromEntries(
      longhands.map((longhand) => [
        longhand,
        expandedLayers.map((layer) => layer[longhand]!).join(", "),
      ]),
    );
  };
}

export function expandQuad(longhands: readonly string[]): ShorthandExpander {
  return (value, context) => {
    const tokens = context.splitWhitespace(value);
    if (tokens.includes("/") || tokens.length < 1 || tokens.length > 4) return null;
    const [a, b = a, c = a, d = b] = tokens;
    const values = tokens.length === 3 ? [a, b, c, b] : [a, b, c, d];
    return Object.fromEntries(
      longhands.map((property, index) => [property, values[index]!]),
    ) as DeclarationMap;
  };
}

export function expandPair(longhands: readonly string[]): ShorthandExpander {
  return (value, context) => {
    const tokens = context.splitWhitespace(value);
    if (tokens.length < 1 || tokens.length > 2) return null;
    const [first, second = first] = tokens;
    return { [longhands[0]!]: first!, [longhands[1]!]: second! };
  };
}

export function expandTriple(
  longhands: readonly string[],
  defaults: readonly [string, string, string] = ["medium", "none", "currentcolor"],
): ShorthandExpander {
  return (value, context) => {
    const tokens = context.splitWhitespace(value);
    if (!tokens.length) return null;

    const result: DeclarationMap = {
      [longhands[0]!]: defaults[0],
      [longhands[1]!]: defaults[1],
      [longhands[2]!]: defaults[2],
    };
    const assigned = new Set<string>();

    for (const token of tokens) {
      const matches = longhands.filter(
        (property) => !assigned.has(property) && context.matchProperty(property, token),
      );
      if (matches.length !== 1) return null;
      result[matches[0]!] = token;
      assigned.add(matches[0]!);
    }

    return result;
  };
}

export function expandLogicalBorderAxis(longhands: readonly string[]): ShorthandExpander {
  const expandSide = expandTriple(longhands.slice(0, 3));

  return (value, context) => {
    if (longhands.length !== 6) return null;
    const firstSide = expandSide(value, context);
    if (!firstSide) return null;

    return {
      [longhands[0]!]: firstSide[longhands[0]!]!,
      [longhands[1]!]: firstSide[longhands[1]!]!,
      [longhands[2]!]: firstSide[longhands[2]!]!,
      [longhands[3]!]: firstSide[longhands[0]!]!,
      [longhands[4]!]: firstSide[longhands[1]!]!,
      [longhands[5]!]: firstSide[longhands[2]!]!,
    };
  };
}

export function expandComponents(
  longhands: readonly string[],
  initialValues: readonly string[],
): ShorthandExpander {
  return (value, context) => {
    const tokens = context.splitWhitespace(value);
    if (!tokens.length || initialValues.length !== longhands.length) return null;

    const result = Object.fromEntries(
      longhands.map((longhand, index) => [longhand, initialValues[index]!]),
    ) as DeclarationMap;
    const assigned = new Set<string>();

    for (const token of tokens) {
      const candidates = longhands
        .filter((longhand) => !assigned.has(longhand))
        .filter((longhand) => context.matchProperty(longhand, token));

      if (candidates.length === 1) {
        result[candidates[0]!] = token;
        assigned.add(candidates[0]!);
        continue;
      }

      const initialMatches = candidates.filter((longhand) => {
        const index = longhands.indexOf(longhand);
        return initialValues[index] === token;
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
  };
}

export function expandSlashPair(
  longhands: readonly [string, string],
  initialValues: readonly [string, string],
): ShorthandExpander {
  return (value, context) => {
    const parts = context.splitSlash(value);
    if (parts.length < 1 || parts.length > 2 || parts.some((part) => !part)) return null;

    return {
      [longhands[0]]: parts[0]!,
      [longhands[1]]: parts[1] ?? initialValues[1],
    };
  };
}
