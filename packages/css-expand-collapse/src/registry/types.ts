import type {
  TransformableShorthandModule,
  TransformableShorthandModuleMap,
} from "./module.js";

export type {
  DeclarationMap,
  ShorthandCollapseContext,
  ShorthandCollapser,
  ShorthandExpandContext,
  ShorthandExpander,
  ShorthandModule,
  ShorthandModuleMap,
  ShorthandStrategy,
  TransformableShorthandModule,
  TransformableShorthandModuleMap,
} from "./module.js";

/** @deprecated Use `TransformableShorthandModule`. */
export type ShorthandDefinition = TransformableShorthandModule;

/** @deprecated Use `TransformableShorthandModuleMap`. */
export type ShorthandDefinitionMap = TransformableShorthandModuleMap;
