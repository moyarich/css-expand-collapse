import type { ShorthandDefinition } from "../types.js";

export default {
  longhands: ["contain-intrinsic-width", "contain-intrinsic-height"],
  strategy: "pair",
  initialValues: ["none", "none"],
} satisfies ShorthandDefinition;
