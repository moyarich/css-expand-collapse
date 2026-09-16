import { components, cssom } from "./helpers.js";
import type { ShorthandDefinitionMap } from "./types.js";

export const VENDOR_SHORTHANDS: ShorthandDefinitionMap = {
  "-webkit-text-stroke": components(
    ["-webkit-text-stroke-width", "-webkit-text-stroke-color"],
    ["0", "currentcolor"],
  ),
  "-webkit-border-before": {
    longhands: [
      "-webkit-border-before-width",
      "-webkit-border-before-style",
      "-webkit-border-before-color",
    ],
    strategy: "triple",
  },
  "-webkit-mask-box-image": cssom([
    "-webkit-mask-box-image-source",
    "-webkit-mask-box-image-slice",
    "-webkit-mask-box-image-width",
    "-webkit-mask-box-image-outset",
    "-webkit-mask-box-image-repeat",
  ]),
};
