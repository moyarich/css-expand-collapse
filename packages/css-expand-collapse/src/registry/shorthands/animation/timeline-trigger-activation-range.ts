import type { ShorthandModule } from "../../module.js";

// Specification-defined constituents; transformation remains opt-in.
export default {
  longhands: new Map<string, string>([
    ["timeline-trigger-activation-range-start","normal"],
    ["timeline-trigger-activation-range-end","normal"],
  ]),
  experimental: true,
} satisfies ShorthandModule;
