import type { ShorthandModule } from "../../module.js";

// Specification-defined constituents; transformation remains opt-in.
export default {
  longhands: new Map<string, string>([
    ["timeline-trigger-active-range-start","auto"],
    ["timeline-trigger-active-range-end","auto"],
  ]),
  experimental: true,
} satisfies ShorthandModule;
