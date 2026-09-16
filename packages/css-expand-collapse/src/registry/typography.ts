import { components, cssom } from "./helpers.js";
import type { ShorthandDefinitionMap } from "./types.js";

export const TYPOGRAPHY_SHORTHANDS: ShorthandDefinitionMap = {
  "text-decoration": {
    longhands: [
      "text-decoration-line",
      "text-decoration-style",
      "text-decoration-color",
      "text-decoration-thickness",
    ],
    strategy: "text-decoration",
  },

  font: cssom([
    "font-family",
    "font-size",
    "font-width",
    "font-style",
    "font-variant",
    "font-weight",
    "line-height",
  ]),
  "font-synthesis": cssom([
    "font-synthesis-weight",
    "font-synthesis-style",
    "font-synthesis-small-caps",
    "font-synthesis-position",
  ]),
  "font-variant": cssom([
    "font-variant-alternates",
    "font-variant-caps",
    "font-variant-east-asian",
    "font-variant-emoji",
    "font-variant-ligatures",
    "font-variant-numeric",
    "font-variant-position",
  ]),
  "list-style": cssom(["list-style-position", "list-style-image", "list-style-type"]),
  "text-box": cssom(["text-box-trim", "text-box-edge"]),
  "text-emphasis": cssom(["text-emphasis-style", "text-emphasis-color"]),
  "text-wrap": components(
    ["text-wrap-mode", "text-wrap-style"],
    ["wrap", "auto"],
  ),
};
