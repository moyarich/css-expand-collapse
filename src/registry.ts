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
}

/**
 * Shorthands listed by MDN's CSS shorthand-properties guide.
 * Recognition is intentionally broader than the pure-JS transformation table:
 * browser CSSOM fallback can expand/collapse additional browser-supported shorthands.
 */
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

export const SHORTHAND_DEFINITIONS: Readonly<Record<string, ShorthandDefinition>> = {
  margin: { longhands: quad("margin"), strategy: "quad" },
  padding: { longhands: quad("padding"), strategy: "quad" },
  inset: { longhands: ["top", "right", "bottom", "left"], strategy: "quad" },
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
  "inset-block": { longhands: ["inset-block-start", "inset-block-end"], strategy: "pair" },
  "inset-inline": { longhands: ["inset-inline-start", "inset-inline-end"], strategy: "pair" },
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
  outline: {
    longhands: ["outline-width", "outline-style", "outline-color"],
    strategy: "triple",
  },
  "column-rule": {
    longhands: ["column-rule-width", "column-rule-style", "column-rule-color"],
    strategy: "triple",
  },
  "-webkit-text-stroke": {
    longhands: ["-webkit-text-stroke-width", "-webkit-text-stroke-color"],
    strategy: "pair",
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

  // Metadata for common complex shorthands. These are transformed through CSSOM
  // when available; keeping their constituents here makes getLonghands() useful.
  animation: {
    longhands: [
      "animation-name", "animation-duration", "animation-timing-function",
      "animation-delay", "animation-iteration-count", "animation-direction",
      "animation-fill-mode", "animation-play-state",
    ],
    strategy: "unsupported",
  },
  "animation-range": {
    longhands: ["animation-range-start", "animation-range-end"],
    strategy: "unsupported",
  },
  background: {
    longhands: [
      "background-image", "background-position", "background-size",
      "background-repeat", "background-origin", "background-clip",
      "background-attachment", "background-color",
    ],
    strategy: "unsupported",
  },
  flex: {
    longhands: ["flex-grow", "flex-shrink", "flex-basis"],
    strategy: "unsupported",
  },
  "list-style": {
    longhands: ["list-style-position", "list-style-image", "list-style-type"],
    strategy: "unsupported",
  },
  transition: {
    longhands: [
      "transition-property", "transition-duration", "transition-timing-function",
      "transition-delay", "transition-behavior",
    ],
    strategy: "unsupported",
  },
  "text-wrap": {
    longhands: ["text-wrap-mode", "text-wrap-style"],
    strategy: "unsupported",
  },
  "text-emphasis": {
    longhands: ["text-emphasis-style", "text-emphasis-color"],
    strategy: "unsupported",
  },
  columns: {
    longhands: ["column-width", "column-count"],
    strategy: "unsupported",
  },
  container: {
    longhands: ["container-name", "container-type"],
    strategy: "unsupported",
  },
  "scroll-timeline": {
    longhands: ["scroll-timeline-name", "scroll-timeline-axis"],
    strategy: "unsupported",
  },
  "view-timeline": {
    longhands: ["view-timeline-name", "view-timeline-axis", "view-timeline-inset"],
    strategy: "unsupported",
  },
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
