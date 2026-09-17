import { splitTopLevelComma } from "../expanders.js";
import type { DeclarationMap, ShorthandModule, ShorthandExpander } from "../types.js";

const longhands = [
  "background-image",
  "background-position",
  "background-size",
  "background-repeat",
  "background-origin",
  "background-clip",
  "background-attachment",
  "background-color",
] as const;
const initialValues = [
  "none",
  "0% 0%",
  "auto auto",
  "repeat",
  "padding-box",
  "border-box",
  "scroll",
  "transparent",
] as const;

function parseLayer(
  layer: string,
  finalLayer: boolean,
  context: Parameters<ShorthandExpander>[1],
): DeclarationMap | null {
  const slash = context.splitSlash(layer);
  if (slash.length > 2 || slash.some((part) => !part)) return null;

  const result: DeclarationMap = Object.fromEntries(
    longhands.map((longhand, index) => [longhand, initialValues[index]!]),
  );

  let before = context.splitWhitespace(slash[0]!);
  let after = slash[1] ? context.splitWhitespace(slash[1]) : [];

  if (after.length) {
    let matchedSize = "";
    let consumed = 0;
    for (let end = after.length; end >= 1; end -= 1) {
      const candidate = after.slice(0, end).join(" ");
      if (context.matchProperty("background-size", candidate)) {
        matchedSize = candidate;
        consumed = end;
        break;
      }
    }
    if (!matchedSize) return null;
    result["background-size"] = matchedSize;
    after = after.slice(consumed);
  }

  const tokens = [...before, ...after];
  const positionTokens: string[] = [];
  const repeatTokens: string[] = [];
  const boxes: string[] = [];
  let imageAssigned = false;
  let attachmentAssigned = false;
  let colorAssigned = false;

  for (const token of tokens) {
    if (!imageAssigned && context.matchProperty("background-image", token)) {
      result["background-image"] = token;
      imageAssigned = true;
      continue;
    }
    if (!attachmentAssigned && context.matchProperty("background-attachment", token)) {
      result["background-attachment"] = token;
      attachmentAssigned = true;
      continue;
    }
    if (context.matchProperty("background-repeat", token)) {
      repeatTokens.push(token);
      continue;
    }
    if (context.matchProperty("background-origin", token)) {
      boxes.push(token);
      continue;
    }
    if (finalLayer && !colorAssigned && context.matchProperty("background-color", token)) {
      result["background-color"] = token;
      colorAssigned = true;
      continue;
    }
    positionTokens.push(token);
  }

  if (repeatTokens.length) {
    const repeat = repeatTokens.join(" ");
    if (!context.matchProperty("background-repeat", repeat)) return null;
    result["background-repeat"] = repeat;
  }

  if (boxes.length > 2) return null;
  if (boxes.length === 1) {
    result["background-origin"] = boxes[0]!;
    result["background-clip"] = boxes[0]!;
  } else if (boxes.length === 2) {
    result["background-origin"] = boxes[0]!;
    result["background-clip"] = boxes[1]!;
  }

  if (positionTokens.length) {
    const position = positionTokens.join(" ");
    if (!context.matchProperty("background-position", position)) return null;
    result["background-position"] = position;
  }

  return result;
}

const expand: ShorthandExpander = (value, context) => {
  if (!context.matchProperty("background", value)) return null;
  const layers = splitTopLevelComma(value);
  if (!layers.length || layers.some((layer) => !layer)) return null;

  const parsed = layers.map((layer, index) => parseLayer(layer, index === layers.length - 1, context));
  if (parsed.some((layer) => !layer)) return null;
  const concrete = parsed as DeclarationMap[];

  return {
    "background-image": concrete.map((layer) => layer["background-image"]).join(", "),
    "background-position": concrete.map((layer) => layer["background-position"]).join(", "),
    "background-size": concrete.map((layer) => layer["background-size"]).join(", "),
    "background-repeat": concrete.map((layer) => layer["background-repeat"]).join(", "),
    "background-origin": concrete.map((layer) => layer["background-origin"]).join(", "),
    "background-clip": concrete.map((layer) => layer["background-clip"]).join(", "),
    "background-attachment": concrete.map((layer) => layer["background-attachment"]).join(", "),
    "background-color": concrete.at(-1)!["background-color"]!,
  };
};

export default {
  longhands,
  strategy: "csstree",
  initialValues,
  expand,
  collapse(declarations, context) {
    const layered = longhands.slice(0, 7).map((longhand) => splitTopLevelComma(declarations[longhand] ?? ""));
    const count = layered[0]?.length ?? 0;
    if (!count || layered.some((values) => values.length !== count)) return null;
    const color = declarations["background-color"];
    if (!color) return null;

    const candidate = Array.from({ length: count }, (_, index) => {
      const base = `${layered[0]![index]} ${layered[1]![index]} / ${layered[2]![index]} ${layered[3]![index]} ${layered[6]![index]} ${layered[4]![index]} ${layered[5]![index]}`;
      return index === count - 1 ? `${base} ${color}` : base;
    }).join(", ");

    return context.matchProperty("background", candidate) ? candidate : null;
  },
} satisfies ShorthandModule;
