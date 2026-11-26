import { getShorthandModule, matchProperty } from "@moyarich/css-expand-collapse";
import type { CssTransformerPlugin, ShorthandModule } from "@moyarich/css-expand-collapse";

const trigger = "animation-trigger";
const animation = getShorthandModule("animation");
if (!animation?.expand || !animation.collapse) {
  throw new Error("The animation-trigger plugin requires the core animation handlers.");
}
const expand = animation.expand;
const collapse = animation.collapse;

/** Enable the draft-defined reset-only constituent without duplicating animation parsing. */
export const animationTrigger: ShorthandModule = {
  ...animation,
  experimental: true,
  excludedLonghands: animation.excludedLonghands?.filter((property) => property !== trigger),
  resetOnlyLonghands: [...new Set([...(animation.resetOnlyLonghands ?? []), trigger])],
  expand(value, context) {
    const declarations = expand(value, context);
    return declarations ? { ...declarations, [trigger]: "none" } : null;
  },
  collapse(declarations, context) {
    if (declarations[trigger]?.trim().toLowerCase() !== "none") return null;
    return collapse(declarations, context);
  },
};

/** Explicit override of the active animation module; not installed by the default bundle. */
export const animationTriggerPlugin: CssTransformerPlugin = {
  name: "@moyarich/css-experimental-shorthands/animation-trigger",
  shorthands: { animation: animationTrigger },
  grammars: {
    [trigger]: (value) => value.trim().toLowerCase() === "none" || matchProperty(trigger, value),
  },
};
