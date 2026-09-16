import type { ShorthandDefinition } from "../types.js";

export default {
  longhands: [
    "border-top-left-radius",
    "border-top-right-radius",
    "border-bottom-right-radius",
    "border-bottom-left-radius",
  ],
  strategy: "quad",
} satisfies ShorthandDefinition;
