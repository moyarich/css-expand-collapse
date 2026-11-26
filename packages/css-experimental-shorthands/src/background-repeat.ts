import { splitTopLevelComma, splitTopLevelWhitespace } from "@moyarich/css-expand-collapse";
import type { CssTransformerPlugin, ShorthandModule } from "@moyarich/css-expand-collapse";

const x = "background-repeat-x";
const y = "background-repeat-y";
const keywords = new Set(["repeat", "no-repeat", "space", "round"]);
function parseLayer(value: string): [string, string] | null {
  const tokens = splitTopLevelWhitespace(value.toLowerCase());
  if (tokens.length === 1 && tokens[0] === "repeat-x") return ["repeat", "no-repeat"];
  if (tokens.length === 1 && tokens[0] === "repeat-y") return ["no-repeat", "repeat"];
  if (tokens.length < 1 || tokens.length > 2 || !tokens.every((token) => keywords.has(token))) return null;
  return [tokens[0]!, tokens[1] ?? tokens[0]!];
}
export const backgroundRepeat: ShorthandModule = {
  experimental: true,
  longhands: new Map([[x, "repeat"], [y, "repeat"]]),
  safeToDropWhenFullyShadowed: false,
  expand(value) {
    const layers = splitTopLevelComma(value).map(parseLayer);
    if (layers.some((layer) => layer === null)) return null;
    return { [x]: layers.map((layer) => layer![0]).join(", "), [y]: layers.map((layer) => layer![1]).join(", ") };
  },
  collapse(values) {
    const xs = splitTopLevelComma((values[x] ?? "").toLowerCase());
    const ys = splitTopLevelComma((values[y] ?? "").toLowerCase());
    if (xs.length !== ys.length || ![...xs, ...ys].every((token) => keywords.has(token))) return null;
    return xs.map((a, i) => a === ys[i] ? a : a + " " + ys[i]).join(", ");
  },
};
const axisGrammar = (value: string) => splitTopLevelComma(value.toLowerCase()).every((token) => keywords.has(token));
export const backgroundRepeatGrammars = {
  [x]: axisGrammar,
  [y]: axisGrammar,
  "background-repeat": (value: string) => splitTopLevelComma(value).every((layer) => parseLayer(layer) !== null),
};

/** Register only physical background-repeat transformations and their grammars. */
export const backgroundRepeatPlugin: CssTransformerPlugin = {
  name: "@moyarich/css-experimental-shorthands/background-repeat",
  shorthands: { "background-repeat": backgroundRepeat },
  grammars: backgroundRepeatGrammars,
  replaceRecognized: ["background-repeat"],
};
