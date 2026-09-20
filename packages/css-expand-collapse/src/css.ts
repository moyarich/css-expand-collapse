import { generate, List, parse, walk } from "css-tree";
import {
  isCustomProperty,
  mergeCustomProperties,
  type CustomPropertyMap,
} from "./custom-properties.js";
import {
  collapseToShorthand,
  expandShorthand,
  type DeclarationMap,
  type TransformOptions,
} from "./core.js";
import {
  LONGHAND_VALUE_EQUIVALENCE,
  SHORTHAND_DEFINITIONS,
} from "./registry/index.js";
import { splitTopLevelComma } from "./registry/context.js";

export type TransformMode = "expand" | "collapse";

export interface TransformCssOptions extends TransformOptions {
  mode: TransformMode;
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

function makeDeclaration(property: string, value: string, important = false): any {
  return parse(`${property}:${value}${important ? "!important" : ""}`, {
    context: "declaration",
  });
}

function declarationValue(node: any): string {
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

function collectBlockCustomProperties(children: any[]): Record<string, string> {
  const cascade = new Map<string, CascadedCustomProperty>();

  for (let index = 0; index < children.length; index += 1) {
    const node = children[index];
    if (node?.type !== "Declaration" || !isCustomProperty(node.property)) continue;

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

function collectGlobalCustomProperties(ast: any): Record<string, string> {
  const cascade = new Map<string, CascadedCustomProperty>();
  const topLevel = ast.children?.toArray?.() ?? [];

  for (let ruleIndex = 0; ruleIndex < topLevel.length; ruleIndex += 1) {
    const rule = topLevel[ruleIndex];
    if (rule?.type !== "Rule" || !rule.block) continue;

    const specificity = globalSelectorSpecificity(generate(rule.prelude));
    if (specificity === null) continue;

    const declarations = rule.block.children?.toArray?.() ?? [];
    for (let declarationIndex = 0; declarationIndex < declarations.length; declarationIndex += 1) {
      const node = declarations[declarationIndex];
      if (node?.type !== "Declaration" || !isCustomProperty(node.property)) continue;

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

function valuesEquivalent(property: string, left: string, right: string): boolean {
  const a = canonicalizeCssValue(left);
  const b = canonicalizeCssValue(right);
  if (a === b) return true;

  return LONGHAND_VALUE_EQUIVALENCE
    .get(property)
    ?.some((equivalent) => equivalent(a, b)) ?? false;
}

function expandBlock(
  children: any[],
  options?: TransformOptions,
): any[] {
  const output: any[] = [];
  for (const child of children) {
    if (child.type !== "Declaration") {
      output.push(child);
      continue;
    }

    const expanded = expandShorthand(
      child.property,
      declarationValue(child),
      options,
    );
    if (!expanded) {
      output.push(child);
      continue;
    }

    for (const [property, value] of Object.entries(expanded.declarations)) {
      output.push(makeDeclaration(property, value, Boolean(child.important)));
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
  children: any[],
  options?: TransformOptions,
): any[] {
  const output: any[] = [];
  const effective = new Map<string, EffectiveDeclaration>();

  for (const child of children) {
    if (child.type !== "Declaration") {
      output.push(child);
      continue;
    }

    const property = normalizeProperty(child.property);
    const value = declarationValue(child);
    const important = Boolean(child.important);
    const definition = SHORTHAND_DEFINITIONS[property];

    if (definition) {
      const expanded = expandShorthand(property, value, options);

      if (expanded) {
        const entries = Object.entries(expanded.declarations);
        const changesEffectiveValue = entries.some(([longhand, longhandValue]) => {
          const current = effective.get(longhand);
          if (!declarationWouldApply(current, important)) return false;
          return !current ||
            !valuesEquivalent(longhand, current.value, longhandValue) ||
            current.important !== important;
        });

        // Modules whose registered longhand set fully describes their effect can be
        // removed when they are exact restatements. Reset-heavy shorthands opt out
        // through safeToDropWhenFullyShadowed.
        if (definition.safeToDropWhenFullyShadowed === false || changesEffectiveValue) {
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
        if (declarationWouldApply(current, important)) effective.delete(longhand);
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

function overlapsCandidate(property: string, expected: Set<string>): boolean {
  const definition = SHORTHAND_DEFINITIONS[property];
  return Boolean(
    definition &&
    [...definition.longhands.keys()].some((longhand) => expected.has(longhand)),
  );
}

function findFullyShadowedEarlierShorthands(
  children: any[],
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
    if (!definition || definition.safeToDropWhenFullyShadowed === false) continue;

    if (![...definition.longhands.keys()].every((longhand) => expected.has(longhand))) {
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
  children: any[],
  index: number,
  consumed: Set<number>,
  options?: TransformOptions,
): { node: any; indices: number[]; shadowedIndices: number[] } | null {
  const first = children[index];
  if (!first || first.type !== "Declaration" || consumed.has(index)) return null;

  const firstProperty = normalizeProperty(first.property);

  for (const [shorthand, definition] of COLLAPSE_CANDIDATES) {
    if (!definition.longhands.has(firstProperty)) continue;

    const expected = new Set(definition.longhands.keys());
    const matches = new Map<string, { node: any; index: number }>();
    const important = Boolean(first.important);
    const canFillMissing = options?.fillMissingLonghands === "initial";
    let blocked = false;

    for (let cursor = index; cursor < children.length; cursor += 1) {
      if (consumed.has(cursor)) continue;
      const node = children[cursor];
      if (node.type !== "Declaration") continue;

      const property = normalizeProperty(node.property);

      if (expected.has(property)) {
        if (Boolean(node.important) !== important || matches.has(property)) {
          blocked = true;
          break;
        }
        matches.set(property, { node, index: cursor });
        if (matches.size === expected.size) break;
        continue;
      }

      if (overlapsCandidate(property, expected)) {
        blocked = true;
        break;
      }
    }

    if (blocked) continue;

    const complete = matches.size === expected.size;
    if (!complete && !canFillMissing) continue;

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
      if (earlierOverlap) continue;
    }

    const declarations: DeclarationMap = {};
    for (const [property, match] of matches) {
      declarations[property] = declarationValue(match.node);
    }

    const collapsed = collapseToShorthand(shorthand, declarations, options);
    if (!collapsed) continue;

    return {
      node: makeDeclaration(collapsed.property, collapsed.value, important),
      indices: [...matches.values()].map((match) => match.index),
      shadowedIndices: complete
        ? findFullyShadowedEarlierShorthands(children, index, expected, important)
        : [],
    };
  }

  return null;
}

function collapseBlock(children: any[], options?: TransformOptions): any[] {
  const consumed = new Set<number>();
  const replacements = new Map<number, any>();

  for (let index = 0; index < children.length; index += 1) {
    if (consumed.has(index)) continue;

    const collapsed = tryCollapseAt(children, index, consumed, options);
    if (!collapsed) continue;

    replacements.set(index, collapsed.node);
    for (const matchedIndex of collapsed.indices) consumed.add(matchedIndex);
    for (const shadowedIndex of collapsed.shadowedIndices) consumed.add(shadowedIndex);
  }

  const collapsedOutput: any[] = [];
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

export function transformCss(css: string, options: TransformCssOptions): string {
  const ast: any = parse(css, { context: "stylesheet" });
  const globalCustomProperties = collectGlobalCustomProperties(ast);
  const ruleBlocks = new WeakSet<object>();

  walk(ast, {
    visit: "Rule",
    enter(rule: any) {
      if (rule.block) ruleBlocks.add(rule.block);
    },
  });

  walk(ast, {
    visit: "Block",
    enter(block: any) {
      const children = block.children.toArray();
      const localCustomProperties = collectBlockCustomProperties(children);
      const customProperties = mergeCustomProperties(
        options.customProperties,
        ruleBlocks.has(block) ? globalCustomProperties : undefined,
        localCustomProperties,
      );
      const blockOptions = scopedTransformOptions(options, customProperties);
      const transformed = options.mode === "expand"
        ? expandBlock(children, blockOptions)
        : collapseBlock(children, blockOptions);
      const list = new List();
      for (const child of transformed) list.appendData(child);
      block.children = list;
    },
  });

  return generate(ast);
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
  const output = transformCss(`${selector}{${declarations}}`, { ...options, mode });
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

export function collapseDeclarations(declarations: string, options?: TransformOptions): string {
  return transformDeclarationBlock(declarations, "collapse", options);
}
