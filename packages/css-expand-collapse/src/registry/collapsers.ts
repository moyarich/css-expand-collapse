import { longhandNames } from "./helpers.js";
import type { DeclarationMap, LonghandMap, ShorthandCollapser } from "./module.js";

const GLOBAL_VALUES = new Set(["inherit", "initial", "unset", "revert", "revert-layer"]);

function concreteValues(
  longhands: LonghandMap,
  declarations: DeclarationMap,
): string[] | null {
  const values = longhandNames(longhands).map((property) => declarations[property]?.trim());
  return values.some((value) => !value) ? null : values as string[];
}

function globalValue(values: readonly string[]): string | null {
  const first = values[0];
  return first && values.every((value) => value === first) && GLOBAL_VALUES.has(first)
    ? first
    : null;
}

export function collapseQuad(longhands: LonghandMap): ShorthandCollapser {
  return (declarations) => {
    const values = concreteValues(longhands, declarations);
    if (!values || values.length !== 4) return null;
    const global = globalValue(values);
    if (global) return global;
    const [top, right, bottom, left] = values;
    if (top === right && top === bottom && top === left) return top!;
    if (top === bottom && right === left) return top + " " + right;
    if (right === left) return top + " " + right + " " + bottom;
    return values.join(" ");
  };
}

export function collapsePair(longhands: LonghandMap): ShorthandCollapser {
  return (declarations) => {
    const values = concreteValues(longhands, declarations);
    if (!values || values.length !== 2) return null;
    const global = globalValue(values);
    if (global) return global;
    return values[0] === values[1] ? values[0]! : values.join(" ");
  };
}

export function collapseTriple(longhands: LonghandMap): ShorthandCollapser {
  return (declarations) => {
    const values = concreteValues(longhands, declarations);
    if (!values || values.length !== 3) return null;
    return globalValue(values) ?? values.join(" ");
  };
}

export function collapseComponents(longhands: LonghandMap): ShorthandCollapser {
  return (declarations) => {
    const values = concreteValues(longhands, declarations);
    if (!values) return null;
    return globalValue(values) ?? values.join(" ");
  };
}

export function collapseSlashPair(longhands: LonghandMap): ShorthandCollapser {
  const properties = longhandNames(longhands);
  return (declarations) => {
    const values = concreteValues(longhands, declarations);
    if (!values || values.length !== 2 || properties.length !== 2) return null;
    const global = globalValue(values);
    if (global) return global;
    const [first, second] = values;
    return second === longhands.get(properties[1]!) ? first! : first + " / " + second;
  };
}

export function collapseLogicalBorderAxis(longhands: LonghandMap): ShorthandCollapser {
  return (declarations) => {
    const values = concreteValues(longhands, declarations);
    if (!values || values.length !== 6) return null;
    const global = globalValue(values);
    if (global) return global;
    const first = values.slice(0, 3);
    const second = values.slice(3, 6);
    if (!first.every((value, index) => value === second[index])) return null;
    return first.join(" ");
  };
}
