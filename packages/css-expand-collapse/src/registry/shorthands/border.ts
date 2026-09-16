import type { ShorthandDefinition } from "../types.js";

export default {
  longhands: [
    "border-top-width", "border-top-style", "border-top-color",
    "border-right-width", "border-right-style", "border-right-color",
    "border-bottom-width", "border-bottom-style", "border-bottom-color",
    "border-left-width", "border-left-style", "border-left-color",
  ],
  strategy: "border-all",
} satisfies ShorthandDefinition;
