import type { ShorthandCollapser, ShorthandExpander, ShorthandModule } from "../types.js";

const longhands = ["flex-grow", "flex-shrink", "flex-basis"] as const;
const initialValues = ["0", "1", "auto"] as const;

const expand: ShorthandExpander = (value, context) => {
  if (value === "none") return { "flex-grow": "0", "flex-shrink": "0", "flex-basis": "auto" };
  if (value === "auto") return { "flex-grow": "1", "flex-shrink": "1", "flex-basis": "auto" };

  const tokens = context.splitWhitespace(value);
  if (tokens.length < 1 || tokens.length > 3) return null;
  const isNumber = (token: string) => context.matchProperty("flex-grow", token);
  const isBasis = (token: string) => context.matchProperty("flex-basis", token);

  if (tokens.length === 1) {
    const first = tokens[0]!;
    if (isNumber(first)) return { "flex-grow": first, "flex-shrink": "1", "flex-basis": "0%" };
    if (isBasis(first)) return { "flex-grow": "1", "flex-shrink": "1", "flex-basis": first };
    return null;
  }

  const [first, second, third] = tokens;
  if (!isNumber(first!)) return null;
  if (tokens.length === 2) {
    if (isNumber(second!)) return { "flex-grow": first!, "flex-shrink": second!, "flex-basis": "0%" };
    if (isBasis(second!)) return { "flex-grow": first!, "flex-shrink": "1", "flex-basis": second! };
    return null;
  }
  if (!isNumber(second!) || !isBasis(third!)) return null;
  return { "flex-grow": first!, "flex-shrink": second!, "flex-basis": third! };
};

const collapse: ShorthandCollapser = (declarations, context) => {
  const grow = declarations["flex-grow"]?.trim();
  const shrink = declarations["flex-shrink"]?.trim();
  const basis = declarations["flex-basis"]?.trim();
  if (!grow || !shrink || !basis) return null;
  if (grow === "0" && shrink === "0" && basis === "auto") return "none";
  if (grow === "1" && shrink === "1" && basis === "auto") return "auto";
  const candidate = `${grow} ${shrink} ${basis}`;
  return context.matchProperty("flex", candidate) ? candidate : null;
};

export default { longhands, initialValues, expand, collapse } satisfies ShorthandModule;
