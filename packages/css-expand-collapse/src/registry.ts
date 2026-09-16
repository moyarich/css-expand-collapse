export type ShorthandStrategy =
  | "quad"
  | "pair"
  | "triple"
  | "border-all"
  | "text-decoration"
  | "flex-flow"
  | "unsupported";

export interface ShorthandDefinition {
  longhands: readonly string[];
  strategy: ShorthandStrategy;
  /** Initial values used only when callers explicitly allow filling missing longhands. */
  initialValues?: readonly string[];
}

/** Shorthands listed by MDN's CSS shorthand-properties guide. */
export const SHORTHAND_PROPERTIES = [
  "all",
  "animation",
  "animation-range",
  "background",
  "border",
  "border-block",
  "border-block-end",
  "border-block-start",
  "border-bottom",
  "border-color",
  "border-image",
  "border-inline",
  "border-inline-end",
  "border-inline-start",
  "border-left",
  "border-radius",
  "border-right",
  "border-style",
  "border-top",
  "border-width",
  "column-rule",
  "columns",
  "contain-intrinsic-size",
  "container",
  "flex",
  "flex-flow",
  "font",
  "font-synthesis",
  "font-variant",
  "gap",
  "grid",
  "grid-area",
  "grid-column",
  "grid-row",
  "grid-template",
  "inset",
  "inset-block",
  "inset-inline",
  "list-style",
  "margin",
  "margin-block",
  "margin-inline",
  "mask",
  "mask-border",
  "offset",
  "outline",
  "overflow",
  "overscroll-behavior",
  "padding",
  "padding-block",
  "padding-inline",
  "place-content",
  "place-items",
  "place-self",
  "position-try",
  "scroll-margin",
  "scroll-margin-block",
  "scroll-margin-inline",
  "scroll-padding",
  "scroll-padding-block",
  "scroll-padding-inline",
  "scroll-timeline",
  "text-box",
  "text-decoration",
  "text-emphasis",
  "text-wrap",
  "transition",
  "view-timeline",
  "-webkit-text-stroke",
  "-webkit-border-before",
  "-webkit-mask-box-image",
] as const;

const quad = (prefix: string): readonly string[] => [
  `${prefix}-top`,
  `${prefix}-right`,
  `${prefix}-bottom`,
  `${prefix}-left`,
];

const logicalPair = (prefix: string, axis: "block" | "inline"): readonly string[] => [
  `${prefix}-${axis}-start`,
  `${prefix}-${axis}-end`,
];

const sideBorder = (side: string): readonly string[] => [
  `border-${side}-width`,
  `border-${side}-style`,
  `border-${side}-color`,
];

const logicalBorderSide = (side: string): readonly string[] => [
  `border-${side}-width`,
  `border-${side}-style`,
  `border-${side}-color`,
];

const unsupported = (longhands: readonly string[]): ShorthandDefinition => ({
  longhands,
  strategy: "unsupported",
});

export const SHORTHAND_DEFINITIONS: Readonly<Record<string, ShorthandDefinition>> = {
  margin: { longhands: quad("margin"), strategy: "quad" },
  padding: { longhands: quad("padding"), strategy: "quad" },
  inset: {
    longhands: ["top", "right", "bottom", "left"],
    strategy: "quad",
    initialValues: ["auto", "auto", "auto", "auto"],
  },
  "border-width": { longhands: quad("border").map((p) => `${p}-width`), strategy: "quad" },
  "border-style": { longhands: quad("border").map((p) => `${p}-style`), strategy: "quad" },
  "border-color": { longhands: quad("border").map((p) => `${p}-color`), strategy: "quad" },
  "border-radius": {
    longhands: [
      "border-top-left-radius",
      "border-top-right-radius",
      "border-bottom-right-radius",
      "border-bottom-left-radius",
    ],
    strategy: "quad",
  },
  "scroll-margin": { longhands: quad("scroll-margin"), strategy: "quad" },
  "scroll-padding": { longhands: quad("scroll-padding"), strategy: "quad" },

  "margin-block": { longhands: logicalPair("margin", "block"), strategy: "pair" },
  "margin-inline": { longhands: logicalPair("margin", "inline"), strategy: "pair" },
  "padding-block": { longhands: logicalPair("padding", "block"), strategy: "pair" },
  "padding-inline": { longhands: logicalPair("padding", "inline"), strategy: "pair" },
  "inset-block": {
    longhands: ["inset-block-start", "inset-block-end"],
    strategy: "pair",
    initialValues: ["auto", "auto"],
  },
  "inset-inline": {
    longhands: ["inset-inline-start", "inset-inline-end"],
    strategy: "pair",
    initialValues: ["auto", "auto"],
  },
  "scroll-margin-block": { longhands: logicalPair("scroll-margin", "block"), strategy: "pair" },
  "scroll-margin-inline": { longhands: logicalPair("scroll-margin", "inline"), strategy: "pair" },
  "scroll-padding-block": { longhands: logicalPair("scroll-padding", "block"), strategy: "pair" },
  "scroll-padding-inline": { longhands: logicalPair("scroll-padding", "inline"), strategy: "pair" },
  overflow: { longhands: ["overflow-x", "overflow-y"], strategy: "pair" },
  "overscroll-behavior": {
    longhands: ["overscroll-behavior-x", "overscroll-behavior-y"],
    strategy: "pair",
  },
  gap: { longhands: ["row-gap", "column-gap"], strategy: "pair" },
  "place-content": { longhands: ["align-content", "justify-content"], strategy: "pair" },
  "place-items": { longhands: ["align-items", "justify-items"], strategy: "pair" },
  "place-self": { longhands: ["align-self", "justify-self"], strategy: "pair" },

  "border-top": { longhands: sideBorder("top"), strategy: "triple" },
  "border-right": { longhands: sideBorder("right"), strategy: "triple" },
  "border-bottom": { longhands: sideBorder("bottom"), strategy: "triple" },
  "border-left": { longhands: sideBorder("left"), strategy: "triple" },
  "border-block-start": {
    longhands: logicalBorderSide("block-start"),
    strategy: "triple",
  },
  "border-block-end": {
    longhands: logicalBorderSide("block-end"),
    strategy: "triple",
  },
  "border-inline-start": {
    longhands: logicalBorderSide("inline-start"),
    strategy: "triple",
  },
  "border-inline-end": {
    longhands: logicalBorderSide("inline-end"),
    strategy: "triple",
  },
  outline: {
    longhands: ["outline-width", "outline-style", "outline-color"],
    strategy: "triple",
  },
  "column-rule": {
    longhands: ["column-rule-width", "column-rule-style", "column-rule-color"],
    strategy: "triple",
  },

  border: {
    longhands: [
      "border-top-width", "border-top-style", "border-top-color",
      "border-right-width", "border-right-style", "border-right-color",
      "border-bottom-width", "border-bottom-style", "border-bottom-color",
      "border-left-width", "border-left-style", "border-left-color",
    ],
    strategy: "border-all",
  },
  "text-decoration": {
    longhands: [
      "text-decoration-line",
      "text-decoration-style",
      "text-decoration-color",
      "text-decoration-thickness",
    ],
    strategy: "text-decoration",
  },
  "flex-flow": {
    longhands: ["flex-direction", "flex-wrap"],
    strategy: "flex-flow",
  },

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
  "border-block": unsupported([
    "border-block-start-width", "border-block-start-style", "border-block-start-color",
    "border-block-end-width", "border-block-end-style", "border-block-end-color",
  ]),
  "border-inline": unsupported([
    "border-inline-start-width", "border-inline-start-style", "border-inline-start-color",
    "border-inline-end-width", "border-inline-end-style", "border-inline-end-color",
  ]),
  "border-image": unsupported([
    "border-image-source",
    "border-image-slice",
    "border-image-width",
    "border-image-outset",
    "border-image-repeat",
  ]),
  columns: unsupported(["column-width", "column-count"]),
  "contain-intrinsic-size": unsupported([
    "contain-intrinsic-width",
    "contain-intrinsic-height",
  ]),
  container: unsupported(["container-name", "container-type"]),
  flex: unsupported(["flex-grow", "flex-shrink", "flex-basis"]),
  font: unsupported([
    "font-family",
    "font-size",
    "font-width",
    "font-style",
    "font-variant",
    "font-weight",
    "line-height",
  ]),
  "font-synthesis": unsupported([
    "font-synthesis-weight",
    "font-synthesis-style",
    "font-synthesis-small-caps",
    "font-synthesis-position",
  ]),
  "font-variant": unsupported([
    "font-variant-alternates",
    "font-variant-caps",
    "font-variant-east-asian",
    "font-variant-emoji",
    "font-variant-ligatures",
    "font-variant-numeric",
    "font-variant-position",
  ]),
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
  "list-style": unsupported(["list-style-position", "list-style-image", "list-style-type"]),
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
  "position-try": unsupported(["position-try-order", "position-try-fallbacks"]),
  "scroll-timeline": unsupported(["scroll-timeline-name", "scroll-timeline-axis"]),
  "text-box": unsupported(["text-box-trim", "text-box-edge"]),
  "text-emphasis": unsupported(["text-emphasis-style", "text-emphasis-color"]),
  "text-wrap": unsupported(["text-wrap-mode", "text-wrap-style"]),
  transition: unsupported([
    "transition-property",
    "transition-duration",
    "transition-timing-function",
    "transition-delay",
    "transition-behavior",
  ]),
  "view-timeline": unsupported([
    "view-timeline-name",
    "view-timeline-axis",
    "view-timeline-inset",
  ]),
  "-webkit-text-stroke": unsupported([
    "-webkit-text-stroke-width",
    "-webkit-text-stroke-color",
  ]),
  "-webkit-border-before": unsupported([
    "-webkit-border-before-width",
    "-webkit-border-before-style",
    "-webkit-border-before-color",
  ]),
  "-webkit-mask-box-image": unsupported([
    "-webkit-mask-box-image-source",
    "-webkit-mask-box-image-slice",
    "-webkit-mask-box-image-width",
    "-webkit-mask-box-image-outset",
    "-webkit-mask-box-image-repeat",
  ]),
};

export const SHORTHAND_SET = new Set<string>(SHORTHAND_PROPERTIES);

export const LONGHAND_TO_SHORTHANDS = (() => {
  const map = new Map<string, string[]>();
  for (const [shorthand, definition] of Object.entries(SHORTHAND_DEFINITIONS)) {
    for (const longhand of definition.longhands) {
      const values = map.get(longhand) ?? [];
      values.push(shorthand);
      map.set(longhand, values);
    }
  }
  return map;
})();
