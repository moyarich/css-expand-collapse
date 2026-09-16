import type { ShorthandDefinition } from "../types.js";

export default {
  longhands: ["inset-block-start", "inset-block-end"],
  strategy: "pair",
  initialValues: ["auto", "auto"],
} satisfies ShorthandDefinition;
