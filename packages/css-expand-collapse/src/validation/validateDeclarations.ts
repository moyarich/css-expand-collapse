import { validateSource } from "./validateSource.js";
import type { ValidationOptions, ValidationResult } from "./types.js";

/** Validate declaration-only CSS text, retaining original source positions. */
export function validateDeclarations(
  css: string,
  options: ValidationOptions = {},
): ValidationResult {
  return validateSource(css, "declarationList", options);
}
