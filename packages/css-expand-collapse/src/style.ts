import {
  collapseToShorthand,
  getLonghands,
  type CollapseShorthandResult,
  type DeclarationMap,
  type TransformOptions,
} from "./core.js";
import { SHORTHAND_PROPERTIES } from "./registry/index.js";

export interface ReadonlyStyleDeclaration {
  readonly length: number;
  item(index: number): string;
  getPropertyValue(property: string): string;
}

export function styleToDeclarations(
  style: ReadonlyStyleDeclaration,
  properties?: Iterable<string>,
): DeclarationMap {
  const output: DeclarationMap = {};

  if (properties) {
    for (const property of properties) {
      const value = style.getPropertyValue(property).trim();
      if (value) output[property.toLowerCase()] = value;
    }
    return output;
  }

  for (let index = 0; index < style.length; index += 1) {
    const property = style.item(index);
    if (!property) continue;
    const value = style.getPropertyValue(property).trim();
    if (value) output[property.toLowerCase()] = value;
  }
  return output;
}

export function createStyleOperations(
  discover: typeof getLonghands,
  collapse: typeof collapseToShorthand,
  properties: () => Iterable<string>,
) {
function getStyleLonghands(
  style: ReadonlyStyleDeclaration,
  shorthand: string,
): DeclarationMap {
  return styleToDeclarations(style, discover(shorthand));
}

function collapseStyleDeclaration(
  style: ReadonlyStyleDeclaration,
  shorthand: string,
  options?: TransformOptions,
): CollapseShorthandResult | null {
  const longhands = discover(shorthand);
  const declarations = longhands.length
    ? styleToDeclarations(style, longhands)
    : styleToDeclarations(style);
  return collapse(shorthand, declarations, options);
}

function collapseStyleDeclarations(
  style: ReadonlyStyleDeclaration,
  shorthands: Iterable<string> = properties(),
  options?: TransformOptions,
): CollapseShorthandResult[] {
  const results: CollapseShorthandResult[] = [];
  for (const shorthand of shorthands) {
    const result = collapseStyleDeclaration(style, shorthand, options);
    if (result) results.push(result);
  }
  return results;
}

return { getStyleLonghands, collapseStyleDeclaration, collapseStyleDeclarations };
}

export const { getStyleLonghands, collapseStyleDeclaration, collapseStyleDeclarations } = createStyleOperations(
  (property) => getLonghands(property),
  (property, declarations, options) => collapseToShorthand(property, declarations, options),
  () => SHORTHAND_PROPERTIES,
);
