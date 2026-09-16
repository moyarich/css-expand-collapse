import type { ShorthandDefinition } from "../types.js";

export default {
  longhands: [
    "border-inline-start-width", "border-inline-start-style", "border-inline-start-color",
    "border-inline-end-width", "border-inline-end-style", "border-inline-end-color",
  ],
  strategy: "logical-border-axis",
} satisfies ShorthandDefinition;
