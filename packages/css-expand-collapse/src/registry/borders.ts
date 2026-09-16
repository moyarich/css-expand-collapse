import {
  logicalBorderSide,
  quad,
  sideBorder,
  unsupported,
} from "./helpers.js";
import type { ShorthandDefinitionMap } from "./types.js";

export const BORDER_SHORTHANDS: ShorthandDefinitionMap = {
  "border-width": { longhands: quad("border").map((p) => `${p}-width`), strategy: "quad" },
  "border-style": { longhands: quad("border").map((p) => `${p}-style`), strategy: "quad" },
  "border-color": { longhands: quad("border").map((p) => `${p}-color`), strategy: "quad" },
  "border-radius": {
    longhands: [
      "border-top-left-radius",
      "border-top-right-radius",
      "border-bottom-right-radius",
      "border-bottom-left-radius",
    ],
    strategy: "quad",
  },

  "border-top": { longhands: sideBorder("top"), strategy: "triple" },
  "border-right": { longhands: sideBorder("right"), strategy: "triple" },
  "border-bottom": { longhands: sideBorder("bottom"), strategy: "triple" },
  "border-left": { longhands: sideBorder("left"), strategy: "triple" },
  "border-block-start": {
    longhands: logicalBorderSide("block-start"),
    strategy: "triple",
  },
  "border-block-end": {
    longhands: logicalBorderSide("block-end"),
    strategy: "triple",
  },
  "border-inline-start": {
    longhands: logicalBorderSide("inline-start"),
    strategy: "triple",
  },
  "border-inline-end": {
    longhands: logicalBorderSide("inline-end"),
    strategy: "triple",
  },
  outline: {
    longhands: ["outline-width", "outline-style", "outline-color"],
    strategy: "triple",
  },
  "column-rule": {
    longhands: ["column-rule-width", "column-rule-style", "column-rule-color"],
    strategy: "triple",
  },

  border: {
    longhands: [
      "border-top-width", "border-top-style", "border-top-color",
      "border-right-width", "border-right-style", "border-right-color",
      "border-bottom-width", "border-bottom-style", "border-bottom-color",
      "border-left-width", "border-left-style", "border-left-color",
    ],
    strategy: "border-all",
  },
  "border-block": unsupported([
    "border-block-start-width", "border-block-start-style", "border-block-start-color",
    "border-block-end-width", "border-block-end-style", "border-block-end-color",
  ]),
  "border-inline": unsupported([
    "border-inline-start-width", "border-inline-start-style", "border-inline-start-color",
    "border-inline-end-width", "border-inline-end-style", "border-inline-end-color",
  ]),
  "border-image": unsupported([
    "border-image-source",
    "border-image-slice",
    "border-image-width",
    "border-image-outset",
    "border-image-repeat",
  ]),
};
