export {
  SHORTHAND_PROPERTIES,
  collapseLonghands,
  collapseToShorthand,
  expandShorthand,
  findCollapsibleShorthands,
  getLonghands,
  getShorthands,
  getShorthandStrategy,
  isLonghand,
  isShorthand,
  splitTopLevelWhitespace,
  supportsPureTransform,
  supportsTransform,
} from "./core.js";

export type {
  CollapseResult,
  CssomOptions,
  DeclarationMap,
  TransformOptions,
} from "./core.js";

export {
  collapseCss,
  collapseDeclarations,
  expandCss,
  expandDeclarations,
  transformCss,
} from "./css.js";

export type {
  TransformCssOptions,
  TransformMode,
} from "./css.js";

export {
  collapseComputedStyle,
  collapseComputedStyles,
  getComputedLonghands,
  styleToDeclarations,
} from "./computed.js";

export type { ReadonlyStyleDeclaration } from "./computed.js";

// Deprecated compatibility helpers. Transform support no longer depends on CSSOM.
export {
  hasCssomSupport,
  supportsRuntimeTransform,
} from "./runtime.js";

export type { RuntimeCssomOptions } from "./runtime.js";
