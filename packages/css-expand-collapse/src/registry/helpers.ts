export const quad = (prefix: string): readonly string[] => [
  `${prefix}-top`,
  `${prefix}-right`,
  `${prefix}-bottom`,
  `${prefix}-left`,
];

export const logicalPair = (
  prefix: string,
  axis: "block" | "inline",
): readonly string[] => [
  `${prefix}-${axis}-start`,
  `${prefix}-${axis}-end`,
];

export const sideBorder = (side: string): readonly string[] => [
  `border-${side}-width`,
  `border-${side}-style`,
  `border-${side}-color`,
];

export const logicalBorderSide = (side: string): readonly string[] => [
  `border-${side}-width`,
  `border-${side}-style`,
  `border-${side}-color`,
];
