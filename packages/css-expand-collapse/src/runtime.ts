import {
  supportsTransform,
  type CssomOptions,
} from "./core.js";

/** @deprecated CSSOM is no longer required by transforms. */
export type RuntimeCssomOptions = Pick<CssomOptions, "style">;

/** @deprecated CSSOM capability no longer controls shorthand transform support. */
export function hasCssomSupport(options?: RuntimeCssomOptions): boolean {
  if (options?.style) return true;
  return typeof document !== "undefined" && typeof document.createElement === "function";
}

/**
 * True when this shorthand has a transform implementation in the current build.
 * All transformable shorthand modules are runtime-neutral and can run in Node,
 * extension service workers, content scripts, and browser pages.
 */
export function supportsRuntimeTransform(
  property: string,
  _options?: RuntimeCssomOptions,
): boolean {
  return supportsTransform(property);
}
