import { cssom } from "./helpers.js";
import type { ShorthandDefinitionMap } from "./types.js";

export const EFFECT_SHORTHANDS: ShorthandDefinitionMap = {
  animation: cssom([
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
  "animation-range": cssom(["animation-range-start", "animation-range-end"]),
  background: cssom([
    "background-image",
    "background-position",
    "background-size",
    "background-repeat",
    "background-origin",
    "background-clip",
    "background-attachment",
    "background-color",
  ]),
  mask: cssom([
    "mask-clip",
    "mask-composite",
    "mask-image",
    "mask-mode",
    "mask-origin",
    "mask-position",
    "mask-repeat",
    "mask-size",
  ]),
  "mask-border": cssom([
    "mask-border-mode",
    "mask-border-outset",
    "mask-border-repeat",
    "mask-border-slice",
    "mask-border-source",
    "mask-border-width",
  ]),
  offset: cssom([
    "offset-anchor",
    "offset-distance",
    "offset-path",
    "offset-position",
    "offset-rotate",
  ]),
  transition: cssom([
    "transition-property",
    "transition-duration",
    "transition-timing-function",
    "transition-delay",
    "transition-behavior",
  ]),
};
