import type { LonghandMap } from "./module.js";

export function longhandNames(longhands: LonghandMap): string[] {
  return [...longhands.keys()];
}

export function longhandInitialValues(longhands: LonghandMap): string[] {
  return [...longhands.values()];
}

export function sliceLonghands(
  longhands: LonghandMap,
  start: number,
  end?: number,
): LonghandMap {
  return new Map([...longhands].slice(start, end));
}
