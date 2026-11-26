import type { ShorthandModule } from "../../module.js";

// Specification-defined constituents; transformation remains opt-in.
export default {
  longhands: new Map<string, string>([
    ["max-lines","auto"],
    ["block-ellipsis","no-ellipsis"],
    ["continue","normal"],
  ]),
  experimental: true,
} satisfies ShorthandModule;
