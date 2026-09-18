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
  supportsTransform,
} from "./core.js";

export type {
  CollapseShorthandResult,
  DeclarationMap,
  ExpandShorthandResult,
  LonghandMap,
  ShorthandResult,
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
  collapseStyleDeclaration,
  collapseStyleDeclarations,
  getStyleLonghands,
  styleToDeclarations,
} from "./style.js";

export type { ReadonlyStyleDeclaration } from "./style.js";

export { splitTopLevelWhitespace } from "./registry/context.js";
