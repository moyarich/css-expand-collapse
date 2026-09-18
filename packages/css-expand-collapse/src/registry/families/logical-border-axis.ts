import { collapseTriple } from "../collapsers.js";
import { expandTriple } from "../expanders.js";
import type { LonghandMap, ShorthandCollapser, ShorthandExpander } from "../types.js";

export function expandLogicalBorderAxis(longhands: LonghandMap): ShorthandExpander {
  const properties = [...longhands.keys()];
  const expandSide = expandTriple(new Map([...longhands].slice(0, 3)));

  return (value, context) => {
    if (properties.length !== 6) return null;
    const firstSide = expandSide(value, context);
    if (!firstSide) return null;

    return {
      [properties[0]!]: firstSide[properties[0]!]!,
      [properties[1]!]: firstSide[properties[1]!]!,
      [properties[2]!]: firstSide[properties[2]!]!,
      [properties[3]!]: firstSide[properties[0]!]!,
      [properties[4]!]: firstSide[properties[1]!]!,
      [properties[5]!]: firstSide[properties[2]!]!,
    };
  };
}

export function collapseLogicalBorderAxis(longhands: LonghandMap): ShorthandCollapser {
  const properties = [...longhands.keys()];
  const collapseSide = collapseTriple(new Map([...longhands].slice(0, 3)));

  return (declarations, context) => {
    if (properties.length !== 6) return null;
    const values = properties.map((property) => declarations[property]?.trim());
    if (values.some((value) => !value)) return null;
    if (!values.slice(0, 3).every((value, index) => value === values[index + 3])) return null;
    return collapseSide(declarations, context);
  };
}
