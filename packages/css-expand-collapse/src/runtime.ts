import {
  getShorthandStrategy,
  supportsTransform,
  type CssomOptions,
} from "./core.js";

export type RuntimeCssomOptions = Pick<CssomOptions, "style">;

/** True when browser CSSOM is available in the current runtime. */
export function hasCssomSupport(options?: RuntimeCssomOptions): boolean {
  if (options?.style) return true;
  return typeof document !== "undefined" && typeof document.createElement === "function";
}

/**
 * True when this shorthand has a usable transform path in the current runtime.
 *
 * Pure-JavaScript strategies work in Node, extension service workers, content
 * scripts, and extension pages. CSSOM-only strategies additionally require a
 * DOM-capable runtime or an explicitly supplied mutable CSSStyleDeclaration.
 */
export function supportsRuntimeTransform(
  property: string,
  options?: RuntimeCssomOptions,
): boolean {
  if (!supportsTransform(property)) return false;
  return getShorthandStrategy(property) !== "cssom" || hasCssomSupport(options);
}
