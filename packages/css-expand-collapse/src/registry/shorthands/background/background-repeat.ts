import type { ShorthandModule } from "../../module.js";

// Specification-defined constituents; transformation remains opt-in.
export default {
  longhands: new Map<string, string>([
    ["background-repeat-x","repeat"],
    ["background-repeat-y","repeat"],
  ]),
  experimental: true,
} satisfies ShorthandModule;
