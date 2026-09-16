export type DeclarationMap = Record<string, string>;

export interface ShorthandExpandContext {
  matchProperty(property: string, value: string): boolean;
  splitWhitespace(value: string): string[];
  splitSlash(value: string): string[];
  cssom(value: string): DeclarationMap | null;
}

export type ShorthandExpander = (
  value: string,
  context: ShorthandExpandContext,
) => DeclarationMap | null;

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
  | "cssom";

export interface ShorthandDefinition {
  longhands: readonly string[];
  strategy: ShorthandStrategy;
  /** Initial values used for optional missing-longhand filling during collapse. */
  initialValues?: readonly string[];
  /** Expansion is owned by the shorthand module itself. */
  expand: ShorthandExpander;
}

export type ShorthandDefinitionMap = Readonly<Record<string, ShorthandDefinition>>;
