import { splitTopLevelComma, splitTopLevelWhitespace } from "../../context.js";
import type { ShorthandModule } from "../../module.js";
import { hasCustomPropertyReference } from "../../../custom-properties.js";

const x = "background-position-x";
const y = "background-position-y";
const horizontal = new Set(["left", "right"]);
const vertical = new Set(["top", "bottom"]);
const keyword = (value: string) => value.toLowerCase();
const isOffset = (value: string) =>
  !horizontal.has(keyword(value)) &&
  !vertical.has(keyword(value)) &&
  keyword(value) !== "center";

function axes(layer: string): [string, string] | null {
  const tokens = splitTopLevelWhitespace(layer);
  const [a, b] = tokens;
  if (!a) return null;
  if (tokens.length === 1) {
    return vertical.has(keyword(a)) ? ["center", a] : [a, "center"];
  }
  if (tokens.length === 2 && b) {
    return vertical.has(keyword(a)) || horizontal.has(keyword(b))
      ? [b, a]
      : [a, b];
  }
  if (tokens.length < 3 || tokens.length > 4) return null;
  let horizontalValue: string | undefined;
  let verticalValue: string | undefined;
  let centers = 0;
  for (let i = 0; i < tokens.length; i++) {
    const side = tokens[i]!;
    const next = tokens[i + 1];
    if (keyword(side) === "center") {
      centers++;
      continue;
    }
    const isX = horizontal.has(keyword(side));
    if (!isX && !vertical.has(keyword(side))) return null;
    const value = next && isOffset(next) ? side + " " + next : side;
    if (value !== side) i++;
    if (isX) {
      if (horizontalValue) return null;
      horizontalValue = value;
    } else {
      if (verticalValue) return null;
      verticalValue = value;
    }
  }
  if (centers === 1) {
    if (!horizontalValue) horizontalValue = "center";
    else if (!verticalValue) verticalValue = "center";
    else return null;
  } else if (centers) return null;
  return horizontalValue && verticalValue
    ? [horizontalValue, verticalValue]
    : null;
}

function normalizeAxis(value: string, start: string, end: string): string {
  const [first, offset] = splitTopLevelWhitespace(value);
  if (!first) return value;
  if (keyword(first) === start) return offset ?? "0%";
  if (keyword(first) === end) return offset ? `calc(100% - (${offset}))` : "100%";
  if (keyword(first) === "center") return "50%";
  return value;
}

export default {
  longhands: new Map([[x, "0%"], [y, "0%"]]),
  expand(value, context) {
    if (hasCustomPropertyReference(value) || !context.matchProperty("background-position", value))
      return null;
    const layers = splitTopLevelComma(value).map(axes);
    if (layers.some((layer) => !layer)) return null;
    const pairs = layers as [string, string][];
    const declarations = {
      [x]: pairs.map((pair) => pair[0]).join(", "),
      [y]: pairs.map((pair) => pair[1]).join(", "),
    };
    return context.matchProperty(x, declarations[x]) &&
      context.matchProperty(y, declarations[y])
      ? declarations
      : null;
  },
  collapse(declarations, context) {
    if (!declarations[x] || !declarations[y]) return null;
    if (hasCustomPropertyReference(declarations[x]) || hasCustomPropertyReference(declarations[y]))
      return null;
    const xs = splitTopLevelComma(declarations[x]);
    const ys = splitTopLevelComma(declarations[y]);
    if (xs.length !== ys.length) return null;
    const value = xs.map((a, i) =>
      normalizeAxis(a, "left", "right") + " " + normalizeAxis(ys[i]!, "top", "bottom"),
    ).join(", ");
    return context.matchProperty("background-position", value) ? value : null;
  },
} satisfies ShorthandModule;
