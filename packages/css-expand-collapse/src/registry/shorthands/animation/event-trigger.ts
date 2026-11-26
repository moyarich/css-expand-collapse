import type { ShorthandModule } from "../../module.js";

// Specification-defined constituents; transformation remains opt-in.
export default {
  longhands: new Map<string, string>([
    ["event-trigger-name","none"],
    ["event-trigger-source","none"],
  ]),
  experimental: true,
} satisfies ShorthandModule;
