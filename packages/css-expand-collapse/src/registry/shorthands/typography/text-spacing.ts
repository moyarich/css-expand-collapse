import type { ShorthandModule } from "../../module.js";

// Specification-defined constituents; transformation remains opt-in.
export default {
  longhands: new Map<string, string>([
    ["text-spacing-trim","normal"],
    ["text-autospace","normal"],
  ]),
  experimental: true,
} satisfies ShorthandModule;
