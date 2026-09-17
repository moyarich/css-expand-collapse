import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packageRoot = path.join(repoRoot, "packages/css-expand-collapse");
const shorthandRoot = path.join(packageRoot, "src/registry/shorthands");

const { getLonghands, SHORTHAND_PROPERTIES } = await import(
  path.join(packageRoot, "dist/index.js")
);

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function write(relativePath, content) {
  fs.writeFileSync(path.join(repoRoot, relativePath), content);
}

function evaluateInitialValues(text, shorthand) {
  if (shorthand === "all") return [];
  const match = text.match(/const initialValues\s*=\s*([\s\S]*?)\s+as const;/);
  if (!match) throw new Error(`Could not find initialValues in ${shorthand}.ts`);
  const value = Function(`"use strict"; return (${match[1]});`)();
  if (!Array.isArray(value)) throw new Error(`initialValues is not an array in ${shorthand}.ts`);
  return value.map((entry) => entry === null ? "initial" : String(entry));
}

function mapDeclaration(names, values) {
  if (!names.length) return "const longhands = new Map<string, string>();\n";
  const rows = names.map((name, index) => `  [${JSON.stringify(name)}, ${JSON.stringify(values[index])}],`).join("\n");
  return `const longhands = new Map([\n${rows}\n] as const);\n`;
}

function convertShorthandModule(shorthand) {
  const file = path.join(shorthandRoot, `${shorthand}.ts`);
  if (!fs.existsSync(file)) return;
  let text = fs.readFileSync(file, "utf8");
  if (!text.includes("satisfies ShorthandModule")) return;

  const names = getLonghands(shorthand);
  const values = evaluateInitialValues(text, shorthand);
  if (names.length !== values.length) {
    throw new Error(`${shorthand}: ${names.length} longhands but ${values.length} initial values`);
  }

  if (shorthand === "all") {
    text = text.replace(
      /export default \{\n\s*longhands: \[\],\n\s*initialValues: \[\],/,
      `${mapDeclaration([], [])}\nexport default {\n  longhands,`,
    );
    fs.writeFileSync(file, text);
    return;
  }

  const declaration = mapDeclaration(names, values);
  const longhandMatch = text.match(/const longhands\s*=\s*[\s\S]*?;\n/);
  if (!longhandMatch) throw new Error(`Could not find longhands declaration in ${shorthand}.ts`);
  text = text.replace(longhandMatch[0], declaration);
  text = text.replace(/const initialValues\s*=\s*[\s\S]*?\s+as const;\n/, "");

  // Factories now consume the LonghandMap directly.
  text = text
    .replace(/expandOrderedPair\(longhands,\s*initialValues\)/g, "expandOrderedPair(longhands)")
    .replace(/expandTriple\(longhands,\s*initialValues\)/g, "expandTriple(longhands)")
    .replace(/expandLogicalBorderAxis\(longhands,\s*initialValues\)/g, "expandLogicalBorderAxis(longhands)")
    .replace(/expandComponents\(longhands,\s*initialValues\)/g, "expandComponents(longhands)")
    .replace(/expandSlashPair\(longhands,\s*initialValues\)/g, "expandSlashPair(longhands)")
    .replace(/collapseSlashPair\(longhands,\s*initialValues\)/g, "collapseSlashPair(longhands)")
    .replace(/expandCsstreeComponents\(longhands,\s*\{\s*initialValues\s*\}\)/g, "expandCsstreeComponents(longhands)");

  // border needs the first side's three map entries for its parser.
  text = text.replace(
    /const expandTop = expandTriple\(longhands\.slice\(0, 3\),\s*initialValues\.slice\(0, 3\)\);/,
    "const expandTop = expandTriple(new Map([...longhands].slice(0, 3)));",
  );

  // The map is the source of truth. Complex modules may derive ordered views for
  // positional shorthand grammar, but they no longer own a second data table.
  const arrayMethods = ["map", "filter", "some", "every", "includes", "indexOf", "slice", "find", "findIndex", "at", "join"];
  for (const method of arrayMethods) {
    text = text.replace(new RegExp(`\\blonghands\\.${method}\\b`, "g"), `longhandNames.${method}`);
  }
  text = text.replace(/\blonghands\.length\b/g, "longhandNames.length");
  text = text.replace(/\blonghands\[/g, "longhandNames[");
  text = text.replace(/new Set\(longhands\)/g, "new Set(longhandNames)");
  text = text.replace(/for \(const ([^)]+) of longhands\)/g, "for (const $1 of longhandNames)");

  // Remove the old module metadata property.
  text = text
    .replace(/\n\s*initialValues,\n/g, "\n")
    .replace(/\{ longhands, initialValues, /g, "{ longhands, ");

  const needsNames = /\blonghandNames\b/.test(text);
  const needsInitials = /\binitialValues\b/.test(text);
  let derived = "";
  if (needsNames) derived += "const longhandNames = [...longhands.keys()];\n";
  if (needsInitials) derived += "const initialValues = [...longhands.values()];\n";
  if (derived) text = text.replace(declaration, `${declaration}${derived}`);

  // Longhand helper imports were only used to construct the old property arrays.
  text = text.replace(/^import \{[^\n]+\} from "\.\.\/helpers\.js";\n/m, "");

  fs.writeFileSync(file, text);
}

for (const shorthand of SHORTHAND_PROPERTIES) convertShorthandModule(shorthand);

write("packages/css-expand-collapse/src/registry/module.ts", `export type DeclarationMap = Record<string, string>;
export type LonghandMap = ReadonlyMap<string, string>;

export interface ShorthandExpandContext {
  matchProperty(property: string, value: string): boolean;
  splitWhitespace(value: string): string[];
  splitSlash(value: string): string[];
}

export interface ShorthandCollapseContext {
  matchProperty(property: string, value: string): boolean;
}

export type ShorthandExpander = (
  value: string,
  context: ShorthandExpandContext,
) => DeclarationMap | null;

export type ShorthandCollapser = (
  declarations: DeclarationMap,
  context: ShorthandCollapseContext,
) => string | null;

/**
 * Common contract implemented by every shorthand property module.
 * The CSS property name comes from the module filename.
 * Each map entry pairs a longhand with its CSS initial value.
 */
export interface ShorthandModule {
  readonly longhands: LonghandMap;
  readonly expand: ShorthandExpander;
  readonly collapse: ShorthandCollapser;
  /** False when a shorthand has cascade/reset effects beyond its registered longhands. */
  readonly safeToDropWhenFullyShadowed?: boolean;
}

export type ShorthandModuleMap = Readonly<Record<string, ShorthandModule>>;
`);

write("packages/css-expand-collapse/src/registry/types.ts", `export type {
  DeclarationMap,
  LonghandMap,
  ShorthandCollapseContext,
  ShorthandCollapser,
  ShorthandExpandContext,
  ShorthandExpander,
  ShorthandModule,
  ShorthandModuleMap,
} from "./module.js";
`);

write("packages/css-expand-collapse/src/registry/helpers.ts", `import type { LonghandMap } from "./module.js";

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
`);

write("packages/css-expand-collapse/src/registry/expanders.ts", `import { splitTopLevelComma } from "./context.js";
import {
  longhandInitialValues,
  longhandNames,
  sliceLonghands,
} from "./helpers.js";
import type {
  DeclarationMap,
  LonghandMap,
  ShorthandExpander,
} from "./types.js";

export function expandOrderedPair(longhands: LonghandMap): ShorthandExpander {
  const properties = longhandNames(longhands);
  const defaults = longhandInitialValues(longhands);

  return (value, context) => {
    if (properties.length !== 2) return null;
    const tokens = context.splitWhitespace(value);
    if (!tokens.length) return null;

    for (let split = 1; split < tokens.length; split += 1) {
      const first = tokens.slice(0, split).join(" ");
      const second = tokens.slice(split).join(" ");
      if (
        context.matchProperty(properties[0]!, first) &&
        context.matchProperty(properties[1]!, second)
      ) {
        return { [properties[0]!]: first, [properties[1]!]: second };
      }
    }

    if (context.matchProperty(properties[0]!, value)) {
      return { [properties[0]!]: value, [properties[1]!]: defaults[1]! };
    }

    return null;
  };
}

export interface CsstreeComponentOptions {
  /** Matching order used to resolve grammatically ambiguous tokens. */
  priority?: readonly string[];
  /** Parse comma-separated layers and join each longhand with the same layer count. */
  layered?: boolean;
}

export function expandCsstreeComponents(
  longhands: LonghandMap,
  options: CsstreeComponentOptions = {},
): ShorthandExpander {
  const properties = longhandNames(longhands);
  const defaults = longhandInitialValues(longhands);
  const priority = options.priority ?? properties;

  return (value, context) => {
    const layers = options.layered ? splitTopLevelComma(value) : [value];
    if (!layers.length || layers.some((layer) => !layer)) return null;

    const expandedLayers: DeclarationMap[] = [];

    for (const layer of layers) {
      const tokens = context.splitWhitespace(layer);
      if (!tokens.length) return null;

      const result = Object.fromEntries(
        properties.map((longhand, index) => [longhand, defaults[index]!]),
      ) as DeclarationMap;
      const assigned = new Set<string>();

      for (const token of tokens) {
        const candidates = priority.filter(
          (property) =>
            properties.includes(property) &&
            !assigned.has(property) &&
            context.matchProperty(property, token),
        );
        if (!candidates.length) return null;

        const property = candidates[0]!;
        result[property] = token;
        assigned.add(property);
      }

      expandedLayers.push(result);
    }

    return Object.fromEntries(
      properties.map((longhand) => [
        longhand,
        expandedLayers.map((layer) => layer[longhand]!).join(", "),
      ]),
    );
  };
}

export function expandQuad(longhands: LonghandMap): ShorthandExpander {
  const properties = longhandNames(longhands);
  return (value, context) => {
    const tokens = context.splitWhitespace(value);
    if (tokens.includes("/") || tokens.length < 1 || tokens.length > 4 || properties.length !== 4) return null;
    const [a, b = a, c = a, d = b] = tokens;
    const values = tokens.length === 3 ? [a, b, c, b] : [a, b, c, d];
    return Object.fromEntries(
      properties.map((property, index) => [property, values[index]!]),
    ) as DeclarationMap;
  };
}

export function expandPair(longhands: LonghandMap): ShorthandExpander {
  const properties = longhandNames(longhands);
  return (value, context) => {
    const tokens = context.splitWhitespace(value);
    if (tokens.length < 1 || tokens.length > 2 || properties.length !== 2) return null;
    const [first, second = first] = tokens;
    return { [properties[0]!]: first!, [properties[1]!]: second! };
  };
}

export function expandTriple(longhands: LonghandMap): ShorthandExpander {
  const properties = longhandNames(longhands);
  const defaults = longhandInitialValues(longhands);

  return (value, context) => {
    const tokens = context.splitWhitespace(value);
    if (!tokens.length || properties.length !== 3) return null;

    const result: DeclarationMap = {
      [properties[0]!]: defaults[0]!,
      [properties[1]!]: defaults[1]!,
      [properties[2]!]: defaults[2]!,
    };
    const assigned = new Set<string>();

    for (const token of tokens) {
      const matches = properties.filter(
        (property) => !assigned.has(property) && context.matchProperty(property, token),
      );
      if (matches.length !== 1) return null;
      result[matches[0]!] = token;
      assigned.add(matches[0]!);
    }

    return result;
  };
}

export function expandLogicalBorderAxis(longhands: LonghandMap): ShorthandExpander {
  const properties = longhandNames(longhands);
  const expandSide = expandTriple(sliceLonghands(longhands, 0, 3));

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

export function expandComponents(longhands: LonghandMap): ShorthandExpander {
  const properties = longhandNames(longhands);
  const defaults = longhandInitialValues(longhands);

  return (value, context) => {
    const tokens = context.splitWhitespace(value);
    if (!tokens.length) return null;

    const result = Object.fromEntries(
      properties.map((longhand, index) => [longhand, defaults[index]!]),
    ) as DeclarationMap;
    const assigned = new Set<string>();

    for (const token of tokens) {
      const candidates = properties
        .filter((longhand) => !assigned.has(longhand))
        .filter((longhand) => context.matchProperty(longhand, token));

      if (candidates.length === 1) {
        result[candidates[0]!] = token;
        assigned.add(candidates[0]!);
        continue;
      }

      const initialMatches = candidates.filter((longhand) => longhands.get(longhand) === token);

      if (initialMatches.length === candidates.length && initialMatches.length > 1) {
        for (const longhand of initialMatches) {
          result[longhand] = token;
          assigned.add(longhand);
        }
        continue;
      }

      return null;
    }

    return result;
  };
}

export function expandSlashPair(longhands: LonghandMap): ShorthandExpander {
  const properties = longhandNames(longhands);
  const defaults = longhandInitialValues(longhands);

  return (value, context) => {
    const parts = context.splitSlash(value);
    if (properties.length !== 2 || parts.length < 1 || parts.length > 2 || parts.some((part) => !part)) return null;

    return {
      [properties[0]!]: parts[0]!,
      [properties[1]!]: parts[1] ?? defaults[1]!,
    };
  };
}
`);

write("packages/css-expand-collapse/src/registry/collapsers.ts", `import { longhandNames } from "./helpers.js";
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
    if (top === bottom && right === left) return `${top} ${right}`;
    if (right === left) return `${top} ${right} ${bottom}`;
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
    return second === longhands.get(properties[1]!) ? first! : `${first} / ${second}`;
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
`);

let registryIndex = read("packages/css-expand-collapse/src/registry/index.ts");
registryIndex = registryIndex
  .replace("export type { ShorthandModule, ShorthandModuleMap } from \"./module.js\";", "export type { LonghandMap, ShorthandModule, ShorthandModuleMap } from \"./module.js\";")
  .replace("    if (!module.longhands.length) continue;", "    if (!module.longhands.size) continue;")
  .replace("    for (const longhand of module.longhands) {", "    for (const longhand of module.longhands.keys()) {");
write("packages/css-expand-collapse/src/registry/index.ts", registryIndex);

let core = read("packages/css-expand-collapse/src/core.ts");
core = core
  .replace("export type { DeclarationMap } from \"./registry.js\";", "export type { DeclarationMap, LonghandMap } from \"./registry.js\";")
  .replace("  return [...(SHORTHAND_DEFINITIONS[normalizeProperty(shorthand)]?.longhands ?? [])];", "  return [...(SHORTHAND_DEFINITIONS[normalizeProperty(shorthand)]?.longhands.keys() ?? [])];")
  .replace("      definition.longhands.map((longhand) => [longhand, normalizedValue]),", "      [...definition.longhands.keys()].map((longhand) => [longhand, normalizedValue]),")
  .replace(/  definition\.longhands\.forEach\(\(longhand, index\) => \{[\s\S]*?  \}\);/, `  for (const [longhand, initialValue] of definition.longhands) {
    if (Object.hasOwn(completed, longhand)) continue;
    completed[longhand] = initialValue;
  }`)
  .replace("  const consumed = definition.longhands.filter((longhand) => Object.hasOwn(normalized, longhand));", "  const consumed = [...definition.longhands.keys()].filter((longhand) => Object.hasOwn(normalized, longhand));")
  .replace("  const concrete = definition.longhands.map((longhand) => completed[longhand]);", "  const concrete = [...definition.longhands.keys()].map((longhand) => completed[longhand]);")
  .replace("      definition.longhands.map((longhand) => [longhand, completed[longhand]!] ),", "      [...definition.longhands.keys()].map((longhand) => [longhand, completed[longhand]!] ),")
  .replace("      definition.longhands.map((longhand) => [longhand, completed[longhand]!]),", "      [...definition.longhands.keys()].map((longhand) => [longhand, completed[longhand]!]),")
  .replace("    .sort(([, a], [, b]) => b.longhands.length - a.longhands.length)", "    .sort(([, a], [, b]) => b.longhands.size - a.longhands.size)");
write("packages/css-expand-collapse/src/core.ts", core);

let css = read("packages/css-expand-collapse/src/css.ts");
css = css
  .replace("  .filter(([, definition]) => definition.longhands.length > 0)", "  .filter(([, definition]) => definition.longhands.size > 0)")
  .replace("  .sort(([, a], [, b]) => b.longhands.length - a.longhands.length);", "  .sort(([, a], [, b]) => b.longhands.size - a.longhands.size);")
  .replace(/for \(const longhand of definition\.longhands\)/g, "for (const longhand of definition.longhands.keys())")
  .replace("  return Boolean(definition?.longhands.some((longhand) => expected.has(longhand)));", "  return Boolean(definition && [...definition.longhands.keys()].some((longhand) => expected.has(longhand)));")
  .replace("    if (!definition.longhands.every((longhand) => expected.has(longhand))) continue;", "    if (![...definition.longhands.keys()].every((longhand) => expected.has(longhand))) continue;")
  .replace("    if (!definition.longhands.includes(firstProperty)) continue;", "    if (!definition.longhands.has(firstProperty)) continue;")
  .replace("    const expected = new Set(definition.longhands);", "    const expected = new Set(definition.longhands.keys());")
  .replace(/    const canFillMissing =\n      options\?\.fillMissingLonghands === "initial" &&\n      definition\.initialValues\.length === definition\.longhands\.length;/, "    const canFillMissing = options?.fillMissingLonghands === \"initial\";");
write("packages/css-expand-collapse/src/css.ts", css);

let publicIndex = read("packages/css-expand-collapse/src/index.ts");
publicIndex = publicIndex.replace(
  "export type {\n  CollapseResult,\n  DeclarationMap,\n  TransformOptions,\n} from \"./core.js\";",
  "export type {\n  CollapseResult,\n  DeclarationMap,\n  LonghandMap,\n  TransformOptions,\n} from \"./core.js\";",
);
write("packages/css-expand-collapse/src/index.ts", publicIndex);

let registryTest = read("packages/css-expand-collapse/tests/registry-modules.test.ts");
registryTest = registryTest
  .replace("      expect(Array.isArray(module.longhands)).toBe(true);\n      expect(Array.isArray(module.initialValues)).toBe(true);\n      expect(module.initialValues).toHaveLength(module.longhands.length);\n      expect(module.initialValues.every((value) => value === null || typeof value === \"string\")).toBe(true);", "      expect(module.longhands).toBeInstanceOf(Map);\n      expect([...module.longhands.keys()].every((value) => typeof value === \"string\")).toBe(true);\n      expect([...module.longhands.values()].every((value) => typeof value === \"string\")).toBe(true);\n      expect(\"initialValues\" in module).toBe(false);")
  .replace("    expect(SHORTHAND_MODULES.all.longhands).toEqual([]);\n    expect(SHORTHAND_MODULES.all.initialValues).toEqual([]);", "    expect([...SHORTHAND_MODULES.all.longhands]).toEqual([]);");
write("packages/css-expand-collapse/tests/registry-modules.test.ts", registryTest);

let apiTypes = read("apps/playground/src/APIPlayground/packageTypes.ts");
apiTypes = apiTypes.replace(
  "  export type DeclarationMap = Record<string, string>;",
  "  export type DeclarationMap = Record<string, string>;\n  export type LonghandMap = ReadonlyMap<string, string>;",
);
write("apps/playground/src/APIPlayground/packageTypes.ts", apiTypes);

for (const docPath of ["docs/README-dev.md", "packages/css-expand-collapse/src/registry/README.md"]) {
  let doc = read(docPath);
  doc = doc
    .replace("  readonly longhands: readonly string[];\n  readonly initialValues: readonly (string | null)[];", "  readonly longhands: LonghandMap;")
    .replace("Declare its `longhands` and required `initialValues`.", "Declare its `longhands` map, pairing each longhand with its initial value.")
    .replace(/const longhands = quad\("margin"\);\nconst initialValues = \["0", "0", "0", "0"\] as const;/g, `const longhands = new Map([
  ["margin-top", "0"],
  ["margin-right", "0"],
  ["margin-bottom", "0"],
  ["margin-left", "0"],
] as const);`)
    .replace(/\n\s*initialValues,\n/g, "\n");
  write(docPath, doc);
}

// Ensure the new model is complete and no source module retains independent initial-value metadata.
const moduleFiles = fs.readdirSync(shorthandRoot).filter((name) => name.endsWith(".ts"));
for (const name of moduleFiles) {
  const text = fs.readFileSync(path.join(shorthandRoot, name), "utf8");
  if (!text.includes("satisfies ShorthandModule")) continue;
  if (!text.includes("new Map")) throw new Error(`${name} does not define longhands as a Map`);
  const exportBlock = text.slice(text.lastIndexOf("export default"));
  if (/\binitialValues\b/.test(exportBlock)) throw new Error(`${name} still exports initialValues metadata`);
}

console.log(`Refactored ${SHORTHAND_PROPERTIES.length} shorthand modules to LonghandMap.`);
