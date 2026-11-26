import type { LonghandMap } from "./module.js";

export function longhandNames(longhands: LonghandMap): string[] {
  return [...longhands.keys()];
}

export function longhandInitialValues(longhands: LonghandMap): string[] {
  return [...longhands.values()];
}

/** Select the constituents used by transformation handlers and cascade logic. */
export function activeLonghands(
  longhands: LonghandMap,
  excludedLonghands: readonly string[] = [],
): LonghandMap {
  if (!excludedLonghands.length) return longhands;
  return new Map([...longhands].filter(([property]) => !excludedLonghands.includes(property)));
}
