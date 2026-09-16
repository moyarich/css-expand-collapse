import type { ShorthandDefinition } from "../types.js";

export default {
  longhands: ["inset-inline-start", "inset-inline-end"],
  strategy: "pair",
  initialValues: ["auto", "auto"],
} satisfies ShorthandDefinition;
