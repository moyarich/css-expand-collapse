export {
  SHORTHAND_PROPERTIES,
  collapseLonghands,
  collapseToShorthand,
  expandShorthand,
  findCollapsibleShorthands,
  getLonghands,
  getShorthands,
  isLonghand,
  isShorthand,
  splitTopLevelWhitespace,
  supportsPureTransform,
} from "./core.js";

export type {
  CollapseResult,
  CssomOptions,
  DeclarationMap,
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
