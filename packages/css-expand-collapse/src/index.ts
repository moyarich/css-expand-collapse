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
  supportsExpand,
  supportsCollapse,
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

export { splitTopLevelWhitespace, splitTopLevelComma, splitTopLevelSlash, matchProperty, createShorthandExpandContext, createShorthandCollapseContext } from "./registry/context.js";
export { expandQuad, expandPair, expandTriple, expandComponents, expandSlashPair } from "./registry/expanders.js";
export { collapseQuad, collapsePair, collapseTriple, collapseComponents, collapseSlashPair } from "./registry/collapsers.js";
export { activeLonghands, longhandNames, longhandInitialValues, getModuleCapabilities } from "./registry/helpers.js";
export type { ShorthandModule, ShorthandModuleMap, ShorthandCapabilities, ShorthandExpander, ShorthandCollapser, ShorthandExpandContext, ShorthandCollapseContext, LonghandValueEquivalence } from "./registry/module.js";

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

export { transformCssWithSourceMap, transformDeclarationsWithSourceMap } from "./css.js";
export type { CssDeclarationProvenance, CssInputSourceMap, CssSourceMap, TransformCssSourceMapOptions, TransformCssSourceMapResult } from "./css.js";

export { createCssTransformer } from "./core.js";
export type { CssTransformer } from "./core.js";
