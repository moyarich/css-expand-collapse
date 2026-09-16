export type DeclarationMap = Record<string, string>;

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

export type ShorthandStrategy =
  | "quad"
  | "pair"
  | "triple"
  | "border-all"
  | "logical-border-axis"
  | "text-decoration"
  | "flex"
  | "flex-flow"
  | "components"
  | "slash-pair"
  | "csstree";

/**
 * Common contract implemented by every shorthand property module.
 *
 * The CSS property name comes from the module filename, so it is intentionally
 * not duplicated here. A null strategy marks a recognized shorthand that does
 * not expose a finite transform in this package (for example `all`).
 */
export interface ShorthandModule {
  readonly longhands: readonly string[];
  readonly strategy: ShorthandStrategy | null;
  readonly initialValues?: readonly string[];
  readonly expand: ShorthandExpander;
  /** Optional property-specific collapse for grammars that cannot use a generic strategy. */
  readonly collapse?: ShorthandCollapser;
}

export type TransformableShorthandModule = ShorthandModule & {
  readonly strategy: ShorthandStrategy;
};

export type ShorthandModuleMap = Readonly<Record<string, ShorthandModule>>;
export type TransformableShorthandModuleMap = Readonly<
  Record<string, TransformableShorthandModule>
>;
