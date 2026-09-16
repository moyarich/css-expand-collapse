import type { ShorthandDefinition } from "./types.js";

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

export const cssom = (
  longhands: readonly string[],
  initialValues?: readonly string[],
): ShorthandDefinition => ({
  longhands,
  strategy: "cssom",
  ...(initialValues ? { initialValues } : {}),
});

export const components = (
  longhands: readonly string[],
  initialValues: readonly string[],
): ShorthandDefinition => ({
  longhands,
  strategy: "components",
  initialValues,
});

export const slashPair = (
  longhands: readonly [string, string],
  initialValues: readonly [string, string],
): ShorthandDefinition => ({
  longhands,
  strategy: "slash-pair",
  initialValues,
});
