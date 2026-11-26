import remapping from "@jridgewell/remapping";
import {
  generate,
  List,
  parse,
  walk,
  type CssNode,
  type Declaration,
  type DeclarationList,
  type StyleSheet,
} from "css-tree";
import {
  isCustomProperty,
  mergeCustomProperties,
  type CustomPropertyMap,
} from "./custom-properties.js";
import {
  collapseToShorthand,
  expandShorthand,
  isShorthand,
  supportsTransform,
  type DeclarationMap,
  type TransformOptions,
} from "./core.js";
import {
  LONGHAND_VALUE_EQUIVALENCE,
  SHORTHAND_DEFINITIONS,
} from "./registry/index.js";
import { splitTopLevelComma } from "./registry/context.js";
import { describeExpansionFailure } from "./transform-diagnostics.js";
import { syntaxDiagnostic } from "./validation/diagnostics.js";

export type TransformMode = "expand" | "collapse";

export interface TransformCssOptions extends TransformOptions {
  mode: TransformMode;
}

type SourceDeclaration = { property: string; location: NonNullable<Declaration["loc"]> };
type ProvenanceStore = WeakMap<Declaration, SourceDeclaration[]>;

function authoredDeclaration(node: Declaration): SourceDeclaration[] {
  return node.loc ? [{ property: node.property, location: node.loc }] : [];
}

type EffectiveDeclaration = {
  value: string;
  important: boolean;
};

type CascadedCustomProperty = {
  value: string;
  important: boolean;
  specificity: number;
  order: number;
};

function makeDeclaration(
  property: string,
  value: string,
  important = false,
  location?: Declaration["loc"],
): Declaration {
  const node = parse(`${property}:${value}${important ? "!important" : ""}`, {
    context: "declaration",
  }) as Declaration;
  if (location) node.loc = location;
  return node;
}

function declarationValue(node: Declaration): string {
  return generate(node.value).trim();
}

function normalizeProperty(property: string): string {
  const trimmed = property.trim();
  return isCustomProperty(trimmed) ? trimmed : trimmed.toLowerCase();
}

function shouldReplaceCustomProperty(
  current: CascadedCustomProperty | undefined,
  candidate: CascadedCustomProperty,
): boolean {
  if (!current) return true;
  if (current.important !== candidate.important) return candidate.important;
  if (current.specificity !== candidate.specificity) {
    return candidate.specificity > current.specificity;
  }
  return candidate.order >= current.order;
}

function collectBlockCustomProperties(
  children: CssNode[],
): Record<string, string> {
  const cascade = new Map<string, CascadedCustomProperty>();

  for (let index = 0; index < children.length; index += 1) {
    const node = children[index];
    if (node?.type !== "Declaration" || !isCustomProperty(node.property))
      continue;

    const name = node.property.trim();
    const candidate: CascadedCustomProperty = {
      value: declarationValue(node),
      important: Boolean(node.important),
      specificity: 0,
      order: index,
    };

    if (shouldReplaceCustomProperty(cascade.get(name), candidate)) {
      cascade.set(name, candidate);
    }
  }

  return Object.fromEntries(
    [...cascade].map(([name, declaration]) => [name, declaration.value]),
  );
}

function globalSelectorSpecificity(selectorText: string): number | null {
  const scores = splitTopLevelComma(selectorText).flatMap((selector) => {
    const normalized = selector.replace(/\s+/g, "").toLowerCase();
    switch (normalized) {
      case "html":
        return [1];
      case ":root":
      case ":host":
        return [10];
      case "html:root":
        return [11];
      default:
        return [];
    }
  });

  return scores.length ? Math.max(...scores) : null;
}

function collectGlobalCustomProperties(
  ast: StyleSheet,
): Record<string, string> {
  const cascade = new Map<string, CascadedCustomProperty>();
  const topLevel = ast.children?.toArray?.() ?? [];

  for (let ruleIndex = 0; ruleIndex < topLevel.length; ruleIndex += 1) {
    const rule = topLevel[ruleIndex];
    if (rule?.type !== "Rule" || !rule.block) continue;

    const specificity = globalSelectorSpecificity(generate(rule.prelude));
    if (specificity === null) continue;

    const declarations = rule.block.children?.toArray?.() ?? [];
    for (
      let declarationIndex = 0;
      declarationIndex < declarations.length;
      declarationIndex += 1
    ) {
      const node = declarations[declarationIndex];
      if (node?.type !== "Declaration" || !isCustomProperty(node.property))
        continue;

      const name = node.property.trim();
      const candidate: CascadedCustomProperty = {
        value: declarationValue(node),
        important: Boolean(node.important),
        specificity,
        order: ruleIndex * 100000 + declarationIndex,
      };

      if (shouldReplaceCustomProperty(cascade.get(name), candidate)) {
        cascade.set(name, candidate);
      }
    }
  }

  return Object.fromEntries(
    [...cascade].map(([name, declaration]) => [name, declaration.value]),
  );
}

function scopedTransformOptions(
  options: TransformOptions | undefined,
  customProperties: CustomPropertyMap,
): TransformOptions {
  return {
    ...options,
    customProperties,
  };
}

function canonicalizeCssValue(value: string): string {
  try {
    return generate(parse(value, { context: "value" })).trim();
  } catch {
    return value.trim();
  }
}

function valuesEquivalent(
  property: string,
  left: string,
  right: string,
): boolean {
  const a = canonicalizeCssValue(left);
  const b = canonicalizeCssValue(right);
  if (a === b) return true;

  return (
    LONGHAND_VALUE_EQUIVALENCE.get(property)?.some((equivalent) =>
      equivalent(a, b),
    ) ?? false
  );
}

function expandBlock(
  children: CssNode[],
  options?: TransformOptions,
  provenance?: ProvenanceStore,
): CssNode[] {
  const output: CssNode[] = [];
  for (const child of children) {
    if (child.type !== "Declaration") {
      output.push(child);
      continue;
    }

    const expanded = expandShorthand(
      child.property,
      declarationValue(child),
      { customProperties: options?.customProperties },
    );
    if (!expanded) {
      if (isShorthand(child.property) && options?.onDiagnostic) {
        options.onDiagnostic({
          ...describeExpansionFailure(child.property, declarationValue(child),
            supportsTransform(child.property), options.customProperties),
          location: child.loc ?? undefined,
        });
      }
      output.push(child);
      continue;
    }

    for (const [property, value] of Object.entries(expanded.declarations)) {
      const node = makeDeclaration(property, value, Boolean(child.important), child.loc);
      provenance?.set(node, authoredDeclaration(child));
      output.push(node);
    }
  }
  return output;
}

const COLLAPSE_CANDIDATES = Object.entries(SHORTHAND_DEFINITIONS)
  .filter(([, definition]) => definition.longhands.size > 0)
  .sort(([, a], [, b]) => b.longhands.size - a.longhands.size);

function declarationWouldApply(
  current: EffectiveDeclaration | undefined,
  important: boolean,
): boolean {
  return important || !current?.important;
}

/**
 * Computed-style/export CSS commonly contains a shorthand followed by every one of
 * its resolved longhands. Remove declarations that exactly restate the effective
 * value established earlier in the same block.
 *
 * Different later longhand values are preserved here. A later collapse pass can then
 * combine a complete set of those overrides and remove an earlier shorthand when the
 * cascade proves that shorthand is fully overridden.
 */
function removeRedundantDeclarations(
  children: CssNode[],
  options?: TransformOptions,
): CssNode[] {
  const output: CssNode[] = [];
  const effective = new Map<string, EffectiveDeclaration>();
  const hasPositionAxes = children.some((node) => node.type === "Declaration" && isBackgroundPositionAxis(normalizeProperty(node.property)));
  const hasBackground = children.some((node) => node.type === "Declaration" && normalizeProperty(node.property) === "background");
  if (hasPositionAxes && hasBackground) return children;

  for (const child of children) {
    if (child.type !== "Declaration") {
      output.push(child);
      continue;
    }

    const property = normalizeProperty(child.property);
    const value = declarationValue(child);
    const important = Boolean(child.important);
    const definition = SHORTHAND_DEFINITIONS[property];
    const currentValue = effective.get(property);
    if (
      property === "background-position" &&
      currentValue &&
      currentValue.important === important &&
      valuesEquivalent(property, currentValue.value, value)
    ) {
      continue;
    }

    if (definition) {
      const expanded = expandShorthand(property, value, { customProperties: options?.customProperties });

      if (expanded) {
        const entries = Object.entries(expanded.declarations);
        const changesEffectiveValue = entries.some(
          ([longhand, longhandValue]) => {
            const current = effective.get(longhand);
            if (!declarationWouldApply(current, important)) return false;
            return (
              !current ||
              !valuesEquivalent(longhand, current.value, longhandValue) ||
              current.important !== important
            );
          },
        );

        // Modules whose registered longhand set fully describes their effect can be
        // removed when they are exact restatements. Reset-heavy shorthands opt out
        // through safeToDropWhenFullyShadowed.
        if (
          definition.safeToDropWhenFullyShadowed === false ||
          changesEffectiveValue
        ) {
          output.push(child);
        }

        for (const [longhand, longhandValue] of entries) {
          const current = effective.get(longhand);
          if (!declarationWouldApply(current, important)) continue;
          effective.set(longhand, { value: longhandValue, important });
        }
        continue;
      }

      for (const longhand of definition.longhands.keys()) {
        const current = effective.get(longhand);
        if (declarationWouldApply(current, important))
          effective.delete(longhand);
      }
      output.push(child);
      continue;
    }

    const current = effective.get(property);
    if (!declarationWouldApply(current, important)) continue;

    if (
      current &&
      valuesEquivalent(property, current.value, value) &&
      current.important === important
    ) {
      continue;
    }

    output.push(child);
    effective.set(property, { value, important });
  }

  return output;
}

function isBackgroundPositionAxis(property: string): boolean {
  return /^background-position-(?:x|y|block|inline)$/.test(property);
}

function overlapsCandidate(property: string, expected: Set<string>): boolean {
  if (expected.has("background-position") && isBackgroundPositionAxis(property)) return true;
  if ([...expected].some(isBackgroundPositionAxis) && (property === "background" || property === "background-position" || isBackgroundPositionAxis(property))) return true;
  const definition = SHORTHAND_DEFINITIONS[property];
  return Boolean(
    definition &&
    [...definition.longhands.keys()].some((longhand) => expected.has(longhand)),
  );
}

function findFullyShadowedEarlierShorthands(
  children: CssNode[],
  beforeIndex: number,
  expected: Set<string>,
  replacementImportant: boolean,
): number[] {
  const shadowed: number[] = [];

  for (let cursor = 0; cursor < beforeIndex; cursor += 1) {
    const node = children[cursor];
    if (node.type !== "Declaration") continue;

    const property = normalizeProperty(node.property);
    const definition = SHORTHAND_DEFINITIONS[property];
    if (!definition || definition.safeToDropWhenFullyShadowed === false)
      continue;

    if (
      ![...definition.longhands.keys()].every((longhand) =>
        expected.has(longhand),
      )
    ) {
      continue;
    }

    if (Boolean(node.important) && !replacementImportant) continue;
    shadowed.push(cursor);
  }

  return shadowed;
}

/**
 * Find a collapsible shorthand starting at `index`. Longhands do not need to be
 * contiguous; unrelated declarations and comments may appear between them.
 *
 * By default every constituent longhand must be present. When
 * `fillMissingLonghands: "initial"` is enabled, a partial set may collapse by filling
 * omitted constituents from the module-owned LonghandMap. That opt-in is intended for
 * computed/export CSS; it can change raw stylesheet semantics by explicitly setting
 * previously omitted values.
 */
function tryCollapseAt(
  children: CssNode[],
  index: number,
  consumed: Set<number>,
  options?: TransformOptions,
): { node: Declaration; indices: number[]; shadowedIndices: number[] } | null {
  const first = children[index];
  if (!first || first.type !== "Declaration" || consumed.has(index))
    return null;

  const firstProperty = normalizeProperty(first.property);

  for (const [shorthand, definition] of COLLAPSE_CANDIDATES) {
    if (!definition.longhands.has(firstProperty)) continue;

    const expected = new Set(definition.longhands.keys());
    const matches = new Map<string, { node: Declaration; index: number }>();
    const important = Boolean(first.important);
    const canFillMissing = options?.fillMissingLonghands === "initial";
    let blocked: "mixed-priority" | "duplicate-longhand" | "overlapping-shorthand" | undefined;
    const report = (reason: NonNullable<import("./transform-diagnostics.js").TransformDiagnostic["reason"]>, message: string) => {
      options?.onDiagnostic?.({
        code: "collapse-not-safe",
        severity: "info",
        property: shorthand,
        location: first.loc ?? undefined,
        reason,
        message,
      });
    };

    for (let cursor = index; cursor < children.length; cursor += 1) {
      if (consumed.has(cursor)) continue;
      const node = children[cursor];
      if (node.type !== "Declaration") continue;

      const property = normalizeProperty(node.property);

      if (expected.has(property)) {
        if (Boolean(node.important) !== important || matches.has(property)) {
          blocked = Boolean(node.important) !== important ? "mixed-priority" : "duplicate-longhand";
          break;
        }
        matches.set(property, { node, index: cursor });
        if (matches.size === expected.size) break;
        continue;
      }

      if (overlapsCandidate(property, expected)) {
        blocked = "overlapping-shorthand";
        break;
      }
    }

    if (blocked) {
      report(blocked, "Candidate longhands conflict with declaration order or priority.");
      continue;
    }

    const complete = matches.size === expected.size;
    if (!complete && !canFillMissing) {
      report("missing-longhands", "Candidate is missing required longhands.");
      continue;
    }

    if (!complete) {
      let earlierOverlap = false;
      for (let cursor = 0; cursor < index; cursor += 1) {
        const node = children[cursor];
        if (node.type !== "Declaration") continue;
        if (overlapsCandidate(normalizeProperty(node.property), expected)) {
          earlierOverlap = true;
          break;
        }
      }
      if (earlierOverlap) {
        report("overlapping-shorthand", "Earlier shorthand prevents safely filling omitted longhands.");
        continue;
      }
    }

    const declarations: DeclarationMap = {};
    for (const [property, match] of matches) {
      declarations[property] = declarationValue(match.node);
    }

    const collapsed = collapseToShorthand(shorthand, declarations, { ...options, onDiagnostic: undefined });
    if (!collapsed) {
      report("incompatible-values", "Candidate longhands could not be collapsed safely.");
      continue;
    }

    return {
      node: makeDeclaration(collapsed.property, collapsed.value, important, first.loc),
      indices: [...matches.values()].map((match) => match.index),
      shadowedIndices: complete
        ? findFullyShadowedEarlierShorthands(
            children,
            index,
            expected,
            important,
          )
        : [],
    };
  }

  return null;
}

function collapseBlock(
  children: CssNode[],
  options?: TransformOptions,
  provenance?: ProvenanceStore,
): CssNode[] {
  const hasPositionAxes = children.some((node) => node.type === "Declaration" && isBackgroundPositionAxis(normalizeProperty(node.property)));
  const hasBackground = children.some((node) => node.type === "Declaration" && normalizeProperty(node.property) === "background");
  if (hasPositionAxes && hasBackground) return children;
  const consumed = new Set<number>();
  const replacements = new Map<number, Declaration>();

  for (let index = 0; index < children.length; index += 1) {
    if (consumed.has(index)) continue;

    const collapsed = tryCollapseAt(children, index, consumed, options);
    if (!collapsed) continue;

    replacements.set(index, collapsed.node);
    if (provenance) {
      provenance.set(collapsed.node, collapsed.indices.flatMap((matchedIndex) => {
        const node = children[matchedIndex];
        return node?.type === "Declaration" ? authoredDeclaration(node) : [];
      }));
    }
    for (const matchedIndex of collapsed.indices) consumed.add(matchedIndex);
    for (const shadowedIndex of collapsed.shadowedIndices)
      consumed.add(shadowedIndex);
  }

  const collapsedOutput: CssNode[] = [];
  for (let index = 0; index < children.length; index += 1) {
    const replacement = replacements.get(index);
    if (replacement) {
      collapsedOutput.push(replacement);
      continue;
    }
    if (!consumed.has(index)) collapsedOutput.push(children[index]);
  }

  return removeRedundantDeclarations(collapsedOutput, options);
}

function transformCssAst(
  css: string,
  options: TransformCssOptions,
  filename?: string,
  provenance?: ProvenanceStore,
): StyleSheet {
  const ast = parse(css, {
    context: "stylesheet",
    positions: filename !== undefined || Boolean(options.onDiagnostic),
    filename,
    onParseError(error) {
      options.onDiagnostic?.({ ...syntaxDiagnostic(error), code: "invalid-syntax" });
    },
  }) as StyleSheet;
  const globalCustomProperties = collectGlobalCustomProperties(ast);
  const ruleBlocks = new WeakSet<object>();

  walk(ast, {
    visit: "Rule",
    enter(rule) {
      if (rule.block) ruleBlocks.add(rule.block);
    },
  });

  walk(ast, {
    visit: "Block",
    enter(block) {
      const children = block.children.toArray();
      const localCustomProperties = collectBlockCustomProperties(children);
      const customProperties = mergeCustomProperties(
        options.customProperties,
        ruleBlocks.has(block) ? globalCustomProperties : undefined,
        localCustomProperties,
      );
      const blockOptions = scopedTransformOptions(options, customProperties);
      const transformed =
        options.mode === "expand"
          ? expandBlock(children, blockOptions, provenance)
          : collapseBlock(children, blockOptions, provenance);
      const list = new List<CssNode>();
      for (const child of transformed) list.appendData(child);
      block.children = list;
    },
  });

  return ast;
}

export function transformCss(css: string, options: TransformCssOptions): string {
  return generate(transformCssAst(css, options));
}

export function expandCss(css: string, options?: TransformOptions): string {
  return transformCss(css, { ...options, mode: "expand" });
}

export function collapseCss(css: string, options?: TransformOptions): string {
  return transformCss(css, { ...options, mode: "collapse" });
}

function transformDeclarationBlock(
  declarations: string,
  mode: TransformMode,
  options?: TransformOptions,
): string {
  const selector = ".__css_expand_collapse__";
  const prefixLength = selector.length + 1;
  const onDiagnostic = options?.onDiagnostic;
  const output = transformCss(`${selector}{${declarations}}`, {
    ...options,
    mode,
    onDiagnostic: onDiagnostic ? (diagnostic) => {
      const location = diagnostic.location;
      if (!location) {
        onDiagnostic(diagnostic);
        return;
      }
      const relative = (position: typeof location.start) => ({
        ...position,
        offset: Math.max(0, Math.min(declarations.length, position.offset - prefixLength)),
        column: position.line === 1 ? Math.max(1, position.column - prefixLength) : position.column,
      });
      onDiagnostic({
        ...diagnostic,
        location: { ...location, start: relative(location.start), end: relative(location.end) },
      });
    } : undefined,
  });
  const open = output.indexOf("{");
  const close = output.lastIndexOf("}");
  return open === -1 || close === -1 ? output : output.slice(open + 1, close);
}

export function expandDeclarations(
  declarations: string,
  options?: TransformOptions,
): string {
  return transformDeclarationBlock(declarations, "expand", options);
}

export function collapseDeclarations(
  declarations: string,
  options?: TransformOptions,
): string {
  return transformDeclarationBlock(declarations, "collapse", options);
}

export interface TransformCssSourceMapOptions extends TransformCssOptions {
  /** Name of the original CSS source. */
  filename?: string;
  /** Name of the generated CSS file. */
  outputFilename?: string;
  /** Return all contributing source declarations, including many-to-one collapse. */
  includeProvenance?: boolean;
  /** Map from the supplied CSS to its earlier original sources (flat v3 map). */
  inputSourceMap?: CssInputSourceMap;
}

export interface CssInputSourceMap {
  version: 3;
  file?: string;
  sourceRoot?: string;
  sources: string[];
  sourcesContent?: (string | null)[];
  names: string[];
  mappings: string;
}

export interface CssSourceMap {
  version: 3;
  file?: string;
  sources: string[];
  sourcesContent: (string | null)[];
  names: string[];
  mappings: string;
}

/** All contributing authored declarations for an emitted CSS declaration. */
export interface CssDeclarationProvenance {
  property: string;
  /** Zero-based declaration index in generated stylesheet traversal order. */
  declarationIndex: number;
  sources: SourceDeclaration[];
}

export interface TransformCssSourceMapResult {
  css: string;
  map: CssSourceMap;
  /** Present when includeProvenance is true. */
  provenance?: CssDeclarationProvenance[];
}

/**
 * Transform CSS and return a standard source map. Generated declarations map
 * to the source declaration start (the first consumed longhand on collapse).
 */
export function transformCssWithSourceMap(
  css: string,
  options: TransformCssSourceMapOptions,
): TransformCssSourceMapResult {
  const filename = options.filename ?? options.inputSourceMap?.file ?? "input.css";
  const provenanceStore: ProvenanceStore | undefined = options.includeProvenance ? new WeakMap() : undefined;
  const ast = transformCssAst(css, options, filename, provenanceStore);
  return generateMappedCss(ast, css, filename, options, provenanceStore);
}

/** Transform a declaration-only fragment without a synthetic selector or offset. */
export function transformDeclarationsWithSourceMap(
  css: string,
  options: TransformCssSourceMapOptions,
): TransformCssSourceMapResult {
  const filename = options.filename ?? options.inputSourceMap?.file ?? "input.css";
  const provenanceStore: ProvenanceStore | undefined = options.includeProvenance ? new WeakMap() : undefined;
  const ast = parse(css, {
    context: "declarationList",
    filename,
    positions: true,
    onParseError(error) {
      options.onDiagnostic?.({ ...syntaxDiagnostic(error), code: "invalid-syntax" });
    },
  }) as DeclarationList;
  const children = ast.children.toArray();
  const blockOptions = scopedTransformOptions(options, mergeCustomProperties(
    options.customProperties,
    collectBlockCustomProperties(children),
  ));
  const transformed = options.mode === "expand"
    ? expandBlock(children, blockOptions, provenanceStore)
    : collapseBlock(children, blockOptions, provenanceStore);
  const list = new List<CssNode>();
  for (const child of transformed) list.appendData(child);
  // DeclarationList's children are declarations or raw recovery nodes. The
  // shared block transformer preserves those types.
  ast.children = list as DeclarationList["children"];
  return generateMappedCss(ast, css, filename, options, provenanceStore);
}

function generateMappedCss(
  ast: StyleSheet | DeclarationList,
  css: string,
  filename: string,
  options: TransformCssSourceMapOptions,
  provenanceStore?: ProvenanceStore,
): TransformCssSourceMapResult {
  const provenance: CssDeclarationProvenance[] = [];
  if (provenanceStore) {
    walk(ast, {
      visit: "Declaration",
      enter(node) {
        provenance.push({
          property: node.property,
          declarationIndex: provenance.length,
          sources: provenanceStore.get(node) ?? authoredDeclaration(node),
        });
      },
    });
  }
  // CSSTree's runtime generator supports sourceMap:true; its older type
  // declarations do not consistently describe the returned map generator.
  const mappedGenerate = generate as unknown as (
    ast: StyleSheet | DeclarationList,
    options: { sourceMap: true },
  ) => { css: string; map: { toJSON(): Omit<CssSourceMap, "sourcesContent"> } };
  const generated = mappedGenerate(ast, { sourceMap: true });
  const raw = generated.map.toJSON();
  // Empty stylesheets can have no mapped source; still embed the input.
  const sources = raw.sources.length ? raw.sources : [filename];
  const map: CssSourceMap = {
    ...raw,
    version: 3,
    ...(options.outputFilename !== undefined ? { file: options.outputFilename } : {}),
    sources,
    sourcesContent: sources.map((source) => source === filename ? css : null),
  };
  return {
    css: generated.css,
    ...(provenanceStore ? { provenance } : {}),
    map: options.inputSourceMap ? composeCssMap(map, options.inputSourceMap) : map,
  };
}

/** Compose a generated-to-input map with the input-to-original map. */
function composeCssMap(map: CssSourceMap, input: CssInputSourceMap): CssSourceMap {
  if (input.version !== 3 || typeof input.mappings !== "string" || !Array.isArray(input.sources)) {
    throw new TypeError("Expected a flat version 3 input source map.");
  }
  // The outer map has exactly one source: the CSS text supplied to this API.
  // Explicit chain order avoids relying on matching intermediate filenames.
  const composed = remapping([map, input], () => null, { decodedMappings: false });
  const sources = composed.sources.map((source) => {
    if (source === null) throw new TypeError("Composed source map contains a null source.");
    return source;
  });
  if (typeof composed.mappings !== "string") {
    throw new TypeError("Expected encoded source map mappings.");
  }
  return {
    version: 3,
    ...(map.file !== undefined ? { file: map.file } : {}),
    sources,
    names: composed.names,
    mappings: composed.mappings,
    sourcesContent: composed.sourcesContent ?? composed.sources.map(() => null),
  };
}
