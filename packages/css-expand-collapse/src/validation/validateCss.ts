import { validateSource } from "./validateSource.js";
import type { ValidationOptions, ValidationResult } from "./types.js";

/** Validate CSS syntax and ordinary declaration values throughout a stylesheet. */
export function validateCss(
  css: string,
  options: ValidationOptions = {},
): ValidationResult {
  return validateSource(css, "stylesheet", options);
}
