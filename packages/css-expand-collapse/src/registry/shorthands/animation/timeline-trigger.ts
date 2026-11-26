import type { ShorthandModule } from "../../module.js";

// Specification-defined constituents; transformation remains opt-in.
export default {
  longhands: new Map<string, string>([
    ["timeline-trigger-name","none"],
    ["timeline-trigger-source","auto"],
    ["timeline-trigger-activation-range-start","normal"],
    ["timeline-trigger-activation-range-end","normal"],
    ["timeline-trigger-active-range-start","auto"],
    ["timeline-trigger-active-range-end","auto"],
  ]),
  experimental: true,
} satisfies ShorthandModule;
