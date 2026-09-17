import { generate, List, parse, walk } from "css-tree";
import {
  collapseToShorthand,
  expandShorthand,
  type DeclarationMap,
  type TransformOptions,
} from "./core.js";
import { SHORTHAND_DEFINITIONS } from "./registry.js";

export type TransformMode = "expand" | "collapse";

export interface TransformCssOptions extends TransformOptions {
  mode: TransformMode;
}

type EffectiveDeclaration = {
  value: string;
  important: boolean;
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
  return property.trim().toLowerCase();
}

function canonicalizeCssValue(value: string): string {
  try {
    return generate(parse(value, { context: "value" })).trim();
  } catch {
    return value.trim();
  }
}

function isTransparentBlack(value: string): boolean {
  const normalized = value.toLowerCase();
  return (
    normalized === "transparent" ||
    normalized === "rgba(0,0,0,0)" ||
    normalized === "rgb(0 0 0/0)" ||
    normalized === "rgb(0 0 0 / 0)"
  );
}

function valuesEquivalent(property: string, left: string, right: string): boolean {
  const a = canonicalizeCssValue(left);
  const b = canonicalizeCssValue(right);
  if (a === b) return true;

  // Computed background-size commonly serializes the initial two-value form
  // `auto auto` as the equivalent one-value form `auto`.
  if (
    property === "background-size" &&
    ((a === "auto" && b === "auto auto") ||
      (a === "auto auto" && b === "auto"))
  ) {
    return true;
  }

  // The CSS keyword transparent is transparent black. Chromium computed styles
  // commonly serialize it as rgba(0, 0, 0, 0).
  if (property === "background-color" && isTransparentBlack(a) && isTransparentBlack(b)) {
    return true;
  }

  return false;
}

function expandBlock(children: any[], options?: TransformOptions): any[] {
  const output: any[] = [];
  for (const child of children) {
    if (child.type !== "Declaration") {
      output.push(child);
      continue;
    }
    const expanded = expandShorthand(child.property, declarationValue(child), options);
    if (!expanded) {
      output.push(child);
      continue;
    }
    for (const [property, value] of Object.entries(expanded)) {
      output.push(makeDeclaration(property, value, Boolean(child.important)));
    }
  }
  return output;
}

const COLLAPSE_CANDIDATES = Object.entries(SHORTHAND_DEFINITIONS)
  .filter(([, definition]) => definition.longhands.length > 0)
  .sort(([, a], [, b]) => b.longhands.length - a.longhands.length);

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
function removeRedundantDeclarations(children: any[], options?: TransformOptions): any[] {
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
        const entries = Object.entries(expanded);
        const changesEffectiveValue = entries.some(([longhand, longhandValue]) => {
          const current = effective.get(longhand);
          if (!declarationWouldApply(current, important)) return false;
          return !current || !valuesEquivalent(longhand, current.value, longhandValue) || current.important !== important;
        });

        // Generic strategies have a fully enumerated constituent set, so an exact
        // restatement can be removed safely. Keep property-specific CSSTree shorthands
        // conservatively because some CSS shorthands reset state beyond their primary
        // serializable longhands.
        const redundantGenericShorthand =
          definition.safeToDropWhenFullyShadowed !== false && !changesEffectiveValue;

        if (!redundantGenericShorthand) output.push(child);

        for (const [longhand, longhandValue] of entries) {
          const current = effective.get(longhand);
          if (!declarationWouldApply(current, important)) continue;
          effective.set(longhand, { value: longhandValue, important });
        }
        continue;
      }

      // We know which longhands the shorthand affects, but not their resulting values.
      // Invalidate only values this declaration can actually override.
      for (const longhand of definition.longhands) {
        const current = effective.get(longhand);
        if (declarationWouldApply(current, important)) effective.delete(longhand);
      }
      output.push(child);
      continue;
    }

    const current = effective.get(property);

    // A non-important declaration cannot override an existing !important value.
    if (!declarationWouldApply(current, important)) continue;

    // Exact repeated declarations are redundant, including longhands generated by
    // getComputedStyle()-style exporters after an equivalent shorthand.
    if (current && valuesEquivalent(property, current.value, value) && current.important === important) continue;

    output.push(child);
    effective.set(property, { value, important });
  }

  return output;
}

function overlapsCandidate(property: string, expected: Set<string>): boolean {
  const definition = SHORTHAND_DEFINITIONS[property];
  return Boolean(definition?.longhands.some((longhand) => expected.has(longhand)));
}

function hasEarlierOverlappingShorthand(
  children: any[],
  beforeIndex: number,
  expected: Set<string>,
): boolean {
  for (let cursor = 0; cursor < beforeIndex; cursor += 1) {
    const node = children[cursor];
    if (node.type !== "Declaration") continue;
    const property = normalizeProperty(node.property);
    if (overlapsCandidate(property, expected)) return true;
  }
  return false;
}

/**
 * Some shorthands have reset side effects beyond the longhands recorded in the
 * registry. They can still participate in normal collapsing, but they must not be
 * deleted merely because a later candidate covers the registered longhands.
 */
function canDropWhenFullyShadowed(property: string): boolean {
  const definition = SHORTHAND_DEFINITIONS[property];
  if (!definition) return false;
  if (definition.safeToDropWhenFullyShadowed !== undefined) {
    return definition.safeToDropWhenFullyShadowed;
  }
  return definition.safeToDropWhenFullyShadowed !== false;
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
    if (!definition || !canDropWhenFullyShadowed(property)) continue;

    // The later shorthand must replace every constituent affected by the earlier one.
    if (!definition.longhands.every((longhand) => expected.has(longhand))) continue;

    const earlierImportant = Boolean(node.important);
    // Later normal declarations cannot override an earlier !important shorthand.
    if (earlierImportant && !replacementImportant) continue;

    shadowed.push(cursor);
  }

  return shadowed;
}

/**
 * Find a collapsible shorthand starting at `index`. Longhands do not need to be
 * contiguous; unrelated declarations and comments may appear between them.
 *
 * By default every constituent longhand must be present. When
 * `fillMissingLonghands: "initial"` is enabled and a shorthand registers initial
 * values, a partial set may collapse by filling omitted constituents with those
 * initial values. That opt-in is intended for computed/export CSS; it can change the
 * cascade meaning of raw stylesheets by explicitly setting previously omitted values.
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
    if (!definition.longhands.includes(firstProperty)) continue;

    const expected = new Set(definition.longhands);
    const matches = new Map<string, { node: any; index: number }>();
    const important = Boolean(first.important);
    const canFillMissing =
      options?.fillMissingLonghands === "initial" &&
      definition.initialValues.length === definition.longhands.length;
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

    // If a prior shorthand contributes one of the missing values, blindly using the
    // CSS initial value could change semantics. Partial initial-fill collapse is only
    // allowed when there is no earlier overlapping shorthand in this block.
    if (!complete && hasEarlierOverlappingShorthand(children, index, expected)) continue;

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

  // Collapse complete longhand sets before deduping repeated values. Computed-style
  // exports often contain an earlier shorthand followed by all of its resolved
  // longhands. Some of those longhands may equal the earlier shorthand while others
  // override it. Removing the equal declarations first would make the later set look
  // incomplete and prevent replacing the earlier shorthand with the final value.
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

  // Then remove computed longhands that merely restate the shorthand. Comparison is
  // syntax-normalized so harmless serialization differences do not keep duplicates.
  return removeRedundantDeclarations(collapsedOutput, options);
}

function replaceChildren(block: any, children: any[]): void {
  const list = new List();
  for (const child of children) list.appendData(child);
  block.children = list;
}

export function transformCss(css: string, options: TransformCssOptions): string {
  const ast: any = parse(css, { context: "stylesheet" });

  walk(ast, {
    visit: "Block",
    enter(block: any) {
      const children = block.children.toArray();
      const transformed = options.mode === "expand"
        ? expandBlock(children, options)
        : collapseBlock(children, options);
      replaceChildren(block, transformed);
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

export function expandDeclarations(declarations: string, options?: TransformOptions): string {
  return transformDeclarationBlock(declarations, "expand", options);
}

export function collapseDeclarations(declarations: string, options?: TransformOptions): string {
  return transformDeclarationBlock(declarations, "collapse", options);
}
