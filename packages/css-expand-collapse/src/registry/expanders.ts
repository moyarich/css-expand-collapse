import { splitTopLevelComma } from "./context.js";
import {
  longhandInitialValues,
  longhandNames,
  sliceLonghands,
} from "./helpers.js";
import type {
  DeclarationMap,
  LonghandMap,
  ShorthandExpander,
} from "./types.js";

export function expandOrderedPair(longhands: LonghandMap): ShorthandExpander {
  const properties = longhandNames(longhands);
  const defaults = longhandInitialValues(longhands);

  return (value, context) => {
    if (properties.length !== 2) return null;
    const tokens = context.splitWhitespace(value);
    if (!tokens.length) return null;

    for (let split = 1; split < tokens.length; split += 1) {
      const first = tokens.slice(0, split).join(" ");
      const second = tokens.slice(split).join(" ");
      if (
        context.matchProperty(properties[0]!, first) &&
        context.matchProperty(properties[1]!, second)
      ) {
        return { [properties[0]!]: first, [properties[1]!]: second };
      }
    }

    if (context.matchProperty(properties[0]!, value)) {
      return { [properties[0]!]: value, [properties[1]!]: defaults[1]! };
    }

    return null;
  };
}

export interface CsstreeComponentOptions {
  /** Matching order used to resolve grammatically ambiguous tokens. */
  priority?: readonly string[];
  /** Parse comma-separated layers and join each longhand with the same layer count. */
  layered?: boolean;
}

export function expandCsstreeComponents(
  longhands: LonghandMap,
  options: CsstreeComponentOptions = {},
): ShorthandExpander {
  const properties = longhandNames(longhands);
  const defaults = longhandInitialValues(longhands);
  const priority = options.priority ?? properties;

  return (value, context) => {
    const layers = options.layered ? splitTopLevelComma(value) : [value];
    if (!layers.length || layers.some((layer) => !layer)) return null;

    const expandedLayers: DeclarationMap[] = [];

    for (const layer of layers) {
      const tokens = context.splitWhitespace(layer);
      if (!tokens.length) return null;

      const result = Object.fromEntries(
        properties.map((longhand, index) => [longhand, defaults[index]!]),
      ) as DeclarationMap;
      const assigned = new Set<string>();

      for (const token of tokens) {
        const candidates = priority.filter(
          (property) =>
            properties.includes(property) &&
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
      properties.map((longhand) => [
        longhand,
        expandedLayers.map((layer) => layer[longhand]!).join(", "),
      ]),
    );
  };
}

export function expandQuad(longhands: LonghandMap): ShorthandExpander {
  const properties = longhandNames(longhands);
  return (value, context) => {
    const tokens = context.splitWhitespace(value);
    if (tokens.includes("/") || tokens.length < 1 || tokens.length > 4 || properties.length !== 4) return null;
    const [a, b = a, c = a, d = b] = tokens;
    const values = tokens.length === 3 ? [a, b, c, b] : [a, b, c, d];
    return Object.fromEntries(
      properties.map((property, index) => [property, values[index]!]),
    ) as DeclarationMap;
  };
}

export function expandPair(longhands: LonghandMap): ShorthandExpander {
  const properties = longhandNames(longhands);
  return (value, context) => {
    const tokens = context.splitWhitespace(value);
    if (tokens.length < 1 || tokens.length > 2 || properties.length !== 2) return null;
    const [first, second = first] = tokens;
    return { [properties[0]!]: first!, [properties[1]!]: second! };
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

export function expandLogicalBorderAxis(longhands: LonghandMap): ShorthandExpander {
  const properties = longhandNames(longhands);
  const expandSide = expandTriple(sliceLonghands(longhands, 0, 3));

  return (value, context) => {
    if (properties.length !== 6) return null;
    const firstSide = expandSide(value, context);
    if (!firstSide) return null;

    return {
      [properties[0]!]: firstSide[properties[0]!]!,
      [properties[1]!]: firstSide[properties[1]!]!,
      [properties[2]!]: firstSide[properties[2]!]!,
      [properties[3]!]: firstSide[properties[0]!]!,
      [properties[4]!]: firstSide[properties[1]!]!,
      [properties[5]!]: firstSide[properties[2]!]!,
    };
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

    return {
      [properties[0]!]: parts[0]!,
      [properties[1]!]: parts[1] ?? defaults[1]!,
    };
  };
}
