import type { ShorthandDefinition } from "../types.js";

export default {
  longhands: ["top", "right", "bottom", "left"],
  strategy: "quad",
  initialValues: ["auto", "auto", "auto", "auto"],
} satisfies ShorthandDefinition;
