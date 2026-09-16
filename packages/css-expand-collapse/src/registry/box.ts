import { logicalPair, quad } from "./helpers.js";
import type { ShorthandDefinitionMap } from "./types.js";

export const BOX_SHORTHANDS: ShorthandDefinitionMap = {
  margin: { longhands: quad("margin"), strategy: "quad" },
  padding: { longhands: quad("padding"), strategy: "quad" },
  inset: {
    longhands: ["top", "right", "bottom", "left"],
    strategy: "quad",
    initialValues: ["auto", "auto", "auto", "auto"],
  },
  "scroll-margin": { longhands: quad("scroll-margin"), strategy: "quad" },
  "scroll-padding": { longhands: quad("scroll-padding"), strategy: "quad" },

  "margin-block": { longhands: logicalPair("margin", "block"), strategy: "pair" },
  "margin-inline": { longhands: logicalPair("margin", "inline"), strategy: "pair" },
  "padding-block": { longhands: logicalPair("padding", "block"), strategy: "pair" },
  "padding-inline": { longhands: logicalPair("padding", "inline"), strategy: "pair" },
  "inset-block": {
    longhands: ["inset-block-start", "inset-block-end"],
    strategy: "pair",
    initialValues: ["auto", "auto"],
  },
  "inset-inline": {
    longhands: ["inset-inline-start", "inset-inline-end"],
    strategy: "pair",
    initialValues: ["auto", "auto"],
  },
  "scroll-margin-block": { longhands: logicalPair("scroll-margin", "block"), strategy: "pair" },
  "scroll-margin-inline": { longhands: logicalPair("scroll-margin", "inline"), strategy: "pair" },
  "scroll-padding-block": { longhands: logicalPair("scroll-padding", "block"), strategy: "pair" },
  "scroll-padding-inline": { longhands: logicalPair("scroll-padding", "inline"), strategy: "pair" },

  overflow: { longhands: ["overflow-x", "overflow-y"], strategy: "pair" },
  "overscroll-behavior": {
    longhands: ["overscroll-behavior-x", "overscroll-behavior-y"],
    strategy: "pair",
  },
};
