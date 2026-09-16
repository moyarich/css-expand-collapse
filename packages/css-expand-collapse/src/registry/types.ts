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
  /** Initial values used only when callers explicitly allow filling missing longhands. */
  initialValues?: readonly string[];
}

export type ShorthandDefinitionMap = Readonly<Record<string, ShorthandDefinition>>;
