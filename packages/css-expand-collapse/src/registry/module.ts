import type {
  DeclarationMap,
  ShorthandExpandContext,
  ShorthandExpander,
  ShorthandStrategy,
} from "./types.js";

/**
 * Common contract implemented by every shorthand property module.
 *
 * The property name comes from the module filename, so it is intentionally not
 * duplicated here. A null strategy marks a recognized shorthand that cannot be
 * transformed as a finite longhand set (for example `all`).
 */
export interface ShorthandModule {
  readonly longhands: readonly string[];
  readonly strategy: ShorthandStrategy | null;
  readonly initialValues?: readonly string[];
  readonly expand: ShorthandExpander;
}

export type TransformableShorthandModule = ShorthandModule & {
  readonly strategy: ShorthandStrategy;
};

export type ShorthandModuleMap = Readonly<Record<string, ShorthandModule>>;
export type TransformableShorthandModuleMap = Readonly<
  Record<string, TransformableShorthandModule>
>;

export type {
  DeclarationMap,
  ShorthandExpandContext,
  ShorthandExpander,
  ShorthandStrategy,
};
