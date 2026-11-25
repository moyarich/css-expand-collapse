export {
  SHORTHAND_PROPERTIES,
  collapseLonghands,
  collapseToShorthand,
  expandShorthand,
  expandShorthands,
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

export type { TransformCssOptions, TransformMode } from "./css.js";

export {
  collectCustomProperties,
  hasCustomPropertyReference,
  isCustomProperty,
  mergeCustomProperties,
  resolveCustomProperties,
} from "./custom-properties.js";

export type {
  CustomPropertyMap,
  ResolveCustomPropertiesOptions,
} from "./custom-properties.js";

export {
  collapseStyleDeclaration,
  collapseStyleDeclarations,
  getStyleLonghands,
  styleToDeclarations,
} from "./style.js";

export type { ReadonlyStyleDeclaration } from "./style.js";

export { splitTopLevelWhitespace } from "./registry/context.js";

export * from "./validation/index.js";

export type { TransformDiagnostic } from "./transform-diagnostics.js";

export { formatDeclarations } from "./formatDeclarations.js";
export type { DeclarationGrouping, FormatDeclarationsOptions } from "./formatDeclarations.js";

export {
  toCamelCaseProperty,
  toKebabCaseProperty,
  toCamelCaseDeclarations,
  toKebabCaseDeclarations,
} from "./property-case.js";

export { getShorthandMetadata, listShorthands } from "./registry/metadata.js";
export type {
  ShorthandCategory,
  ShorthandFilter,
  ShorthandMetadata,
} from "./registry/metadata.js";

export { parseCssLayers, splitCssLayers } from "./css-layers.js";
export type { CssLayer, LayerParseResult, LayeredShorthand } from "./css-layers.js";
