import { splitTopLevelComma } from "../context.js";
import type { DeclarationMap, ShorthandModule, ShorthandExpander } from "../types.js";

const longhands = [
  "mask-clip",
  "mask-composite",
  "mask-image",
  "mask-mode",
  "mask-origin",
  "mask-position",
  "mask-repeat",
  "mask-size",
] as const;
const initialValues = [
  "border-box",
  "add",
  "none",
  "match-source",
  "border-box",
  "0% 0%",
  "repeat",
  "auto",
] as const;

function parseLayer(layer: string, context: Parameters<ShorthandExpander>[1]): DeclarationMap | null {
  const slash = context.splitSlash(layer);
  if (slash.length > 2 || slash.some((part) => !part)) return null;

  const result: DeclarationMap = Object.fromEntries(
    longhands.map((longhand, index) => [longhand, initialValues[index]!]),
  );

  let after = slash[1] ? context.splitWhitespace(slash[1]) : [];
  if (after.length) {
    let size = "";
    let consumed = 0;
    for (let end = after.length; end >= 1; end -= 1) {
      const candidate = after.slice(0, end).join(" ");
      if (context.matchProperty("mask-size", candidate)) {
        size = candidate;
        consumed = end;
        break;
      }
    }
    if (!size) return null;
    result["mask-size"] = size;
    after = after.slice(consumed);
  }

  const tokens = [...context.splitWhitespace(slash[0]!), ...after];
  const positionTokens: string[] = [];
  const repeatTokens: string[] = [];
  const boxes: string[] = [];
  let imageAssigned = false;
  let modeAssigned = false;
  let compositeAssigned = false;
  let clipOnlyAssigned = false;

  for (const token of tokens) {
    if (!imageAssigned && context.matchProperty("mask-image", token)) {
      result["mask-image"] = token;
      imageAssigned = true;
      continue;
    }
    if (!modeAssigned && context.matchProperty("mask-mode", token)) {
      result["mask-mode"] = token;
      modeAssigned = true;
      continue;
    }
    if (!compositeAssigned && context.matchProperty("mask-composite", token)) {
      result["mask-composite"] = token;
      compositeAssigned = true;
      continue;
    }
    if (context.matchProperty("mask-repeat", token)) {
      repeatTokens.push(token);
      continue;
    }
    if (context.matchProperty("mask-origin", token)) {
      boxes.push(token);
      continue;
    }
    if (!clipOnlyAssigned && context.matchProperty("mask-clip", token)) {
      result["mask-clip"] = token;
      clipOnlyAssigned = true;
      continue;
    }
    positionTokens.push(token);
  }

  if (repeatTokens.length) {
    const repeat = repeatTokens.join(" ");
    if (!context.matchProperty("mask-repeat", repeat)) return null;
    result["mask-repeat"] = repeat;
  }

  if (boxes.length > 2) return null;
  if (boxes.length === 1) {
    result["mask-origin"] = boxes[0]!;
    if (!clipOnlyAssigned) result["mask-clip"] = boxes[0]!;
  } else if (boxes.length === 2) {
    result["mask-origin"] = boxes[0]!;
    result["mask-clip"] = boxes[1]!;
  }

  if (positionTokens.length) {
    const position = positionTokens.join(" ");
    if (!context.matchProperty("mask-position", position)) return null;
    result["mask-position"] = position;
  }

  return result;
}

const expand: ShorthandExpander = (value, context) => {
  if (!context.matchProperty("mask", value)) return null;
  const layers = splitTopLevelComma(value);
  const parsed = layers.map((layer) => parseLayer(layer, context));
  if (!layers.length || parsed.some((layer) => !layer)) return null;
  const concrete = parsed as DeclarationMap[];
  return Object.fromEntries(
    longhands.map((longhand) => [longhand, concrete.map((layer) => layer[longhand]).join(", ")]),
  );
};

export default {
  longhands,
  safeToDropWhenFullyShadowed: false,
  initialValues,
  expand,
  collapse(declarations, context) {
    const values = longhands.map((longhand) => splitTopLevelComma(declarations[longhand] ?? ""));
    const count = values[0]?.length ?? 0;
    if (!count || values.some((layers) => layers.length !== count)) return null;

    const candidate = Array.from({ length: count }, (_, index) => [
      values[2]![index],
      values[3]![index],
      values[5]![index],
      "/",
      values[7]![index],
      values[6]![index],
      values[4]![index],
      values[0]![index],
      values[1]![index],
    ].join(" ")).join(", ");

    return context.matchProperty("mask", candidate) ? candidate : null;
  },
} satisfies ShorthandModule;
