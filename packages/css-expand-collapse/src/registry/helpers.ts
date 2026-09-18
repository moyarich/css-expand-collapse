import type { LonghandMap } from "./module.js";

export function longhandNames(longhands: LonghandMap): string[] {
  return [...longhands.keys()];
}

export function longhandInitialValues(longhands: LonghandMap): string[] {
  return [...longhands.values()];
}
