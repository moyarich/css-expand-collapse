import { unsupported } from "./helpers.js";
import type { ShorthandDefinitionMap } from "./types.js";

export const LAYOUT_SHORTHANDS: ShorthandDefinitionMap = {
  gap: { longhands: ["row-gap", "column-gap"], strategy: "pair" },
  "place-content": { longhands: ["align-content", "justify-content"], strategy: "pair" },
  "place-items": { longhands: ["align-items", "justify-items"], strategy: "pair" },
  "place-self": { longhands: ["align-self", "justify-self"], strategy: "pair" },
  "flex-flow": {
    longhands: ["flex-direction", "flex-wrap"],
    strategy: "flex-flow",
  },

  columns: unsupported(["column-width", "column-count"]),
  "contain-intrinsic-size": unsupported([
    "contain-intrinsic-width",
    "contain-intrinsic-height",
  ]),
  container: unsupported(["container-name", "container-type"]),
  flex: unsupported(["flex-grow", "flex-shrink", "flex-basis"]),
  grid: unsupported([
    "grid-auto-columns",
    "grid-auto-flow",
    "grid-auto-rows",
    "grid-template-areas",
    "grid-template-columns",
    "grid-template-rows",
  ]),
  "grid-area": unsupported([
    "grid-row-start",
    "grid-column-start",
    "grid-row-end",
    "grid-column-end",
  ]),
  "grid-column": unsupported(["grid-column-start", "grid-column-end"]),
  "grid-row": unsupported(["grid-row-start", "grid-row-end"]),
  "grid-template": unsupported([
    "grid-template-rows",
    "grid-template-columns",
    "grid-template-areas",
  ]),
  "position-try": unsupported(["position-try-order", "position-try-fallbacks"]),
  "scroll-timeline": unsupported(["scroll-timeline-name", "scroll-timeline-axis"]),
  "view-timeline": unsupported([
    "view-timeline-name",
    "view-timeline-axis",
    "view-timeline-inset",
  ]),
};
