import type { ShorthandModule } from "../module.js";

const longhands = new Map<string, string>();

export default {
  longhands,
  expand: () => null,
  collapse: () => null,
} satisfies ShorthandModule;
