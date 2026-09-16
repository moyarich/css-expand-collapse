import { SHORTHAND_PROPERTIES } from "@moyarich/css-expand-collapse";

type ShorthandProperty = (typeof SHORTHAND_PROPERTIES)[number];
export type ExampleProperty = Exclude<ShorthandProperty, "all">;

export const EXAMPLE_GROUPS = [
  "Box model & borders",
  "Layout & alignment",
  "Typography & text",
  "Animation & scrolling",
  "Visual effects",
  "Vendor prefixed",
] as const;

export type ExampleGroup = (typeof EXAMPLE_GROUPS)[number];

export interface ShorthandExample {
  property: ExampleProperty;
  group: ExampleGroup;
  value: string;
  source: string;
}

/**
 * Representative values for the MDN shorthand-property catalog.
 *
 * Properties without a specific teaching value use the CSS-wide `initial` value.
 * That still makes the example deterministic while showing exactly which longhands
 * the shorthand controls.
 */
const EXAMPLE_VALUES: Partial<Record<ShorthandProperty, string>> = {
  animation: "fade 1s ease-in-out 200ms 2 alternate both running",
  background: "linear-gradient(135deg, #7c3aed, #2563eb) center / cover no-repeat",
  border: "2px solid rebeccapurple",
  "border-block": "2px solid teal",
  "border-block-end": "3px dashed tomato",
  "border-block-start": "1px solid slateblue",
  "border-bottom": "4px double royalblue",
  "border-color": "red orange gold green",
  "border-image": "linear-gradient(#7c3aed, #2563eb) 30",
  "border-inline": "2px solid mediumseagreen",
  "border-inline-end": "3px dotted deeppink",
  "border-inline-start": "1px solid steelblue",
  "border-left": "4px solid orchid",
  "border-radius": "12px 24px 8px 16px",
  "border-right": "2px dashed darkorange",
  "border-style": "solid dashed dotted double",
  "border-top": "3px solid cornflowerblue",
  "border-width": "1px 2px 3px 4px",
  "column-rule": "2px solid #94a3b8",
  columns: "14rem 3",
  container: "sidebar / inline-size",
  flex: "1 1 18rem",
  "flex-flow": "row wrap",
  font: "italic 700 1rem/1.5 system-ui",
  "font-synthesis": "none",
  "font-variant": "small-caps tabular-nums",
  gap: "16px 24px",
  grid: "auto-flow 80px / repeat(3, 1fr)",
  "grid-area": "1 / 2 / 3 / 4",
  "grid-column": "2 / span 3",
  "grid-row": "1 / span 2",
  "grid-template": "\"header header\" 64px \"main aside\" 1fr / 2fr 1fr",
  inset: "10px 20px 30px 40px",
  "inset-block": "10px 30px",
  "inset-inline": "20px 40px",
  "list-style": "square inside",
  margin: "12px 24px 32px",
  "margin-block": "16px 24px",
  "margin-inline": "auto 24px",
  mask: "linear-gradient(#000 0 0) center / cover no-repeat",
  outline: "3px dashed tomato",
  overflow: "hidden auto",
  "overscroll-behavior": "contain none",
  padding: "8px 16px 20px 24px",
  "padding-block": "12px 20px",
  "padding-inline": "16px 28px",
  "place-content": "center space-between",
  "place-items": "center stretch",
  "place-self": "start end",
  "scroll-margin": "8px 16px 24px 32px",
  "scroll-margin-block": "12px 20px",
  "scroll-margin-inline": "16px 28px",
  "scroll-padding": "8px 16px 24px 32px",
  "scroll-padding-block": "12px 20px",
  "scroll-padding-inline": "16px 28px",
  "text-decoration": "wavy underline purple 25%",
  "text-emphasis": "filled sesame rebeccapurple",
  "text-wrap": "wrap balance",
  transition: "opacity 250ms ease 50ms",
  "-webkit-text-stroke": "1px black",
  "-webkit-border-before": "2px solid rebeccapurple",
};

function groupForProperty(property: ExampleProperty): ExampleGroup {
  if (property.startsWith("-webkit-")) return "Vendor prefixed";

  if (
    property.startsWith("animation") ||
    property === "transition" ||
    property === "offset" ||
    property === "position-try" ||
    property.startsWith("scroll-") ||
    property.startsWith("view-timeline")
  ) {
    return "Animation & scrolling";
  }

  if (
    property.startsWith("font") ||
    property.startsWith("text-") ||
    property === "list-style"
  ) {
    return "Typography & text";
  }

  if (
    property === "background" ||
    property.startsWith("mask")
  ) {
    return "Visual effects";
  }

  if (
    property.startsWith("border") ||
    property === "outline" ||
    property.startsWith("margin") ||
    property.startsWith("padding") ||
    property.startsWith("inset")
  ) {
    return "Box model & borders";
  }

  return "Layout & alignment";
}

function makeSource(property: ExampleProperty, value: string): string {
  return `.example {\n  ${property}: ${value};\n}`;
}

export const SHORTHAND_EXAMPLES: readonly ShorthandExample[] = SHORTHAND_PROPERTIES
  .filter((property): property is ExampleProperty => property !== "all")
  .map((property) => {
    const value = EXAMPLE_VALUES[property] ?? "initial";
    return {
      property,
      group: groupForProperty(property),
      value,
      source: makeSource(property, value),
    };
  });

export function getShorthandExample(property: string): ShorthandExample | undefined {
  return SHORTHAND_EXAMPLES.find((example) => example.property === property);
}
