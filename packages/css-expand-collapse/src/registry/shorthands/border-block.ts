import type { ShorthandDefinition } from "../types.js";

export default {
  longhands: [
    "border-block-start-width", "border-block-start-style", "border-block-start-color",
    "border-block-end-width", "border-block-end-style", "border-block-end-color",
  ],
  strategy: "logical-border-axis",
} satisfies ShorthandDefinition;
