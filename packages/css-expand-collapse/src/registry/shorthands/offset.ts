import type { DeclarationMap, ShorthandModule, ShorthandExpander } from "../types.js";

const longhands = [
  "offset-anchor",
  "offset-distance",
  "offset-path",
  "offset-position",
  "offset-rotate",
] as const;
const initialValues = ["auto", "0", "none", "normal", "auto"] as const;

function parseTail(tokens: string[], context: Parameters<ShorthandExpander>[1], result: DeclarationMap): boolean {
  if (!tokens.length) return true;
  const whole = tokens.join(" ");
  if (context.matchProperty("offset-rotate", whole)) {
    result["offset-rotate"] = whole;
    return true;
  }
  if (context.matchProperty("offset-distance", whole)) {
    result["offset-distance"] = whole;
    return true;
  }

  for (let split = 1; split < tokens.length; split += 1) {
    const left = tokens.slice(0, split).join(" ");
    const right = tokens.slice(split).join(" ");
    if (context.matchProperty("offset-distance", left) && context.matchProperty("offset-rotate", right)) {
      result["offset-distance"] = left;
      result["offset-rotate"] = right;
      return true;
    }
    if (context.matchProperty("offset-rotate", left) && context.matchProperty("offset-distance", right)) {
      result["offset-rotate"] = left;
      result["offset-distance"] = right;
      return true;
    }
  }
  return false;
}

const expand: ShorthandExpander = (value, context) => {
  if (!context.matchProperty("offset", value)) return null;
  const slash = context.splitSlash(value);
  if (slash.length > 2 || slash.some((part) => !part)) return null;

  const result: DeclarationMap = Object.fromEntries(
    longhands.map((longhand, index) => [longhand, initialValues[index]!]),
  );

  if (slash[1]) {
    if (!context.matchProperty("offset-anchor", slash[1])) return null;
    result["offset-anchor"] = slash[1];
  }

  const tokens = context.splitWhitespace(slash[0]!);
  if (!tokens.length) return null;

  let pathIndex = -1;
  for (let index = 0; index < tokens.length; index += 1) {
    if (context.matchProperty("offset-path", tokens[index]!)) {
      pathIndex = index;
      break;
    }
  }

  if (pathIndex === -1) {
    const position = tokens.join(" ");
    if (!context.matchProperty("offset-position", position)) return null;
    result["offset-position"] = position;
    return result;
  }

  result["offset-path"] = tokens[pathIndex]!;
  const positionTokens = tokens.slice(0, pathIndex);
  if (positionTokens.length) {
    const position = positionTokens.join(" ");
    if (!context.matchProperty("offset-position", position)) return null;
    result["offset-position"] = position;
  }

  if (!parseTail(tokens.slice(pathIndex + 1), context, result)) return null;
  return result;
};

export default {
  longhands,
  safeToDropWhenFullyShadowed: false,
  initialValues,
  expand,
  collapse(declarations, context) {
    const anchor = declarations["offset-anchor"];
    const distance = declarations["offset-distance"];
    const path = declarations["offset-path"];
    const position = declarations["offset-position"];
    const rotate = declarations["offset-rotate"];
    if (!anchor || !distance || !path || !position || !rotate) return null;
    const candidate = `${position} ${path} ${distance} ${rotate} / ${anchor}`;
    return context.matchProperty("offset", candidate) ? candidate : null;
  },
} satisfies ShorthandModule;
