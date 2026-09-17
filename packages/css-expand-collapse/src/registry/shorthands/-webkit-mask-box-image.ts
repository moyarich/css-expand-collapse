import type { DeclarationMap, ShorthandModule, ShorthandExpander } from "../types.js";

const longhands = [
  "-webkit-mask-box-image-source",
  "-webkit-mask-box-image-slice",
  "-webkit-mask-box-image-width",
  "-webkit-mask-box-image-outset",
  "-webkit-mask-box-image-repeat",
] as const;
const initialValues = ["none", "0 fill", "auto", "0", "stretch"] as const;

const expand: ShorthandExpander = (value, context) => {
  const parts = context.splitSlash(value);
  if (!parts.length || parts.length > 3 || parts.some((part) => !part)) return null;
  const result: DeclarationMap = Object.fromEntries(
    longhands.map((longhand, index) => [longhand, initialValues[index]!]),
  );
  const repeatTokens: string[] = [];

  const stripRepeat = (tokens: string[]) => tokens.filter((token) => {
    if (context.matchProperty(longhands[4], token)) {
      repeatTokens.push(token);
      return false;
    }
    return true;
  });

  const first = stripRepeat(context.splitWhitespace(parts[0]!));
  const sliceTokens: string[] = [];
  for (const token of first) {
    if (result[longhands[0]] === initialValues[0] && context.matchProperty(longhands[0], token)) {
      result[longhands[0]] = token;
    } else {
      sliceTokens.push(token);
    }
  }

  if (sliceTokens.length) {
    let slice = sliceTokens.join(" ");
    if (!/\bfill\b/.test(slice)) slice += " fill";
    if (!context.matchProperty(longhands[1], slice)) return null;
    result[longhands[1]] = slice;
  }

  if (parts[1]) {
    const tokens = stripRepeat(context.splitWhitespace(parts[1]));
    if (tokens.length) {
      const width = tokens.join(" ");
      if (!context.matchProperty(longhands[2], width)) return null;
      result[longhands[2]] = width;
    }
  }

  if (parts[2]) {
    const tokens = stripRepeat(context.splitWhitespace(parts[2]));
    if (tokens.length) {
      const outset = tokens.join(" ");
      if (!context.matchProperty(longhands[3], outset)) return null;
      result[longhands[3]] = outset;
    }
  }

  if (repeatTokens.length) {
    const repeat = repeatTokens.join(" ");
    if (!context.matchProperty(longhands[4], repeat)) return null;
    result[longhands[4]] = repeat;
  }

  return result;
};

export default {
  longhands,
  safeToDropWhenFullyShadowed: false,
  initialValues,
  expand,
  collapse(declarations, context) {
    const values = longhands.map((longhand) => declarations[longhand]);
    if (values.some((value) => !value)) return null;
    const candidate = `${values[0]} ${values[1]} / ${values[2]} / ${values[3]} ${values[4]}`;
    return context.matchProperty("-webkit-mask-box-image", candidate) ? candidate : null;
  },
} satisfies ShorthandModule;
