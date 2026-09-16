export type ShorthandStrategy =
  | "quad"
  | "pair"
  | "triple"
  | "border-all"
  | "text-decoration"
  | "flex-flow"
  | "unsupported";

export interface ShorthandDefinition {
  longhands: readonly string[];
  strategy: ShorthandStrategy;
}

export type ShorthandDefinitionMap = Readonly<Record<string, ShorthandDefinition>>;
