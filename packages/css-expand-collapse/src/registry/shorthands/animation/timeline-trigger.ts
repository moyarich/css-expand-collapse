import type { ShorthandModule } from "../../module.js";

// Recognize the shorthand without emitting unverified constituent syntax.
export default {
  longhands: new Map<string, string>(),
  expand: () => null,
  collapse: () => null,
} satisfies ShorthandModule;
