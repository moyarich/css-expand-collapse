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
  /** Initial values used for shorthand expansion and optional missing-longhand filling. */
  initialValues?: readonly string[];
}

export type ShorthandDefinitionMap = Readonly<Record<string, ShorthandDefinition>>;
