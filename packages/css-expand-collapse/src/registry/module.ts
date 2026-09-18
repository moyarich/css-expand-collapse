export type DeclarationMap = Record<string, string>;
export type LonghandMap = ReadonlyMap<string, string>;
export type LonghandValueEquivalence = (left: string, right: string) => boolean;

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
  /** Property-specific equivalence rules for alternate longhand serializations. */
  readonly equivalentLonghandValues?: ReadonlyMap<string, LonghandValueEquivalence>;
  /** False when a shorthand has cascade/reset effects beyond its registered longhands. */
  readonly safeToDropWhenFullyShadowed?: boolean;
}

export type ShorthandModuleMap = Readonly<Record<string, ShorthandModule>>;
