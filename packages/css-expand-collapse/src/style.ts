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

export function getStyleLonghands(
  style: ReadonlyStyleDeclaration,
  shorthand: string,
): DeclarationMap {
  return styleToDeclarations(style, getLonghands(shorthand));
}

export function collapseStyleDeclaration(
  style: ReadonlyStyleDeclaration,
  shorthand: string,
  options?: TransformOptions,
): CollapseShorthandResult | null {
  const longhands = getLonghands(shorthand);
  const declarations = longhands.length
    ? styleToDeclarations(style, longhands)
    : styleToDeclarations(style);
  return collapseToShorthand(shorthand, declarations, options);
}

export function collapseStyleDeclarations(
  style: ReadonlyStyleDeclaration,
  shorthands: Iterable<string> = SHORTHAND_PROPERTIES,
  options?: TransformOptions,
): CollapseShorthandResult[] {
  const results: CollapseShorthandResult[] = [];
  for (const shorthand of shorthands) {
    const result = collapseStyleDeclaration(style, shorthand, options);
    if (result) results.push(result);
  }
  return results;
}
