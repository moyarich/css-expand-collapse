import { components, cssom, slashPair } from "./helpers.js";
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

  columns: components(
    ["column-width", "column-count"],
    ["auto", "auto"],
  ),
  "contain-intrinsic-size": {
    longhands: ["contain-intrinsic-width", "contain-intrinsic-height"],
    strategy: "pair",
    initialValues: ["none", "none"],
  },
  container: slashPair(
    ["container-name", "container-type"],
    ["none", "normal"],
  ),
  flex: {
    longhands: ["flex-grow", "flex-shrink", "flex-basis"],
    strategy: "flex",
    initialValues: ["0", "1", "auto"],
  },

  grid: cssom([
    "grid-auto-columns",
    "grid-auto-flow",
    "grid-auto-rows",
    "grid-template-areas",
    "grid-template-columns",
    "grid-template-rows",
  ]),
  "grid-area": cssom([
    "grid-row-start",
    "grid-column-start",
    "grid-row-end",
    "grid-column-end",
  ]),
  "grid-column": slashPair(
    ["grid-column-start", "grid-column-end"],
    ["auto", "auto"],
  ),
  "grid-row": slashPair(
    ["grid-row-start", "grid-row-end"],
    ["auto", "auto"],
  ),
  "grid-template": cssom([
    "grid-template-rows",
    "grid-template-columns",
    "grid-template-areas",
  ]),
  "position-try": cssom(["position-try-order", "position-try-fallbacks"]),
  "scroll-timeline": cssom(["scroll-timeline-name", "scroll-timeline-axis"]),
  "view-timeline": cssom([
    "view-timeline-name",
    "view-timeline-axis",
    "view-timeline-inset",
  ]),
};
