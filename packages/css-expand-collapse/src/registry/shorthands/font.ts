import type { DeclarationMap, ShorthandModule, ShorthandExpander } from "../types.js";

const longhands = [
  "font-family",
  "font-size",
  "font-width",
  "font-style",
  "font-variant",
  "font-weight",
  "line-height",
] as const;

const SYSTEM_FONTS = new Set(["caption", "icon", "menu", "message-box", "small-caption", "status-bar"]);

const initialValues = [null, "medium", "normal", "normal", "normal", "normal", "normal"] as const;
const expand: ShorthandExpander = (value, context) => {
  if (SYSTEM_FONTS.has(value)) return null;
  if (!context.matchProperty("font", value)) return null;

  const slash = context.splitSlash(value);
  if (slash.length > 2 || slash.some((part) => !part)) return null;
  const left = context.splitWhitespace(slash[0]!);
  if (!left.length) return null;

  let sizeIndex = -1;
  for (let index = 0; index < left.length; index += 1) {
    if (context.matchProperty("font-size", left[index]!)) {
      sizeIndex = index;
      break;
    }
  }
  if (sizeIndex === -1) return null;

  const result: DeclarationMap = {
    "font-family": "",
    "font-size": left[sizeIndex]!,
    "font-width": "normal",
    "font-style": "normal",
    "font-variant": "normal",
    "font-weight": "normal",
    "line-height": "normal",
  };

  const prefix = left.slice(0, sizeIndex);
  const assigned = new Set<string>();
  const priority = ["font-style", "font-variant", "font-weight", "font-width"] as const;
  for (const token of prefix) {
    if (token === "normal") continue;
    const property = priority.find(
      (candidate) => !assigned.has(candidate) && context.matchProperty(candidate, token),
    );
    if (!property) return null;
    result[property] = token;
    assigned.add(property);
  }

  let family = "";
  if (slash[1]) {
    const right = context.splitWhitespace(slash[1]);
    let matched = false;
    for (let split = 1; split < right.length; split += 1) {
      const lineHeight = right.slice(0, split).join(" ");
      const candidateFamily = right.slice(split).join(" ");
      if (
        context.matchProperty("line-height", lineHeight) &&
        context.matchProperty("font-family", candidateFamily)
      ) {
        result["line-height"] = lineHeight;
        family = candidateFamily;
        matched = true;
        break;
      }
    }
    if (!matched) return null;
  } else {
    family = left.slice(sizeIndex + 1).join(" ");
    if (!family || !context.matchProperty("font-family", family)) return null;
  }

  result["font-family"] = family;
  return result;
};

export default {
  longhands,
  initialValues,
  safeToDropWhenFullyShadowed: false,
  expand,
  collapse(declarations, context) {
    const family = declarations["font-family"];
    const size = declarations["font-size"];
    const width = declarations["font-width"];
    const style = declarations["font-style"];
    const variant = declarations["font-variant"];
    const weight = declarations["font-weight"];
    const lineHeight = declarations["line-height"];
    if (!family || !size || !width || !style || !variant || !weight || !lineHeight) return null;

    const prefix = [style, variant, weight, width].filter((value) => value !== "normal").join(" ");
    const candidate = `${prefix ? `${prefix} ` : ""}${size}/${lineHeight} ${family}`;
    return context.matchProperty("font", candidate) ? candidate : null;
  },
} satisfies ShorthandModule;
