import type { DeclarationMap, ShorthandDefinition, ShorthandExpander } from "../types.js";

const longhands = [
  "border-image-source",
  "border-image-slice",
  "border-image-width",
  "border-image-outset",
  "border-image-repeat",
] as const;
const initialValues = ["none", "100%", "1", "0", "stretch"] as const;

const expand: ShorthandExpander = (value, context) => {
  if (!context.matchProperty("border-image", value)) return null;
  const parts = context.splitSlash(value);
  if (!parts.length || parts.length > 3 || parts.some((part) => !part)) return null;

  const result: DeclarationMap = Object.fromEntries(
    longhands.map((longhand, index) => [longhand, initialValues[index]!]),
  );
  const repeatTokens: string[] = [];

  const stripRepeat = (tokens: string[]) => tokens.filter((token) => {
    if (context.matchProperty("border-image-repeat", token)) {
      repeatTokens.push(token);
      return false;
    }
    return true;
  });

  const first = stripRepeat(context.splitWhitespace(parts[0]!));
  const sliceTokens: string[] = [];
  for (const token of first) {
    if (result["border-image-source"] === initialValues[0] && context.matchProperty("border-image-source", token)) {
      result["border-image-source"] = token;
    } else {
      sliceTokens.push(token);
    }
  }
  if (sliceTokens.length) {
    const slice = sliceTokens.join(" ");
    if (!context.matchProperty("border-image-slice", slice)) return null;
    result["border-image-slice"] = slice;
  }

  if (parts[1]) {
    const widthTokens = stripRepeat(context.splitWhitespace(parts[1]));
    if (widthTokens.length) {
      const width = widthTokens.join(" ");
      if (!context.matchProperty("border-image-width", width)) return null;
      result["border-image-width"] = width;
    }
  }

  if (parts[2]) {
    const outsetTokens = stripRepeat(context.splitWhitespace(parts[2]));
    if (outsetTokens.length) {
      const outset = outsetTokens.join(" ");
      if (!context.matchProperty("border-image-outset", outset)) return null;
      result["border-image-outset"] = outset;
    }
  }

  if (repeatTokens.length) {
    const repeat = repeatTokens.join(" ");
    if (!context.matchProperty("border-image-repeat", repeat)) return null;
    result["border-image-repeat"] = repeat;
  }

  return result;
};

export default {
  longhands,
  strategy: "csstree",
  initialValues,
  expand,
  collapse(declarations, context) {
    const values = longhands.map((longhand) => declarations[longhand]);
    if (values.some((value) => !value)) return null;
    const candidate = `${values[0]} ${values[1]} / ${values[2]} / ${values[3]} ${values[4]}`;
    return context.matchProperty("border-image", candidate) ? candidate : null;
  },
} satisfies ShorthandDefinition;
