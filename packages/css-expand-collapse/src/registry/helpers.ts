import type { LonghandMap, ShorthandModule, ShorthandCapabilities } from "./module.js";

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

/** Active directions require both a handler and at least one active constituent. */
export function getModuleCapabilities(module: ShorthandModule): ShorthandCapabilities {
  const active = activeLonghands(module.longhands, module.excludedLonghands).size > 0;
  return Object.freeze({ expand: active && typeof module.expand === "function", collapse: active && typeof module.collapse === "function" });
}
