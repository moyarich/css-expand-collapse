import type { ShorthandDefinition } from "../types.js";

export default {
  longhands: ["flex-grow", "flex-shrink", "flex-basis"],
  strategy: "flex",
  initialValues: ["0", "1", "auto"],
} satisfies ShorthandDefinition;
