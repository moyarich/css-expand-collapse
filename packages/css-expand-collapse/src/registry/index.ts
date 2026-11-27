import { activeLonghands, getModuleCapabilities } from "./helpers.js";
import { SHORTHANDS } from "./shorthands/index.js";
import type {
  LonghandValueEquivalence,
  ShorthandModule,
  ShorthandModuleMap,
} from "./module.js";

export type {
  LonghandMap,
  LonghandValueEquivalence,
  ShorthandModule,
  ShorthandModuleMap,
} from "./module.js";
export type {
  DeclarationMap,
  ShorthandCollapseContext,
  ShorthandCollapser,
  ShorthandExpandContext,
  ShorthandExpander,
} from "./types.js";

export function createRegistry(modules: ShorthandModuleMap = SHORTHANDS) {
  const visiting = new Set<string>();
  const visited = new Set<string>();
  function visit(property: string): void {
    if (visiting.has(property)) throw new Error("Cyclic shorthand constituent: " + property);
    if (visited.has(property)) return;
    visiting.add(property);
    const module = modules[property]!;
    for (const child of module.longhands.keys()) {
      if (Object.hasOwn(modules, child)) visit(child);
    }
    visiting.delete(property);
    visited.add(property);
  }
  for (const [property, module] of Object.entries(modules)) {
    if (!module || !(module.longhands instanceof Map) || (module.expand !== undefined && typeof module.expand !== "function") || (module.collapse !== undefined && typeof module.collapse !== "function")) throw new Error("Invalid shorthand module: " + property);
    for (const [name, value] of module.longhands) {
      if (!/^-?[a-z][a-z0-9-]*$/.test(name) || typeof value !== "string") throw new Error("Invalid constituent: " + name);
    }
    for (const name of [...(module.excludedLonghands ?? []), ...(module.resetOnlyLonghands ?? [])]) {
      if (!module.longhands.has(name)) throw new Error("Unknown constituent: " + name);
    }
  }
  for (const property of Object.keys(modules)) visit(property);
  const SHORTHAND_MODULES: ShorthandModuleMap = Object.freeze(Object.fromEntries(
    Object.entries(modules).map(([property, module]) => [property, {
      ...module,
      resetOnlyLonghands: module.resetOnlyLonghands ? [...module.resetOnlyLonghands] : undefined,
      longhands: new Map(module.longhands),
      excludedLonghands: module.excludedLonghands ? [...module.excludedLonghands] : undefined,
      equivalentLonghandValues: module.equivalentLonghandValues ? new Map(module.equivalentLonghandValues) : undefined,
    }]),
  ));
  const shorthandEntries = Object.entries(SHORTHAND_MODULES);
  function buildDefinitions(): ShorthandModuleMap {
  const definitions: Record<string, ShorthandModule> = {};
  for (const [property, module] of shorthandEntries) {
    const longhands = activeLonghands(module.longhands, module.excludedLonghands);
    const capabilities = getModuleCapabilities(module);
    if (!capabilities.expand && !capabilities.collapse) continue;
    definitions[property] = longhands === module.longhands && capabilities.expand && capabilities.collapse ? module : { ...module, longhands, safeToDropWhenFullyShadowed: false };
  }
  return Object.freeze(definitions);
}

const SHORTHAND_PROPERTIES = Object.freeze(
  Object.keys(SHORTHAND_MODULES),
);
const SHORTHAND_DEFINITIONS = buildDefinitions();
const SHORTHAND_SET = new Set<string>(SHORTHAND_PROPERTIES);

const LONGHAND_TO_SHORTHANDS = (() => {
  const map = new Map<string, string[]>();
  for (const [shorthand, module] of shorthandEntries) {
    for (const longhand of module.longhands.keys()) {
      const values = map.get(longhand) ?? [];
      values.push(shorthand);
      map.set(longhand, values);
    }
  }
  return map;
})();

const LONGHAND_VALUE_EQUIVALENCE = (() => {
  const map = new Map<string, LonghandValueEquivalence[]>();
  for (const [, module] of shorthandEntries) {
    for (const [longhand, equivalent] of module.equivalentLonghandValues ??
      []) {
      if (module.excludedLonghands?.includes(longhand)) continue;
      const rules = map.get(longhand) ?? [];
      rules.push(equivalent);
      map.set(longhand, rules);
    }
  }
  return map;
})();

  return { SHORTHAND_MODULES, SHORTHAND_PROPERTIES, SHORTHAND_DEFINITIONS, SHORTHAND_SET, LONGHAND_TO_SHORTHANDS, LONGHAND_VALUE_EQUIVALENCE };
}

export const { SHORTHAND_MODULES, SHORTHAND_PROPERTIES, SHORTHAND_DEFINITIONS, SHORTHAND_SET, LONGHAND_TO_SHORTHANDS, LONGHAND_VALUE_EQUIVALENCE } = createRegistry();
