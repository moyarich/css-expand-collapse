import type { DeclarationMap, ShorthandDefinition, ShorthandExpander } from "../types.js";

const longhands = [
  "mask-border-mode",
  "mask-border-outset",
  "mask-border-repeat",
  "mask-border-slice",
  "mask-border-source",
  "mask-border-width",
] as const;
const initialValues = ["alpha", "0", "stretch", "0", "none", "auto"] as const;

const expand: ShorthandExpander = (value, context) => {
  if (!context.matchProperty("mask-border", value)) return null;
  const parts = context.splitSlash(value);
  if (!parts.length || parts.length > 3 || parts.some((part) => !part)) return null;

  const result: DeclarationMap = Object.fromEntries(
    longhands.map((longhand, index) => [longhand, initialValues[index]!]),
  );
  const repeatTokens: string[] = [];
  let modeAssigned = false;

  const stripMetadata = (tokens: string[]) => tokens.filter((token) => {
    if (context.matchProperty("mask-border-repeat", token)) {
      repeatTokens.push(token);
      return false;
    }
    if (!modeAssigned && context.matchProperty("mask-border-mode", token)) {
      result["mask-border-mode"] = token;
      modeAssigned = true;
      return false;
    }
    return true;
  });

  const first = stripMetadata(context.splitWhitespace(parts[0]!));
  const sliceTokens: string[] = [];
  for (const token of first) {
    if (result["mask-border-source"] === initialValues[4] && context.matchProperty("mask-border-source", token)) {
      result["mask-border-source"] = token;
    } else {
      sliceTokens.push(token);
    }
  }
  if (sliceTokens.length) {
    const slice = sliceTokens.join(" ");
    if (!context.matchProperty("mask-border-slice", slice)) return null;
    result["mask-border-slice"] = slice;
  }

  if (parts[1]) {
    const widthTokens = stripMetadata(context.splitWhitespace(parts[1]));
    if (widthTokens.length) {
      const width = widthTokens.join(" ");
      if (!context.matchProperty("mask-border-width", width)) return null;
      result["mask-border-width"] = width;
    }
  }

  if (parts[2]) {
    const outsetTokens = stripMetadata(context.splitWhitespace(parts[2]));
    if (outsetTokens.length) {
      const outset = outsetTokens.join(" ");
      if (!context.matchProperty("mask-border-outset", outset)) return null;
      result["mask-border-outset"] = outset;
    }
  }

  if (repeatTokens.length) {
    const repeat = repeatTokens.join(" ");
    if (!context.matchProperty("mask-border-repeat", repeat)) return null;
    result["mask-border-repeat"] = repeat;
  }

  return result;
};

export default {
  longhands,
  strategy: "csstree",
  initialValues,
  expand,
  collapse(declarations, context) {
    const mode = declarations["mask-border-mode"];
    const outset = declarations["mask-border-outset"];
    const repeat = declarations["mask-border-repeat"];
    const slice = declarations["mask-border-slice"];
    const source = declarations["mask-border-source"];
    const width = declarations["mask-border-width"];
    if (!mode || !outset || !repeat || !slice || !source || !width) return null;
    const candidate = `${source} ${slice} / ${width} / ${outset} ${repeat} ${mode}`;
    return context.matchProperty("mask-border", candidate) ? candidate : null;
  },
} satisfies ShorthandDefinition;
