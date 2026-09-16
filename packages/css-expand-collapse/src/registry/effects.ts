import { unsupported } from "./helpers.js";
import type { ShorthandDefinitionMap } from "./types.js";

export const EFFECT_SHORTHANDS: ShorthandDefinitionMap = {
  animation: unsupported([
    "animation-name",
    "animation-duration",
    "animation-timing-function",
    "animation-delay",
    "animation-iteration-count",
    "animation-direction",
    "animation-fill-mode",
    "animation-play-state",
    "animation-timeline",
  ]),
  "animation-range": unsupported(["animation-range-start", "animation-range-end"]),
  background: unsupported([
    "background-image",
    "background-position",
    "background-size",
    "background-repeat",
    "background-origin",
    "background-clip",
    "background-attachment",
    "background-color",
  ]),
  mask: unsupported([
    "mask-clip",
    "mask-composite",
    "mask-image",
    "mask-mode",
    "mask-origin",
    "mask-position",
    "mask-repeat",
    "mask-size",
  ]),
  "mask-border": unsupported([
    "mask-border-mode",
    "mask-border-outset",
    "mask-border-repeat",
    "mask-border-slice",
    "mask-border-source",
    "mask-border-width",
  ]),
  offset: unsupported([
    "offset-anchor",
    "offset-distance",
    "offset-path",
    "offset-position",
    "offset-rotate",
  ]),
  transition: unsupported([
    "transition-property",
    "transition-duration",
    "transition-timing-function",
    "transition-delay",
    "transition-behavior",
  ]),
};
